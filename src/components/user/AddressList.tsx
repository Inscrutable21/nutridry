'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAddressContext } from './AddressManager'

// Define the SavedAddress interface
interface SavedAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  locality: string;
  city: string;
  state: string;
  landmark: string | null;
  alternatePhone: string | null;
  isDefault: boolean;
}

export default function AddressList({ onAddNew }: { onAddNew: (addressId: string | null) => void }) {
  const { 
    addresses, 
    dispatch, 
    selectedAddressId, 
    isDarkMode, 
    onAddressSelect,
    isAuthenticated,
    setEditingAddressId
  } = useAddressContext();
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Handle address selection
  const handleAddressSelect = (address: SavedAddress) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };
  
  // Handle "Edit Address" button
  const handleEditAddress = (addressId: string) => {
    setEditingAddressId(addressId);
    onAddNew(addressId);
  };
  
  // Handle "Delete Address" button
  const handleDeleteAddress = async (addressId: string) => {
    setIsDeleting(addressId);
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_ADDRESS', id: addressId });
        toast.success('Address deleted successfully');
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Handle "Set as Default" button
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        dispatch({ type: 'SET_DEFAULT', id: addressId });
        toast.success('Default address updated');
      } else {
        toast.error('Failed to update default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Saved Addresses
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div 
            key={address.id}
            className={`border rounded-lg p-4 cursor-pointer transition ${
              selectedAddressId === address.id 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700'
            } ${isDarkMode ? 'dark:text-white' : ''}`}
            onClick={() => handleAddressSelect(address)}
          >
            {/* Address card content */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <span className="font-medium">{address.name}</span>
                {address.isDefault && (
                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded dark:bg-emerald-800 dark:text-emerald-100">
                    Default
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{address.address}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {address.locality}, {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Phone: {address.phone}</p>
            
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAddress(address.id);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAddress(address.id);
                }}
                disabled={isDeleting === address.id}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              >
                {isDeleting === address.id ? 'Deleting...' : 'Delete'}
              </button>
              
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address.id);
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={() => onAddNew(null)}
        className={`mt-4 flex items-center text-sm font-medium ${
          isDarkMode 
            ? 'text-emerald-400 hover:text-emerald-300' 
            : 'text-emerald-600 hover:text-emerald-700'
        }`}
      >
        <span className="mr-1">+</span> Add New Address
      </button>
    </div>
  );
}





