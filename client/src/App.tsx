import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Navbar />
      </div>
      <div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
