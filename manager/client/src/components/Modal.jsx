import React from 'react';
import '../styles/Modal.css'; // Reuse existing modal styles
import { FaTimes } from 'react-icons/fa';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Use the existing modal overlay style
    <div className="modal-overlay" onClick={onClose}>
      {/* Use the existing modal content style */}
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          {title && <h4>{title}</h4>}
          <button onClick={onClose} className="modal-close-button icon-button">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {/* Modal actions (buttons) should be placed inside children by the parent component */}
      </div>
    </div>
  );
}

export default Modal; 