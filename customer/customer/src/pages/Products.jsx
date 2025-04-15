import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/Products.css';
import api from '../utils/api';

function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    }
  }, []);

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const categoriesResponse = await api.getCategories();
        setCategories(categoriesResponse.data);
        
        // Fetch all products
        const productsResponse = await api.getProducts();
        setProducts(productsResponse.data);
        
        // Initialize quantities state
        const initialQuantities = {};
        productsResponse.data.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch products by category when category changes
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (selectedCategory === null) {
        // If no category selected, fetch all products
        try {
          setLoading(true);
          const response = await api.getProducts();
          setProducts(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching all products:', err);
          setError('Failed to load products. Please try again later.');
          setLoading(false);
        }
      } else {
        // Fetch products for selected category
        try {
          setLoading(true);
          const response = await api.getProductsByCategory(selectedCategory);
          setProducts(response.data);
          setLoading(false);
        } catch (err) {
          console.error(`Error fetching products for category ${selectedCategory}:`, err);
          setError('Failed to load products for this category. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    fetchProductsByCategory();
  }, [selectedCategory]);

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    setQuantities({
      ...quantities,
      [productId]: value
    });
  };

  // Add to cart function
  const addToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    let updatedCart;
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity
      };
    } else {
      // Add new item
      updatedCart = [
        ...cart,
        {
          ...product,
          quantity
        }
      ];
    }
    
    setCart(updatedCart);
    
    // Store cart in localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show confirmation
    alert(`${quantity} ${product.name} added to cart!`);
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
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="products-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : products.length === 0 ? (
            <p>No products available in this category.</p>
          ) : (
            products.map(product => {
              // Safely parse the price, defaulting to 0 if invalid/missing
              const price = parseFloat(product.price_per_pound);
              const displayPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

              return (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="price">${displayPrice} / lb</p>
                  <p className="stock">Available: {product.quantity} lbs</p>
                  <div className="product-actions">
                    <input 
                      type="number" 
                      min="1" 
                      max={product.quantity} 
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                      className="quantity-input"
                    />
                    <button 
                      className="add-to-cart-btn button button-primary"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity < 1}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Products;
