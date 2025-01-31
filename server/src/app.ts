import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json()); // ✅ Ensure JSON body parsing
app.use(bodyParser.urlencoded({ extended: true })); // ✅ Allow URL-encoded data

//CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3001',
      'https://flexpay-nmt5.onrender.com', // Render deployment
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ✅ Serve frontend in production
if (
  process.env.NODE_ENV === 'production' ||
  process.env.LOCAL_BUILD === 'true'
) {
  const clientBuildPath = path.resolve(__dirname, '../../client/dist');
  console.log(`✅ Serving frontend from: ${clientBuildPath}`);

  app.use(express.static(clientBuildPath));

  // ✅ Ensure React Router SPA works
  app.use('/graphql', express.json());
}

// ✅ Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: async ({ req }) => {
    console.log('Incoming Headers:', req.headers); // ✅ Debugging

    // Allow GraphQL Playground & Apollo Studio
    if (req.method === 'GET') return {};

    if (!req.headers['content-type']?.includes('application/json')) {
      console.error('❌ Invalid Content-Type:', req.headers['content-type']);
      return {}; // Instead of throwing an error, return an empty context
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) return { user: null };

    try {
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'Secret_Key_is_here'
      );
      return { user };
    } catch (error) {
      console.log(`❌ Token is invalid: ${error}`);
      return { user: null };
    }
  },
});

// ✅ Serve frontend only if NOT GraphQL request
if (
  process.env.NODE_ENV === 'production' ||
  process.env.LOCAL_BUILD === 'true'
) {
  const clientBuildPath = path.resolve(__dirname, '../../client/dist');
  console.log(`✅ Serving frontend from: ${clientBuildPath}`);

  app.use(express.static(clientBuildPath));

  // ✅ Fix: Only serve frontend when NOT a GraphQL request
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/graphql')) return next(); // ✅ Let GraphQL handle it
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ✅ Ensure Apollo applies CORS correctly
async function startServer() {
  await server.start();
  server.applyMiddleware({
    app,
    cors: { origin: allowedOrigins, credentials: true },
  });
  console.log(`🚀 GraphQL Server ready at http://localhost:3001/graphql`);
}

startServer();

export default app;
