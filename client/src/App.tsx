import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import Dashboard from "./components/dashboard";
import Navbar from "./components/navbar";
import Transactions from "./components/transactions";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </Router>
  );
}

export default App;
