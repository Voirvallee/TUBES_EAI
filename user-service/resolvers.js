const User = require("./Users");
const { publishUserRegistered } = require("./messagePublisher");

const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_, { id }) => await User.findById(id),
  },
  Mutation: {
    registerUser: async (_, { name, email }) => {
      const newUser = new User({
        name,
        email,
        registeredAt: new Date().toISOString(),
      });
      await newUser.save();
      await publishUserRegistered(newUser);
      return newUser;
    },
  },
};

module.exports = resolvers;
