import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
  name: String,
  username: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  smallPrice: Number,
  bigPrice: Number,
  body: Number,
  fist: Number,
  lips: Number,
  reviews: [String],
  rating: Number,
  gender: String,
  age: Number,
  show: { type: Boolean, default: true },
  orderHistory: [String],
});

export const Person = mongoose.model('Person', personSchema);

const reviewSchema = new mongoose.Schema({
  person: String,
  username: String,
  date: Number,
  text: String,
  rating: Number,
  order: String,
});

export const Review = mongoose.model('Review', reviewSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  privileges: Boolean,
  role: String,
  image: {type: String, default: ""},
  // "user person admin"
  gender: String,
  balance: Number,
  favorite: [String],
  rating: { type: Number, default: 0 },
});

export const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  username: String,
  person: String,
  status: String,
  // new current finished
  total: Number,
  address: String,
  orderDate: Number,
  creatDate: Number,
  details: String,
  hours: Number,
  review: { type: Boolean, default: false },
});

export const Order = mongoose.model('Order', orderSchema);

const paymentSchema = new mongoose.Schema({
  to: String,
  source: String,
  date: Number,
  info: String,
  total: Number,
});

export const Payment = mongoose.model('Payment', paymentSchema);