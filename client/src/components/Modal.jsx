import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ zIndex: 1001 }}
      />
      
      {/* Modal */}
      <div 
        className={`modal-container ${sizeClasses[size]}`}
        style={{ 
          zIndex: 1002,
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        {title && (
          <div className="modal-header">
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="modal-close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
