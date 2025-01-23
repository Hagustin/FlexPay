import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP_USER } from '../graphql/mutations' // TO BE DEFINED IN MUTATIONS FILE

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [signUp, { loading, error }] = useMutation(SIGN_UP_USER);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const { data } = await signUp({ variables: {...formData } });
        } catch (err) {
            console.error('Error signing up:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
          <h2>Sign Up</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && <p style={{ color: 'red' }}>Sign-up failed. Try again.</p>}
        </form>
      );
};

export default SignUp;