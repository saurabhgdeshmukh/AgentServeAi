import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  enrolledServices: [String],
  status: String,
});

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  service: String,
  status: { type: String, enum: ['paid', 'pending'] },
  createdAt: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: Number,
  date: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: String,
  instructor: String,
  status: String,
});

const classSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  date: Date,
  instructor: String,
  status: String,
});

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  attended: Boolean,
});
export const Client = mongoose.model('Client', clientSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Class = mongoose.model('Class', classSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
