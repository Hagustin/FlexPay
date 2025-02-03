import { gql } from "@apollo/client";

// Get user details
export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      walletBalance
      walletLocked
      transactions {
        id
        amount
        type
        status
        date
      }
    }
  }
`;

// Get user's transactions
export const GET_TRANSACTIONS = gql`
  query GetTransactions($userId: ID!, $limit: Int, $offset: Int) {
    getTransactions(userId: $userId, limit: $limit, offset: $offset) {
      id
      amount
      type
      status
      date
    }
  }
`;

// Get wallet balance
export const GET_WALLET_BALANCE = gql`
  query GetWalletBalance($id: ID!) {
    getUser(id: $id) {
      walletBalance
    }
  }
`;

// Get current authenticated user (self)
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      walletBalance
      walletLocked
      transactions {
        id
        amount
        type
        status
        date
      }
    }
  }
`;


//chatbot
export const ASK_CHATBOT = gql`
  query AskChatbot($question: String!, $userId: String) {
    askChatbot(question: $question, userId: $userId) {
      response
    }
  }
`;