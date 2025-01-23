import { gql } from '@apollo/client';

export const SIGN_UP_USER = gql`
  mutation SignUp($username: String!, $email: String!, $password: String!) {
    signUp(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;