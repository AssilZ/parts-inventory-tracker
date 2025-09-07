import React from 'react';
import { Part } from '../types';

interface PartListProps {
  parts: Part[];
  onDeletePart?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalParts?: number;
  sortField?: 'name' | 'quantity' | 'price' | 'total' | 'createdAt' | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: 'name' | 'quantity' | 'price' | 'total' | 'createdAt') => void;
}

export const PartList: React.FC<PartListProps> = ({ 
  parts, 
  onDeletePart,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalParts,
  sortField,
  sortDirection,
  onSort
}) => {
  if (parts.length === 0) {
    return (
      <div className="card">
        <h2>Parts Inventory</h2>
        <div className="empty-state">
          <p>No parts in inventory</p>
          <p>Add your first part using the form on the left.</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalValue = (): string => {
    const total = parts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    return formatPrice(total);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <h2>Parts Inventory ({totalParts || parts.length} items)</h2>
      <div className="parts-list">
        <table className="parts-table">
          <thead>
            <tr>
              <th 
                onClick={() => onSort && onSort('name')}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => onSort && onSort('quantity')}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => onSort && onSort('price')}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => onSort && onSort('total')}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                Total Value {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => onSort && onSort('createdAt')}
                style={{ cursor: onSort ? 'pointer' : 'default' }}
              >
                Added {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              {onDeletePart && <th></th>}
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id}>
                <td>{part.name}</td>
                <td>{part.quantity}</td>
                <td>{formatPrice(part.price)}</td>
                <td>{formatPrice(part.quantity * part.price)}</td>
                <td>{formatDate(part.createdAt)}</td>
                {onDeletePart && (
                  <td>
                    <button
                      onClick={() => onDeletePart(part.id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 15px' }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          textAlign: 'right'
        }}>
          <strong>Total Inventory Value: {getTotalValue()}</strong>
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="pagination-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px'
          }}>
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary"
              style={{ padding: '5px 15px' }}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
              style={{ padding: '5px 15px' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
