import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  isDeleted: {
    type: Date,
    default: null
  }
})

const User = mongoose.model("User", UserSchema);

export default User