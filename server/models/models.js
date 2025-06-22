import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  dateOfBirth: Date,
  enrolledServices: [String],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: String,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: String, required: true },
  duration: String,
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  instructor: String,
  maxCapacity: Number,
  currentEnrollment: { type: Number, default: 0 },
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  attendance: { type: Number, default: 0 }, // Number of students who attended
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  attended: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: 1 });

orderSchema.index({ clientId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ date: 1 });

courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });

classSchema.index({ courseId: 1 });
classSchema.index({ startDate: 1 });
classSchema.index({ status: 1 });

attendanceSchema.index({ classId: 1 });
attendanceSchema.index({ clientId: 1 });

export const Client = mongoose.model('Client', clientSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Class = mongoose.model('Class', classSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
