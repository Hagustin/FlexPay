import { useState } from 'react';
import './App.css';
import Login from './components/signIn';
import SignUp from './components/signUp';

function App() {
  return (
    <div className="App">
      <SignUp />
      <Login />
    </div>
  );
}

export default App;
