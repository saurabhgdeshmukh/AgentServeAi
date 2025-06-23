from fastapi import FastAPI, Request
from agents import support_agent, dashboard_agent
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from mock_data import clients, orders, payments, courses, classes, attendance
from datetime import datetime, timedelta

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:5173"] for Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/support")
async def support_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")
    agent = support_agent()
    result = agent.run({"input": query})
    return {"success": True, "result": result}

@app.post("/api/dashboard")
async def dashboard_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")
    agent = dashboard_agent()
    result = agent.run({"input": query})

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
    total_revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "paid")
    # Outstanding payments
    outstanding = sum(p.get("amount", 0) for p in payments if p.get("status") == "pending")
    # Active/inactive clients
    active_clients = sum(1 for c in clients if c.get("active"))
    inactive_clients = sum(1 for c in clients if not c.get("active"))
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
