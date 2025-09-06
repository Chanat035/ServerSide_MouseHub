import User from "../models/User.js"

const userService = {
  getAllUsers: async () => {
    return await User.find();
  },
  
  register: async(name, email, phone, address, password) => {
    return await User.create({
      name, email, phone, address, password
    })
  },

  getUserByUsername: async (username) => {
    return await User.findOne({ name: username });
  },

  changePassword: async (user, newPassword) => {
    user.password = newPassword;
    return await user.save();
  },
  
  addBalance: async (user, amount) => {
    user.balance = (user.balance || 0) + Number(amount);
    return await user.save();
  },
}

export default userService