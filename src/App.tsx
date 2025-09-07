import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Part } from './types';
import { getParts, saveParts, loadPartsFromStorage } from './api';
import { PartForm } from './components/PartForm';
import { PartList } from './components/PartList';

function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'price' | 'total' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 5;

  // Load initial parts data on component mount
  useEffect(() => {
    const loadParts = async () => {
      try {
        setLoading(true);

        // Try to load from localStorage first
        const savedParts = loadPartsFromStorage();
        if (savedParts.length > 0) {
          setParts(savedParts);
        } else {
          // Fall back to initial data if no saved parts
          const initialParts = await getParts();
          setParts(initialParts);
        }
      } catch (error) {
        toast.error('Failed to load parts data');
        console.error('Error loading parts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParts();
  }, []);

  // Generate unique ID for new parts
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  };

  // Add new part to the list
  const handleAddPart = (newPart: Omit<Part, 'id' | 'createdAt'>) => {
    const partWithId: Part = {
      ...newPart,
      id: generateId(),
      createdAt: Date.now()
    };

    setParts(prevParts => [...prevParts, partWithId]);
    toast.success(`Added "${newPart.name}" to inventory`);
  };

  // Delete part from the list or reduce quantity
  const handleDeletePart = (id: string) => {
    const part = parts.find(p => p.id === id);
    if (!part) return;

    const quantityToDelete = prompt(`How many "${part.name}" to delete? (Available: ${part.quantity})`);
    if (!quantityToDelete) return;

    const deleteAmount = parseInt(quantityToDelete);
    if (isNaN(deleteAmount) || deleteAmount <= 0) {
      toast.error('Please enter a valid number');
      return;
    }

    if (deleteAmount > part.quantity) {
      toast.error(`Cannot delete ${deleteAmount}. Only ${part.quantity} available.`);
      return;
    }

    if (deleteAmount === part.quantity) {
      // Delete entire part
      setParts(prevParts => prevParts.filter(p => p.id !== id));
      toast.success(`Deleted "${part.name}" from inventory`);
    } else {
      // Reduce quantity
      setParts(prevParts => 
        prevParts.map(p => 
          p.id === id ? { ...p, quantity: p.quantity - deleteAmount } : p
        )
      );
      toast.success(`Removed ${deleteAmount} of "${part.name}" (${part.quantity - deleteAmount} remaining)`);
    }
  };


  // Sort parts
  const sortedParts = [...parts].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    if (sortField === 'total') {
      aValue = a.quantity * a.price;
      bValue = b.quantity * b.price;
    } else {
      aValue = a[sortField as keyof Part];
      bValue = b[sortField as keyof Part];
    }
    
    if (sortField === 'name') {
      aValue = (aValue as string).toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedParts.length / itemsPerPage);
  const validCurrentPage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedParts = sortedParts.slice(startIndex, endIndex);
  
  // Handle sort field change
  const handleSort = (field: 'name' | 'quantity' | 'price' | 'total' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Save parts data to localStorage
  const handleSaveParts = async () => {
    try {
      setSaving(true);
      await saveParts(parts);
      toast.success('Save successful!');
    } catch (error) {
      toast.error('Failed to save parts data');
      console.error('Error saving parts:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Loading parts inventory...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Parts Inventory Management</h1>
        <p>Manage your parts inventory with ease</p>
      </header>

      <div className="main-content">
        <PartForm onAddPart={handleAddPart} />
        <PartList 
          parts={paginatedParts} 
          allParts={sortedParts}
          onDeletePart={handleDeletePart}
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalParts={parts.length}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <div className="save-section">
        <button
          onClick={handleSaveParts}
          disabled={saving}
          className="btn btn-success"
          style={{ fontSize: '18px', padding: '15px 30px' }}
        >
          {saving ? 'Saving...' : 'Save Inventory'}
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
