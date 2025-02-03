import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri:
    import.meta.env.MODE === "production"
      ? "https://flexpay-nmt5.onrender.com/graphql" // RENDER
      : "http://localhost:3001/graphql", // LOCAL
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  console.log("🔹 Sending Token with Request:", token); // Debugging
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ✅ Create a new cache instance to prevent Apollo from using old queries
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getUser: {
          merge(_, incoming) {
            return incoming; // ✅ Always overwrite old data
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: { fetchPolicy: "network-only" }, // ✅ Forces fresh data
    query: { fetchPolicy: "network-only" },
  },
});

export default client;
