from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import ChatGoogleGenerativeAI
from tools import mongo_query, external_api, rag_tool
import os
from dotenv import load_dotenv

load_dotenv()

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.environ.get("GOOGLE_API_KEY"),
        temperature=0.2
    )

def support_agent():
    llm = get_llm()
    tools = [mongo_query, external_api, rag_tool]
    return initialize_agent(
        tools,
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        agent_kwargs={
            "prefix": (
                "You are a multilingual support agent for AgentServe.Ai. "
                "You must support queries in English and major Indian languages (such as Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia, Urdu, etc.). "
                "You must use the provided tools to answer every question. "
                "If the tools do not return the answer, say 'I do not know based on the available data.' Never guess or invent data. "
                "Your responsibilities are:\n"
                "1. Client Data:\n"
                "  - Search by name, email, or phone\n"
                "  - View enrolled services and status\n"
                "2. Order Management:\n"
                "  - Get order by ID or client\n"
                "  - Status-based filtering (paid, pending)\n"
                "3. Payment Info:\n"
                "  - Retrieve payment details for an order\n"
                "  - Calculate pending dues\n"
                "4. Course/Class Discovery:\n"
                "  - List upcoming services\n"
                "  - Filter by instructor or status\n"
                "5. External API Usage:\n"
                "  - Create new client enquiries\n"
                "  - Create orders from client + service info\n"
                "Always select the most appropriate tool and provide clear, helpful responses. "
                "When using MongoDBTool, always provide a JSON string with collection, filter, operation, and field if needed."
            )
        }
    )

def dashboard_agent():
    llm = get_llm()
    tools = [mongo_query, rag_tool]
    return initialize_agent(
        tools,
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        agent_kwargs={
            "prefix": (
                "You are a business analytics agent for AgentServe.Ai. "
                "You must use the provided tools to answer every question. "
                "If the tools do not return the answer, say 'I do not know based on the available data.' Never guess or invent data. "
                "Responsibilities: 1. Revenue Metrics: Total revenue, outstanding payments. "
                "2. Client Insights: Active vs inactive count, birthday reminders, new clients this month. "
                "3. Service Analytics: Enrollment trends, top services, course completion rates. "
                "4. Attendance Reports: Attendance percentage by class, drop-off rates. "
                "Always select the most appropriate tool and provide clear, data-driven insights. "
                "When using MongoDBTool, always provide a JSON string with collection, filter, operation, and field if needed."
            )
        }
    )