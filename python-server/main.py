from fastapi import FastAPI, Request
from agents import support_agent, dashboard_agent
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from mock_data import clients, orders, payments, courses, classes, attendance
from datetime import datetime, timedelta
from typing import Dict, List
import json
from tools import external_api
import httpx
import datetime

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session memory: {session_id: [ {"role": "user"|"agent", "content": str}, ... ] }
session_memory: Dict[str, List[dict]] = {}
MEMORY_LIMIT = 10

@app.post("/api/support")
async def support_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")
    session_id = data.get("session_id") or data.get("sessionId")
    preferred_language = data.get("preferredLanguage", "en")
    if not session_id:
        return {"success": False, "error": "Missing session_id"}
    # Add language instruction if needed
    if preferred_language and preferred_language != "en":
        lang_map = {
            "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "ml": "Malayalam", "gu": "Gujarati", "pa": "Punjabi", "or": "Odia", "ur": "Urdu"
        }
        lang_name = lang_map.get(preferred_language, preferred_language)
        query = f"Please answer in {lang_name}: {query}"
    # Get recent context for this session
    history = session_memory.get(session_id, [])
    # Compose context string (simple: join last N messages)
    context = "\n".join([
        f"{msg['role']}: {msg['content']}" for msg in history
    ])
    # Prepend context to the query if any
    full_query = f"Context:\n{context}\nUser: {query}" if context else query
    agent = support_agent()
    result = agent.run({"input": full_query})
    # Update memory
    new_history = history + [
        {"role": "user", "content": query},
        {"role": "agent", "content": result}
    ]
    session_memory[session_id] = new_history[-MEMORY_LIMIT:]
    return {"success": True, "result": result}

def map_analytics_query(query: str):
    q = query.lower()
    if "monthly revenue" in q or "revenue trends" in q or "enrollment trends" in q:
        return '{"queryType": "enrollmentTrends"}'
    if "active clients" in q:
        return '{"queryType": "activeClients"}'
    if "inactive clients" in q:
        return '{"queryType": "inactiveClients"}'
    if "top performing services" in q or "top services" in q or "top enrolled courses" in q:
        return '{"queryType": "topServices"}'
    if "outstanding payments" in q or "pending payments" in q:
        return '{"queryType": "outstandingPayments"}'
    if "course completion rate" in q or "completion rate" in q:
        return '{"queryType": "courseCompletionRates"}'
    if "attendance reports" in q or "attendance percentage" in q:
        return '{"queryType": "attendanceReports"}'
    if "drop off rate" in q or "drop-off rate" in q:
        return '{"queryType": "dropOffRates"}'
    if "birthday reminders" in q:
        return '{"queryType": "birthdayReminders"}'
    if "new clients this month" in q:
        return '{"queryType": "newClientsThisMonth"}'
    # New: handle course/class listing queries
    if ("all courses" in q or "courses available" in q or "available courses" in q or "list courses" in q):
        return '{"collection": "courses", "operation": "find"}'
    if ("all classes" in q or "classes available" in q or "available classes" in q or "list classes" in q):
        return '{"collection": "classes", "operation": "find"}'
    if "classes available this week" in q or "what classes are available this week" in q or "upcoming classes" in q:
        # Calculate the current week range
        today = datetime.date.today()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)
        return json.dumps({
            "collection": "classes",
            "filter": {
                "status": "active",
                "startDate": {
                    "$gte": start_of_week.strftime("%Y-%m-%d"),
                    "$lte": end_of_week.strftime("%Y-%m-%d")
                }
            },
            "operation": "find"
        })
    return None

@app.post("/api/dashboard")
async def dashboard_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")
    session_id = data.get("session_id") or data.get("sessionId")
    preferred_language = data.get("preferredLanguage", "en")
    print(session_id)
    if not session_id:
        return {"success": False, "error": "Missing session_id"}
    # Add language instruction if needed
    if preferred_language and preferred_language != "en":
        lang_map = {
            "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "ml": "Malayalam", "gu": "Gujarati", "pa": "Punjabi", "or": "Odia", "ur": "Urdu"
        }
        lang_name = lang_map.get(preferred_language, preferred_language)
        query = f"Please answer in {lang_name}: {query}"
    history = session_memory.get(session_id, [])
    context = "\n".join([
        f"{msg['role']}: {msg['content']}" for msg in history
    ])
    mapped_query = map_analytics_query(query)
    if mapped_query:
        try:
            full_query = json.loads(mapped_query)  # Use parsed JSON, not string
        except Exception as e:
            return {"success": False, "error": f"Invalid mapped query: {e}"}
    else:
        full_query = f"Context:\n{context}\nUser: {query}" if context else query
    print("FULL QUERY TO DASHBOARD AGENT:", full_query)
    try:
        result = dashboard_agent().run({"input": full_query})
    except Exception as e:
        return {"success": False, "error": str(e)}
    if not result or "could not process" in str(result).lower():
        return {"success": False, "error": "Agent could not process the query."}
    new_history = history + [
        {"role": "user", "content": query},
        {"role": "agent", "content": result}
    ]
    session_memory[session_id] = new_history[-MEMORY_LIMIT:]
    return {"success": True, "result": result}

@app.get("/api/languages")
def get_supported_languages():
    return {
        "success": True,
        "languages": {
            "en": "English",
            "hi": "Hindi",
            "ta": "Tamil",
            "te": "Telugu",
            "bn": "Bengali",
            "mr": "Marathi",
            "kn": "Kannada",
            "ml": "Malayalam",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "or": "Odia",
            "ur": "Urdu"
        }
    }

@app.get("/api/metrics")
def get_dashboard_metrics():
    # Total revenue
    total_revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "completed")
    # Outstanding payments
    outstanding = sum(p.get("amount", 0) for p in payments if p.get("status") == "pending")
    # Active/inactive clients
    active_clients = sum(1 for c in clients if c.get("status") == "active")
    inactive_clients = sum(1 for c in clients if c.get("status") == "inactive")
    # Total orders
    total_orders = len(orders)
    # Average order value
    avg_order = sum(o.get("amount", 0) for o in orders) / len(orders) if orders else 0
    # New clients this month
    now = datetime.now()
    first_of_month = datetime(now.year, now.month, 1)
    new_clients = sum(1 for c in clients if c.get("created_at") and datetime.strptime(c["created_at"], "%Y-%m-%d") >= first_of_month)
    # Birthday reminders (next 7 days)
    today = datetime.now()
    in_seven = today + timedelta(days=7)
    birthday_reminders = [
        {"name": c["name"], "birthday": c["birthday"]}
        for c in clients
        if c.get("birthday") and today.strftime("%m-%d") <= c["birthday"][5:] <= in_seven.strftime("%m-%d")
    ]
    # Enrollment trends (last 3 months)
    enrollment_trends = []
    for i in range(3):
        month = (now.month - i - 1) % 12 + 1
        year = now.year if now.month - i > 0 else now.year - 1
        count = sum(1 for o in orders if o.get("created_at") and datetime.strptime(o["created_at"], "%Y-%m-%d").year == year and datetime.strptime(o["created_at"], "%Y-%m-%d").month == month)
        enrollment_trends.append({
            "month": f"{year}-{month:02d}",
            "enrollments": count
        })
    enrollment_trends.reverse()
    # Top services
    service_counts = {}
    for o in orders:
        service = o.get("service")
        if service:
            service_counts[service] = service_counts.get(service, 0) + 1
    top_services = [
        {"name": name, "enrollments": count}
        for name, count in sorted(service_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    ]
    # Attendance
    class_attendance = {}
    for a in attendance:
        class_name = a.get("class")
        if class_name:
            class_attendance.setdefault(class_name, []).append(a.get("percentage", 0))
    attendance_list = [
        {"class": name, "percentage": int(sum(pcts)/len(pcts))}
        for name, pcts in class_attendance.items()
    ]
    # Completion rates
    completion_rates = [
        {"course": c["name"], "rate": c.get("completion_rate", 0)}
        for c in courses if "completion_rate" in c
    ]
    # Drop-off rates
    drop_off_rates = [
        {"class": c["name"], "rate": c.get("drop_off_rate", 0)}
        for c in classes if "drop_off_rate" in c
    ]
    return {
        "success": True,
        "totalRevenue": total_revenue,
        "outstandingPayments": outstanding,
        "activeClients": active_clients,
        "inactiveClients": inactive_clients,
        "totalOrders": total_orders,
        "avgOrderValue": round(avg_order, 2),
        "newClientsThisMonth": new_clients,
        "birthdayReminders": birthday_reminders,
        "enrollmentTrends": enrollment_trends,
        "topServices": top_services,
        "attendance": attendance_list,
        "completionRates": completion_rates,
        "dropOffRates": drop_off_rates
    }

@app.get("/api/memory/stats")
def get_memory_stats():
    # Number of active conversations (unique session IDs)
    active_conversations = len(session_memory)
    # Retention period (hardcoded for now)
    retention_hours = 24
    return {
        "success": True,
        "stats": {
            "activeConversations": active_conversations,
            "retentionHours": retention_hours
        }
    }

@app.post("/api/external-demo")
async def external_demo_endpoint(request: Request):
    data = await request.json()
    type_ = data.get("type")
    data_obj = data.get("data", {})
    if not type_:
        return {"success": False, "error": "Missing 'type' in request body."}
    # Call the mock ExternalAPITool
    import json as _json
    result = external_api(_json.dumps({"type": type_, "data": data_obj}))
    return {"success": True, "result": result}
