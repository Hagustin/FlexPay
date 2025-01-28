import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import jwt from "jsonwebtoken";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import path from "path";

const app = express();
//CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:5173", 
      "http://localhost:3001",
      "https://flexpay-nmt5.onrender.com", // Render deployment
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production" || process.env.LOCAL_BUILD === "true") {
  const clientBuildPath = path.resolve(__dirname, "../../client/dist");
  console.log(`✅ Serving frontend from: ${clientBuildPath}`);

  app.use(express.static(clientBuildPath));

  // ✅ Ensure React Router SPA works
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  console.log("🔹 Backend running in API-only mode (not serving frontend)");
}

// ✅ Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (req.body.operationName === "IntrospectionQuery") return { user: null };

    if (!token) return { user: null };

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY || "Secret_Key_is_here");
      return { user };
    } catch {
      return { user: null };
    }
  },
});

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production" || process.env.LOCAL_BUILD === "true") {
  const clientBuildPath = path.resolve(__dirname, "../../client/dist");
  console.log(`✅ Serving frontend from: ${clientBuildPath}`);

  app.use(express.static(clientBuildPath));

  // ✅ Ensure React Router SPA works
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  console.log("🔹 Backend running in API-only mode (not serving frontend)");
}


// ✅ Ensure Apollo applies CORS correctly
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, cors: { origin: allowedOrigins, credentials: true } });
  console.log(`🚀 GraphQL Server ready at http://localhost:3001/graphql`);
}

startServer();

export default app;
