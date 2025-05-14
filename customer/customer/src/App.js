import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerSignUpPage from './pages/CustomerSignUpPage';
import AIChatBot from './components/AIChatBot/AIChatBot';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/signup' element={<CustomerSignUpPage />} />
        <Route path='/products' element={<Products />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/' element={<CustomerLoginPage />} />
      </Routes>
      <AIChatBot />
    </Router>
  );
}

export default App;
