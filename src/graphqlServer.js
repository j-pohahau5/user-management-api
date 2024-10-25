// src/graphqlServer.js
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel'); 

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    getUserProfile: User
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): String
    loginUser(email: String!, password: String!): String
    updateUserProfile(username: String!): User
    deleteUserProfile: String
  }
`;

const resolvers = {
  Query: {
    getUserProfile: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await User.findById(user.id);
    },
  },
  Mutation: {
    registerUser: async (_, { username, email, password }) => {
      const newUser = new User({ username, email, password });
      await newUser.save();
      return "User created";
    },
    loginUser: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return token;
    },
    updateUserProfile: async (_, { username }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      await User.findByIdAndUpdate(user.id, { username });
      return await User.findById(user.id);
    },
    deleteUserProfile: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      await User.findByIdAndDelete(user.id);
      return "Profile deleted";
    },
  },
};

const startApolloServer = async () => {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      let user = null;

      if (token) {
        try {
          user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        } catch (err) {
          throw new Error('Unauthorized');
        }
      }

      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startApolloServer();
