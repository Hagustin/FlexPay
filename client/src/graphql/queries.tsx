import { gql } from '@apollo/client';

export const GET_USER = gql`
    query GetUser {
        accountDetails {
          name
          email
          }
    }
`;

export const GET_TRANSACTIONS = gql`
    query GetTransactions {
        transactions {
          id
          date
          amount
          description
        }
    }
`;

export const GET_WALLET_BALANCE = gql`
    query GetWalletBalance {
      balance
    }
`;