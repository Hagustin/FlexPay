import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import Dashboard from "./components/dashboard";
import Navbar from "./components/navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
