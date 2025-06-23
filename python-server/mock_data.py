clients = [
    {"id": "c1", "name": "Alice Smith", "email": "alice@example.com", "phone": "123-456-7890", "status": "active", "enrolledServices": ["Course A", "Course B"]},
    {"id": "c2", "name": "Bob Johnson", "email": "bob@example.com", "phone": "987-654-3210", "status": "inactive", "enrolledServices": ["Course C"]},
]

orders = [
    {"id": "o1", "clientId": "c1", "amount": 200, "status": "completed"},
    {"id": "o2", "clientId": "c2", "amount": 150, "status": "pending"},
]

payments = [
    {"id": "p1", "clientId": "c1", "orderId": "o1", "amount": 200, "status": "completed"},
    {"id": "p2", "clientId": "c2", "orderId": "o2", "amount": 150, "status": "pending"},
]

courses = [
    {"id": "courseA", "title": "React for Beginners", "instructor": "Jane Doe"},
    {"id": "courseC", "title": "Node.js Essentials", "instructor": "John Smith"},
]

classes = [
    {"id": "class1", "courseId": "courseA", "title": "React Basics", "startDate": "2023-07-01", "status": "active", "instructor": "Jane Doe"},
    {"id": "class2", "courseId": "courseC", "title": "Node.js Fundamentals", "startDate": "2023-07-15", "status": "active", "instructor": "John Smith"},
]

attendance = [
    {"id": "att1", "classId": "class1", "clientId": "c1", "date": "2023-07-02", "status": "present"},
    {"id": "att2", "classId": "class1", "clientId": "c2", "date": "2023-07-02", "status": "absent"},
    {"id": "att3", "classId": "class2", "clientId": "c1", "date": "2023-07-16", "status": "present"},
]