import { useState } from "react";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../graphql/mutations";
import { useNavigate } from "react-router-dom";
import AuthService from "../utils/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
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
        console.error("Unexpected response structure:", data);
      }
    } catch (err) {
      console.error("Error signing up:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

      <label htmlFor="username" className="block font-medium">Username</label>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <label htmlFor="email" className="block font-medium">Email</label>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 mb-2 border rounded"
      />

      <label htmlFor="password" className="block font-medium">Password</label>
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border rounded"
      />

      {error && <p className="text-red-500 mt-2">{error.message || "Sign-up failed"}</p>}

      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignUp;
