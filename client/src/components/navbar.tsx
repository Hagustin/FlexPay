import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../utils/auth';
import '../index.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = AuthService.loggedIn();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/*<img src={logo} alt="FlexPay Logo" className="logo-small" /> */} {/* will uncomment once we have a logo */}
        <span className="text-bold">FlexPay</span>
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <Link to="/" className="navbar-link">
              Home
            </Link>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/wallet" className="navbar-link">
              Wallet
            </Link>
            <Link to="/transactions" className="navbar-link">
              Transactions
            </Link>
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-link logout-button">
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-link">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;