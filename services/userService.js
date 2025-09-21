import User from "../models/User.js";

const userService = {
  getAllUsers: async () => {
    return await User.find();
  },

  register: async (name, email, phone, address, password) => {
    return await User.create({
      name,
      email,
      phone,
      address,
      password,
    });
  },

  getUserByUsername: async (username) => {
    return await User.findOne({ name: username });
  },

  getUserById: async (id) => {
    return await User.findById(id);
  },

  getUserByEmail: async (email) => {
    return await User.findOne({ email });
  },

  changePassword: async (user, newPassword) => {
    user.password = newPassword;
    return await user.save();
  },
  deleteUser: async (user) => {
    user.isDeleted = new Date();
    return await user.save();
  },

  restoreUser: async (user) => {
    user.isDeleted = null;
    return await user.save();
  },

  addBalance: async (user, amount) => {
    user.balance = (user.balance || 0) + Number(amount);
    return await user.save();
  },
};

export default userService;
