# AgentServe.Ai - Multi-Agent System

A sophisticated multi-agent system built with LangChain and Python FastAPI, featuring two specialized agents for support services and business analytics.

## 🚀 Features

### Agent 1: Support Agent
- **Client Data Management**: Search by name, email, or phone
- **Order Management**: Track orders and payment status
- **Payment Information**: Retrieve payment details and calculate dues
- **Course/Class Discovery**: List upcoming services and filter by instructor
- **External API Integration**: Create new clients and orders

### Agent 2: Dashboard Agent
- **Revenue Analytics**: Total revenue and outstanding payments
- **Client Insights**: Active/inactive client analysis and birthday reminders
- **Service Analytics**: Enrollment trends and course completion rates
- **Attendance Reports**: Attendance percentages and drop-off rates

## 🛠 Tech Stack

- **Python** - Programming language
- **FastAPI** - Web framework for building APIs
- **LangChain** - AI agent framework
- **Google Gemini 2.0** - LLM for natural language processing
- **MongoDB** - Database for data persistence

## 📋 Prerequisites

- Python 3.9+
- MongoDB (local or cloud instance)
- Google Gemini API key

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgentServe.Ai
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   Copy the example environment file and edit it:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - `PORT`: Server port (default: 8000)

5. **Start the application**
   ```bash
   uvicorn src.main:app --reload
   ```

## 📊 Database Schema

### Collections Structure

#### clients
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  enrollmentDate: Date,
  status: String, // 'active', 'inactive'
  enrolledServices: [String]
}
```

#### orders
```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  serviceId: String,
  amount: Number,
  status: String, // 'paid', 'pending', 'cancelled'
  orderDate: Date,
  paymentDate: Date
}
```

#### payments
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,
  amount: Number,
  paymentMethod: String,
  paymentDate: Date,
  status: String
}
```

#### courses
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  duration: Number,
  price: Number,
  instructor: String,
  status: String // 'active', 'inactive'
}
```

#### classes
```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  instructor: String,
  startTime: Date,
  endTime: Date,
  maxCapacity: Number,
  enrolledStudents: [ObjectId],
  status: String // 'scheduled', 'ongoing', 'completed', 'cancelled'
}
```

#### attendance
```javascript
{
  _id: ObjectId,
  classId: ObjectId,
  clientId: ObjectId,
  date: Date,
  status: String // 'present', 'absent', 'late'
}
```

## 🔌 API Endpoints

### Support Agent Endpoints

#### POST /api/support/query
Handle natural language queries for support services.

**Request Body:**
```json
{
  "query": "What classes are available this week?",
  "context": "optional additional context"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on the current schedule, the following classes are available this week...",
  "data": {
    "classes": [...],
    "metadata": {...}
  }
}
```

### Dashboard Agent Endpoints

#### POST /api/dashboard/analytics
Get business analytics and metrics.

**Request Body:**
```json
{
  "query": "How much revenue did we generate this month?",
  "filters": {
    "dateRange": "this_month",
    "category": "revenue"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your revenue for this month is $15,750...",
  "data": {
    "revenue": 15750,
    "breakdown": {...},
    "comparison": {...}
  }
}
```

## 💬 Sample Queries

### Support Agent Queries
- "What classes are available this week?"
- "Has order #12345 been paid?"
- "Create an order for Yoga Beginner for client Priya Sharma"
- "Show me all active clients"
- "What's the payment status for client john@example.com?"

### Dashboard Agent Queries
- "How much revenue did we generate this month?"
- "Which course has the highest enrollment?"
- "What is the attendance percentage for Pilates?"
- "How many inactive clients do we have?"
- "Show me birthday reminders for this month"

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📁 Project Structure

```
AgentServe.Ai/
├── src/
│   ├── agents/
│   │   ├── supportAgent.js
│   │   └── dashboardAgent.js
│   ├── tools/
│   │   ├── mongodbTool.js
│   │   └── externalApiTool.js
│   ├── config/
│   │   ├── database.js
│   │   └── llm.js
│   ├── models/
│   │   └── schemas.js
│   ├── routes/
│   │   ├── support.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── helpers.js
│   └── index.js
├── tests/
├── package.json
├── env.example
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 
