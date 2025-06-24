clients = [
    {"id": "c1", "name": "Alice Smith", "email": "alice@example.com", "phone": "123-456-7890", "status": "active", "enrolledServices": ["Course A", "Course B"]},
    {"id": "c2", "name": "Bob Johnson", "email": "bob@example.com", "phone": "987-654-3210", "status": "inactive", "enrolledServices": ["Course C"]},
    {"id": "c3", "name": "Charlie Brown", "email": "charlie@example.com", "phone": "555-111-2222", "status": "active", "enrolledServices": ["Course A"]},
    {"id": "c4", "name": "Diana Prince", "email": "diana@example.com", "phone": "444-888-7777", "status": "active", "enrolledServices": ["Course C", "Course D"]},
    {"id": "c5", "name": "Evan Wright", "email": "evan@example.com", "phone": "222-333-4444", "status": "inactive", "enrolledServices": []},
]


orders = [
    {"id": "o1", "clientId": "c1", "amount": 200, "status": "paid"},
    {"id": "o2", "clientId": "c2", "amount": 150, "status": "pending"},
    {"id": "o3", "clientId": "c3", "amount": 100, "status": "completed"},
    {"id": "o4", "clientId": "c4", "amount": 250, "status": "completed"},
    {"id": "o5", "clientId": "c5", "amount": 120, "status": "cancelled"},
]


payments = [
    {"id": "p1", "clientId": "c1", "orderId": "o1", "amount": 200, "status": "completed"},
    {"id": "p2", "clientId": "c2", "orderId": "o2", "amount": 150, "status": "pending"},
    {"id": "p3", "clientId": "c3", "orderId": "o3", "amount": 100, "status": "completed"},
    {"id": "p4", "clientId": "c4", "orderId": "o4", "amount": 250, "status": "completed"},
    {"id": "p5", "clientId": "c5", "orderId": "o5", "amount": 120, "status": "failed"},
]


courses = [
    {"id": "courseA", "title": "React for Beginners", "instructor": "Jane Doe"},
    {"id": "courseC", "title": "Node.js Essentials", "instructor": "John Smith"},
    {"id": "courseB", "title": "Advanced JavaScript", "instructor": "Mike Ross"},
    {"id": "courseD", "title": "Python for Data Science", "instructor": "Sara Lee"},
]


classes = [
    {"id": "class1", "courseId": "courseA", "title": "React Basics", "startDate": "2023-07-01", "status": "active", "instructor": "Jane Doe"},
    {"id": "class2", "courseId": "courseC", "title": "Node.js Fundamentals", "startDate": "2023-07-15", "status": "active", "instructor": "John Smith"},
    {"id": "class3", "courseId": "courseB", "title": "JS Scope and Closures", "startDate": "2023-07-20", "status": "completed", "instructor": "Mike Ross"},
    {"id": "class4", "courseId": "courseD", "title": "Intro to Pandas", "startDate": "2023-08-01", "status": "active", "instructor": "Sara Lee"},
    {"id": "class5", "courseId": "courseD", "title": "Data Viz with Matplotlib", "startDate": "2023-08-10", "status": "upcoming", "instructor": "Sara Lee"},
]


attendance = [
    {"id": "att1", "classId": "class1", "clientId": "c1", "date": "2023-07-02", "status": "present"},
    {"id": "att2", "classId": "class1", "clientId": "c2", "date": "2023-07-02", "status": "absent"},
    {"id": "att3", "classId": "class2", "clientId": "c1", "date": "2023-07-16", "status": "present"},
    {"id": "att4", "classId": "class2", "clientId": "c4", "date": "2023-07-16", "status": "present"},
    {"id": "att5", "classId": "class3", "clientId": "c3", "date": "2023-07-21", "status": "present"},
    {"id": "att6", "classId": "class3", "clientId": "c1", "date": "2023-07-21", "status": "absent"},
    {"id": "att7", "classId": "class4", "clientId": "c4", "date": "2023-08-02", "status": "present"},
    {"id": "att8", "classId": "class4", "clientId": "c1", "date": "2023-08-02", "status": "present"},
]
