import { Client, Order, Payment, Course, Class, Attendance } from '../models/models.js';

export const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Clear existing data
    await Client.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});

    // Create Courses
    const courses = await Course.create([
      {
        title: 'Yoga Beginner',
        description: 'Introduction to yoga for beginners',
        instructor: 'Sarah Johnson',
        duration: '60 minutes',
        price: 25.00,
        status: 'active'
      },
      {
        title: 'Advanced Pilates',
        description: 'Advanced pilates techniques',
        instructor: 'Mike Chen',
        duration: '45 minutes',
        price: 30.00,
        status: 'active'
      },
      {
        title: 'Zumba Fitness',
        description: 'High-energy dance fitness',
        instructor: 'Maria Rodriguez',
        duration: '60 minutes',
        price: 20.00,
        status: 'active'
      },
      {
        title: 'Meditation & Mindfulness',
        description: 'Stress relief and mental wellness',
        instructor: 'David Kim',
        duration: '30 minutes',
        price: 15.00,
        status: 'active'
      },
      {
        title: 'Strength Training',
        description: 'Build muscle and strength',
        instructor: 'Alex Thompson',
        duration: '45 minutes',
        price: 35.00,
        status: 'active'
      }
    ]);

    // Create Clients
    const clients = await Client.create([
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1990-05-15'),
        enrolledServices: ['Yoga Beginner'],
        status: 'active'
      },
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0102',
        dateOfBirth: new Date('1985-08-22'),
        enrolledServices: ['Advanced Pilates', 'Strength Training'],
        status: 'active'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0103',
        dateOfBirth: new Date('1992-03-10'),
        enrolledServices: ['Zumba Fitness'],
        status: 'active'
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos.mendez@email.com',
        phone: '+1-555-0104',
        dateOfBirth: new Date('1988-11-05'),
        enrolledServices: ['Meditation & Mindfulness'],
        status: 'inactive'
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.wang@email.com',
        phone: '+1-555-0105',
        dateOfBirth: new Date('1995-07-18'),
        enrolledServices: ['Yoga Beginner', 'Meditation & Mindfulness'],
        status: 'active'
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+1-555-0106',
        dateOfBirth: new Date('1980-12-03'),
        enrolledServices: ['Strength Training'],
        status: 'active'
      },
      {
        name: 'Anna Kim',
        email: 'anna.kim@email.com',
        phone: '+1-555-0107',
        dateOfBirth: new Date('1993-09-25'),
        enrolledServices: ['Advanced Pilates'],
        status: 'inactive'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0108',
        dateOfBirth: new Date('1987-04-12'),
        enrolledServices: ['Zumba Fitness', 'Strength Training'],
        status: 'active'
      }
    ]);

    // Create Classes
    const classes = await Class.create([
      {
        courseId: courses[0]._id, // Yoga Beginner
        title: 'Yoga Beginner - Morning Session',
        startDate: new Date('2024-06-25T08:00:00Z'),
        endDate: new Date('2024-06-25T09:00:00Z'),
        instructor: 'Sarah Johnson',
        maxCapacity: 20,
        currentEnrollment: 15,
        status: 'completed',
        attendance: 12
      },
      {
        courseId: courses[0]._id, // Yoga Beginner
        title: 'Yoga Beginner - Evening Session',
        startDate: new Date('2024-06-26T18:00:00Z'),
        endDate: new Date('2024-06-26T19:00:00Z'),
        instructor: 'Sarah Johnson',
        maxCapacity: 20,
        currentEnrollment: 18,
        status: 'scheduled',
        attendance: 0
      },
      {
        courseId: courses[1]._id, // Advanced Pilates
        title: 'Advanced Pilates - Core Focus',
        startDate: new Date('2024-06-25T10:00:00Z'),
        endDate: new Date('2024-06-25T10:45:00Z'),
        instructor: 'Mike Chen',
        maxCapacity: 15,
        currentEnrollment: 12,
        status: 'completed',
        attendance: 10
      },
      {
        courseId: courses[2]._id, // Zumba Fitness
        title: 'Zumba Fitness - Latin Rhythms',
        startDate: new Date('2024-06-25T19:00:00Z'),
        endDate: new Date('2024-06-25T20:00:00Z'),
        instructor: 'Maria Rodriguez',
        maxCapacity: 25,
        currentEnrollment: 22,
        status: 'completed',
        attendance: 20
      },
      {
        courseId: courses[3]._id, // Meditation & Mindfulness
        title: 'Meditation & Mindfulness - Evening',
        startDate: new Date('2024-06-26T20:00:00Z'),
        endDate: new Date('2024-06-26T20:30:00Z'),
        instructor: 'David Kim',
        maxCapacity: 30,
        currentEnrollment: 25,
        status: 'scheduled',
        attendance: 0
      }
    ]);

    // Create Orders
    const orders = await Order.create([
      {
        clientId: clients[0]._id, // Priya Sharma
        courseId: courses[0]._id, // Yoga Beginner
        amount: 25.00,
        status: 'paid',
        createdAt: new Date('2024-06-01T10:00:00Z')
      },
      {
        clientId: clients[1]._id, // John Smith
        courseId: courses[1]._id, // Advanced Pilates
        amount: 30.00,
        status: 'paid',
        createdAt: new Date('2024-06-05T14:30:00Z')
      },
      {
        clientId: clients[1]._id, // John Smith
        courseId: courses[4]._id, // Strength Training
        amount: 35.00,
        status: 'pending',
        createdAt: new Date('2024-06-10T09:15:00Z')
      },
      {
        clientId: clients[2]._id, // Emily Davis
        courseId: courses[2]._id, // Zumba Fitness
        amount: 20.00,
        status: 'paid',
        createdAt: new Date('2024-06-03T16:45:00Z')
      },
      {
        clientId: clients[3]._id, // Carlos Mendez
        courseId: courses[3]._id, // Meditation & Mindfulness
        amount: 15.00,
        status: 'completed',
        createdAt: new Date('2024-05-20T11:20:00Z')
      },
      {
        clientId: clients[4]._id, // Lisa Wang
        courseId: courses[0]._id, // Yoga Beginner
        amount: 25.00,
        status: 'paid',
        createdAt: new Date('2024-06-08T13:00:00Z')
      },
      {
        clientId: clients[4]._id, // Lisa Wang
        courseId: courses[3]._id, // Meditation & Mindfulness
        amount: 15.00,
        status: 'paid',
        createdAt: new Date('2024-06-12T15:30:00Z')
      },
      {
        clientId: clients[5]._id, // Robert Johnson
        courseId: courses[4]._id, // Strength Training
        amount: 35.00,
        status: 'paid',
        createdAt: new Date('2024-06-15T08:45:00Z')
      }
    ]);

    // Create Payments
    const payments = await Payment.create([
      {
        orderId: orders[0]._id,
        amount: 25.00,
        status: 'completed',
        paymentMethod: 'credit_card',
        date: new Date('2024-06-01T10:05:00Z')
      },
      {
        orderId: orders[1]._id,
        amount: 30.00,
        status: 'completed',
        paymentMethod: 'debit_card',
        date: new Date('2024-06-05T14:35:00Z')
      },
      {
        orderId: orders[3]._id,
        amount: 20.00,
        status: 'completed',
        paymentMethod: 'cash',
        date: new Date('2024-06-03T16:50:00Z')
      },
      {
        orderId: orders[4]._id,
        amount: 15.00,
        status: 'completed',
        paymentMethod: 'credit_card',
        date: new Date('2024-05-20T11:25:00Z')
      },
      {
        orderId: orders[5]._id,
        amount: 25.00,
        status: 'completed',
        paymentMethod: 'debit_card',
        date: new Date('2024-06-08T13:05:00Z')
      },
      {
        orderId: orders[6]._id,
        amount: 15.00,
        status: 'completed',
        paymentMethod: 'credit_card',
        date: new Date('2024-06-12T15:35:00Z')
      },
      {
        orderId: orders[7]._id,
        amount: 35.00,
        status: 'completed',
        paymentMethod: 'cash',
        date: new Date('2024-06-15T08:50:00Z')
      }
    ]);

    // Create Attendance records
    const attendanceRecords = await Attendance.create([
      {
        classId: classes[0]._id, // Yoga Beginner Morning
        clientId: clients[0]._id, // Priya Sharma
        attended: true,
        date: new Date('2024-06-25T08:00:00Z')
      },
      {
        classId: classes[0]._id, // Yoga Beginner Morning
        clientId: clients[4]._id, // Lisa Wang
        attended: true,
        date: new Date('2024-06-25T08:00:00Z')
      },
      {
        classId: classes[2]._id, // Advanced Pilates
        clientId: clients[1]._id, // John Smith
        attended: true,
        date: new Date('2024-06-25T10:00:00Z')
      },
      {
        classId: classes[3]._id, // Zumba Fitness
        clientId: clients[2]._id, // Emily Davis
        attended: true,
        date: new Date('2024-06-25T19:00:00Z')
      },
      {
        classId: classes[3]._id, // Zumba Fitness
        clientId: clients[7]._id, // Michael Brown
        attended: false,
        date: new Date('2024-06-25T19:00:00Z')
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created: ${courses.length} courses, ${clients.length} clients, ${classes.length} classes, ${orders.length} orders, ${payments.length} payments, ${attendanceRecords.length} attendance records`);

    return {
      courses,
      clients,
      classes,
      orders,
      payments,
      attendanceRecords
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}; 