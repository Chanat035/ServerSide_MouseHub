import User from "../models/User.js"

const userService = {
  getAllUsers: async () => {
    return await User.find();
  },
  // getUserById: async (id) => {
  //   return await User.findById(id); 
  // },
  create: async(name, email, phone, address, password) => {
    return await User.create({
      name, email, phone, address, password
    })
  },
  getUserByUsername: async (username) => {
    return await User.findOne({ name: username });
  }
}

export default userService