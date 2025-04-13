import React from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload } from 'react-icons/fa';


function ManagerEmployees() {
  return (
    <ManagerLayout>
      <div className="page-header">
        <h2>Employees</h2>
      </div>
      
    </ManagerLayout>
  );
}

export default ManagerEmployees; 