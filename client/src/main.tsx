import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client.ts"; // Ensure this file exists
import App from "./App.tsx";
import "./index.css";

console.log("✅ React is mounting!"); // Debugging log

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode> // ✅ This was missing!
);

console.log("✅ React has rendered!"); // Debugging log
