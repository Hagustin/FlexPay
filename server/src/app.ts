import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { authenticateUser } from './middleware/auth';
import { GraphQLContext } from './types/context';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FlexPay API is running...');
});

// Initialize Apollo Server with Authentication Context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Skip logging for GraphQL introspection requests
    if (req.body.operationName === "IntrospectionQuery") {
      return { user: null };
    }

    if (!token) {
      // Only log missing tokens for protected routes
      if (req.body.operationName && req.body.operationName !== "register" && req.body.operationName !== "login") {
        console.log("🔴 No token provided in request.");
      }
      return { user: null };
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY || "Secret_Key_is_here");
      console.log("🟢 Authenticated User:", user);
      return { user };
    } catch (error) {
      if (error instanceof Error) {
        console.log("🔴 Token verification failed:", error.message);
      } else {
        console.log("🔴 Token verification failed with an unknown error.");
      }
      return { user: null };
    }
  },
});



async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  console.log(`🚀 GraphQL Server ready at http://localhost:3001${server.graphqlPath}`);
}

startServer();

export default app;
