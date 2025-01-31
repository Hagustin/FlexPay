import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';

const App: React.FC = () => {
  console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Router>
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
