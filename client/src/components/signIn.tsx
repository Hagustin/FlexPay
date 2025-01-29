import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [login, { loading, error }] = useMutation(LOGIN_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: formData });

      if (data?.login?.token) {
        AuthService.login(data.login.token, navigate);
      } else {
        console.error('Unexpected response structure:', data);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-10/12 mx-auto">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-4 pl-6 mb-3 border rounded-full"
      />

      <input
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full p-4 pl-6 mb-3 border rounded-full"
      />

      {error && (
        <p className="text-red-500 mt-2">{error.message || 'Login failed'}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white p-4 rounded-full"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login;
