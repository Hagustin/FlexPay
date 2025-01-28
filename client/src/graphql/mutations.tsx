import { gql } from "@apollo/client";

// Register a new user
export const REGISTER_USER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

// Login a user
export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

// Add funds to wallet
export const ADD_FUNDS = gql`
  mutation AddFunds($userId: ID!, $amount: Float!) {
    addFunds(userId: $userId, amount: $amount) {
      id
      balance
    }
  }
`;

// Withdraw funds from wallet
export const WITHDRAW_FUNDS = gql`
  mutation WithdrawFunds($userId: ID!, $amount: Float!) {
    withdrawFunds(userId: $userId, amount: $amount) {
      id
      balance
    }
  }
`;

// Transfer funds between users
export const TRANSFER_FUNDS = gql`
  mutation TransferFunds($senderId: ID!, $receiverId: ID!, $amount: Float!) {
    transferFunds(senderId: $senderId, receiverId: $receiverId, amount: $amount) {
      id
      balance
    }
  }
`;

// Lock a user's wallet
export const LOCK_WALLET = gql`
  mutation LockWallet($userId: ID!) {
    lockWallet(userId: $userId) {
      id
      walletLocked
    }
  }
`;

// Unlock a user's wallet
export const UNLOCK_WALLET = gql`
  mutation UnlockWallet($userId: ID!) {
    unlockWallet(userId: $userId) {
      id
      walletLocked
    }
  }
`;

// Generate a QR code for payment
export const GENERATE_QR = gql`
  mutation GenerateQR($userId: ID!, $amount: Float!) {
    generateQR(userId: $userId, amount: $amount) {
      code
      amount
      status
    }
  }
`;

// Scan a QR code to complete a payment
export const SCAN_QR = gql`
  mutation ScanQR($userId: ID!, $qrCode: String!) {
    scanQR(userId: $userId, qrCode: $qrCode) {
      id
      balance
    }
  }
`;

// Add funds via credit/debit card
export const ADD_FUNDS_VIA_CARD = gql`
  mutation AddFundsViaCard($userId: ID!, $amount: Float!, $currency: String!) {
    addFundsViaCard(userId: $userId, amount: $amount, currency: $currency) {
      clientSecret
      status
      currency
    }
  }
`;

// Confirm a card payment
export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($userId: ID!, $paymentIntentId: String!) {
    confirmPayment(userId: $userId, paymentIntentId: $paymentIntentId) {
      id
      balance
      currency
    }
  }
`;
