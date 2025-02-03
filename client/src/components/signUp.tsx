import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [register, { loading, error }] = useMutation(REGISTER_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await register({ variables: formData });

      if (data?.register?.token) {
        AuthService.login(data.register.token, navigate);
      } else {
        console.error('Unexpected response structure:', data);
      }
    } catch (err) {
      console.error('Error signing up:', err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md w-10/12 mx-auto">
        <input
          type="text"
          name="username"
          placeholder="JohnSmith..."
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-4 pl-6 mb-3 border rounded-full"
        />

        <input
          type="email"
          name="email"
          placeholder="YourEmail@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-4 pl-6 mb-3 border rounded-full"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-4 pl-6 mb-3 border rounded-full"
        />

        {error && (
          <p className="text-red-500 mt-2">
            {error.message || 'Sign-up failed'}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-full"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <a
        onClick={() => navigate('/login')}
        className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
      >
        Have an Account? Login
      </a>
    </>
  );
};

export default SignUp;
