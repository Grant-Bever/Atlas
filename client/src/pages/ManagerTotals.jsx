import React from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload } from 'react-icons/fa';


function ManagerTotals() {
  return (
    <ManagerLayout>
      <div className="page-header">
        <h2>Totals</h2>
      </div>
      
    </ManagerLayout>
  );
}

export default ManagerTotals; 