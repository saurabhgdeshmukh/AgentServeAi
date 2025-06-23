from langchain.tools import tool
import mock_data
import json
import re
from datetime import datetime
try:
    from sentence_transformers import SentenceTransformer, util
    _has_st = True
except ImportError:
    _has_st = False
    SentenceTransformer = None
    util = None

@tool("MongoDBTool", return_direct=True)
def mongo_query(input: str = None, **kwargs):
    """
    Query mock MongoDB data using a MongoDB-style query or analytics queryType.
    Input: JSON string or direct kwargs.
    If 'queryType' is present, run analytics logic.
    If 'collection' is present, run collection query logic.
    """
    import json
    from mock_data import clients, orders, payments, courses, classes, attendance
    from datetime import datetime

    try:
        if input:
            params = json.loads(input)
        else:
            params = kwargs

        # --- Analytics logic (queryType) ---
        query_type = params.get("queryType")
        if query_type:
            now = datetime.now()
            current_month = now.month
            current_year = now.year
            first_of_month = datetime(current_year, current_month, 1)

            if query_type == "revenue":
                revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "paid")
                return json.dumps({"success": True, "revenue": revenue, "currency": "USD"})
            # ... (add other queryTypes as in your Node.js logic)
            # e.g. monthlyRevenue, inactiveClients, etc.
            return json.dumps({"success": False, "error": f"Unknown queryType: {query_type}"})

        # --- Collection logic (existing) ---
        data_map = {
            "clients": clients,
            "orders": orders,
            "payments": payments,
            "courses": courses,
            "classes": classes,
            "attendance": attendance,
        }
        collection = params.get("collection")
        filter_ = params.get("filter", {})
        projection = params.get("projection")
        operation = params.get("operation", "find")
        field = params.get("field")
        if collection not in data_map:
            return json.dumps({"success": False, "error": "Invalid collection name"})
        filtered = [item for item in data_map[collection] if all(item.get(k) == v for k, v in filter_.items())]
        if projection:
            filtered = [{k: v for k, v in item.items() if projection.get(k)} for item in filtered]
        if operation == "count":
            return json.dumps({"success": True, "count": len(filtered)})
        elif operation == "sum":
            if not field:
                return json.dumps({"success": False, "error": "'field' required for sum operation"})
            total = sum(item.get(field, 0) for item in filtered if isinstance(item.get(field, 0), (int, float)))
            return json.dumps({"success": True, "sum": total})
        else:  # find
            if not filtered:
                return json.dumps({"success": False, "error": "No data found for this query."})
            return json.dumps({"success": True, "data": filtered})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool("ExternalAPITool", return_direct=True)
def external_api(data: str):
    """Create new clients or orders via the external API."""
    try:
        params = json.loads(data)
        type_ = params.get("type")
        data_obj = params.get("data", {})
        if not isinstance(data_obj, dict):
            return json.dumps({"success": False, "error": "'data' must be a dictionary"})
        return json.dumps({"success": True, "created": {**data_obj, "id": "mock_" + str(hash(str(data_obj)))}})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# Prepare a simple corpus from mock_data for RAG
corpus = []
corpus_meta = []
for c in mock_data.courses:
    corpus.append(c.get("description", ""))
    corpus_meta.append({"type": "course", "name": c.get("name", "")})
for cl in mock_data.classes:
    corpus.append(cl.get("description", ""))
    corpus_meta.append({"type": "class", "name": cl.get("name", "")})
for cli in mock_data.clients:
    if cli.get("notes"):
        corpus.append(cli["notes"])
        corpus_meta.append({"type": "client", "name": cli.get("name", "")})

if _has_st and corpus:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    corpus_embeddings = model.encode(corpus, convert_to_tensor=True)
else:
    model = None
    import torch
    corpus_embeddings = torch.empty((0, 384))  # 384 is the embedding size for MiniLM

@tool("RAGTool", return_direct=True)
def rag_tool(query: str):
    """Retrieve relevant context from courses, classes, and client notes for a given query."""
    if not _has_st:
        return json.dumps({"success": False, "error": "sentence-transformers not installed."})
    if not corpus or corpus_embeddings.shape[0] == 0:
        return json.dumps({"success": False, "error": "No RAG data available."})
    query_embedding = model.encode(query, convert_to_tensor=True)
    hits = util.semantic_search(query_embedding, corpus_embeddings, top_k=3)[0]
    results = []
    for hit in hits:
        idx = hit['corpus_id']
        score = hit['score']
        meta = corpus_meta[idx]
        text = corpus[idx]
        results.append({"meta": meta, "text": text, "score": float(score)})
    return json.dumps({"success": True, "results": results})

@tool("MongoDBTool", return_direct=True)
def mongo_db_tool(input: str):
    """
    MongoDB aggregation for analytics and business metrics.
    Input: JSON string with a 'queryType' field (e.g., 'revenue', 'inactiveClients', etc.)
    Supported queryTypes: 'revenue', 'inactiveClients', 'activeClients', ...
    """
    try:
        from mock_data import clients, orders, payments, courses, classes, attendance
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        first_of_month = datetime(current_year, current_month, 1)
        parsed = json.loads(input) if isinstance(input, str) else input
        query_type = parsed.get("queryType")

        # (Paste the relevant logic for each queryType from the previous message here)
        # For example:
        if query_type == "revenue":
            revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "paid")
            return json.dumps({"success": True, "revenue": revenue})
        elif query_type == "inactiveClients":
            inactive_clients = [c for c in clients if c.get("status") == "inactive"]
            return json.dumps({"success": True, "inactiveClients": inactive_clients, "count": len(inactive_clients)})
        # ... (add other cases as needed)
        else:
            return json.dumps({"error": "Unknown queryType", "availableTypes": ["revenue", "inactiveClients", ...]})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})