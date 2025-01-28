import express from 'express';
import cors from 'cors';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from './config/db';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express
const app = express();

// ✅ Apply Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));

// ✅ Connect to MongoDB
db().then(() => console.log("✅ MongoDB Connected Successfully"));

// ✅ Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) return { user: null };

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY || "Secret_Key_is_here");
      return { user };
    } catch {
      return { user: null };
    }
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  console.log(`🚀 GraphQL Server ready at http://localhost:${process.env.PORT || 3001}/graphql`);
}

startServer();

// ✅ Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}!`);
});

console.log("✅ Server Initialized");
