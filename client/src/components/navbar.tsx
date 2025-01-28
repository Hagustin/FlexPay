import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.loggedIn());

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(AuthService.loggedIn());
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
      <div className="text-xl font-bold">
        {/*  Uncomment and replace when logo is available */}
        {/* <img src={logo} alt="FlexPay Logo" className="h-8 w-auto" /> */}
        <span>FlexPay</span>
      </div>

      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/wallet" className="hover:underline">Wallet</Link>
            <Link to="/transactions" className="hover:underline">Transactions</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 rounded hover:bg-red-700">
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="px-3 py-1 bg-green-500 rounded hover:bg-green-700">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
