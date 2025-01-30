import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../utils/auth";
import breadIcon from "../assets/bread.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.loggedIn());

  useEffect(() => {
    const checkAuth = () =>
      setIsLoggedIn(AuthService.loggedIn());

    // then this so it will update the state when the user logs in or logs out
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout(navigate);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-8 bg-gray-100 w-full">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex flex-row gap-2.5 items-center text-2xl font-ivy">
          <img src={breadIcon} alt="FlexPay Logo" className="h-10 w-auto" />
          <span>FLEXY</span>
        </div>

        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/wallet" className="hover:underline">
                Wallet
              </Link>
              <Link to="/transactions" className="hover:underline">
                Transactions
              </Link>
              <Link to="/profile" className="hover:underline">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 rounded hover:bg-red-700"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
