import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri:
    import.meta.env.MODE === "production"
      ? "https://flexpay-nmt5.onrender.com/graphql" //RENDER
      : "http://localhost:3001/graphql", //LOCAL
  credentials: "include",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default client;
