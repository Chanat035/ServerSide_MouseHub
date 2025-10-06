const paymentService = {
  addBalance: async (user, amount) => {
    user.balance = (user.balance || 0) + Number(amount);
    return await user.save();
  },

  checkout: async (user, amount) => {
    user.balance -= Number(amount);
    return await user.save();
  }
};

export default paymentService;
