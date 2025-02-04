import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    walletBalance: Float!
    walletLocked: Boolean!
    transactions: [Transaction]
  }
  
  type PaymentResponse {
  clientSecret: String!
  status: String!
  currency: String!
}

  type Wallet {
    id: ID!
    balance: Float!
    currency: String!
    transactions: [Transaction]
    transactionStatus: String
  }

  type Transaction {
  id: ID!
  amount: Float!
  type: String!
  status: String!
  date: String!
  senderId: ID
  receiverId: ID
  description: String
}


  type QRCode {
    code: String!
    amount: Float!
    status: String!
  }

  type AuthPayload {
    user: User
    token: String!
  }

  type Query {
    getUser(id: ID!): User
    getTransactions(userId: ID!, limit: Int, offset: Int): [Transaction]
    askChatbot(userId: String, question: String!): ChatbotResponse
  }

  type ChatbotResponse {
    response: String
  }

  type Mutation {
  register(username: String!, email: String!, password: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
  addFunds(userId: ID!, amount: Float!): Wallet
  withdrawFunds(userId: ID!, amount: Float!): Wallet
  transferFunds(senderId: ID!, receiverId: ID!, amount: Float!): Wallet
  lockWallet(userId: ID!): User
  unlockWallet(userId: ID!): User
  addFundsViaCard(userId: ID!, amount: Float!, currency: String!): PaymentResponse
  confirmPayment(userId: ID!, paymentIntentId: String!): Wallet
  generateQR(userId: ID!, amount: Float!): QRCode
  scanQR(userId: ID!, qrCode: String!): Wallet
}
`;

export default typeDefs;
