import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/Products.css';

function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Fetch categories and products
  useEffect(() => {
    // TODO: Replace with actual API calls
    // For now, using mock data
    const mockCategories = [
      { id: 1, name: 'Beef' },
      { id: 2, name: 'Poultry' },
      { id: 3, name: 'Pork' },
    ];
    
    const mockProducts = [
      { id: 1, name: 'Ribeye Steak', category_id: 1, price_per_pound: 18.99, quantity: 50 },
      { id: 2, name: 'Ground Beef', category_id: 1, price_per_pound: 6.99, quantity: 100 },
      { id: 3, name: 'Chicken Breast', category_id: 2, price_per_pound: 4.99, quantity: 75 },
      { id: 4, name: 'Whole Chicken', category_id: 2, price_per_pound: 3.49, quantity: 30 },
      { id: 5, name: 'Pork Chops', category_id: 3, price_per_pound: 7.99, quantity: 60 },
    ];
    
    setCategories(mockCategories);
    setProducts(mockProducts);
    setLoading(false);
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category_id === selectedCategory) 
    : products;

  // Add to cart function
  const addToCart = (product) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    // Store cart in localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <Layout>
      <div className="products-container">
        <aside className="categories-sidebar">
          <h2>Categories</h2>
          <ul className="category-list">
            <li 
              className={selectedCategory === null ? 'active' : ''}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </li>
            {categories.map(category => (
              <li 
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="products-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">${product.price_per_pound.toFixed(2)} / lb</p>
                <p className="stock">Available: {product.quantity} lbs</p>
                <div className="product-actions">
                  <input 
                    type="number" 
                    min="1" 
                    max={product.quantity} 
                    defaultValue="1" 
                    className="quantity-input"
                  />
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Products;
