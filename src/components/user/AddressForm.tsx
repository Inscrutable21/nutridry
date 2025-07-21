'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAddressContext } from './AddressManager'

interface FormErrors {
  [key: string]: string;
}

interface AddressFormProps {
  onCancel?: () => void;
  onSuccess: () => void;
  editingAddressId?: string | null;
}

export default function AddressForm({ 
  onCancel, 
  onSuccess,
  editingAddressId = null 
}: AddressFormProps) {
  const { 
    addresses, 
    dispatch, 
    isDarkMode, 
    isAuthenticated,
    userData
  } = useAddressContext();
  
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Initialize form with empty values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    locality: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: ''
  });
  
  // If editing, populate form with address data
  useEffect(() => {
    if (editingAddressId) {
      const addressToEdit = addresses.find(addr => addr.id === editingAddressId);
      if (addressToEdit) {
        setFormData({
          name: addressToEdit.name || '',
          email: addressToEdit.email || '',
          phone: addressToEdit.phone || '',
          address: addressToEdit.address || '',
          pincode: addressToEdit.pincode || '',
          locality: addressToEdit.locality || '',
          city: addressToEdit.city || '',
          state: addressToEdit.state || '',
          landmark: addressToEdit.landmark || '',
          alternatePhone: addressToEdit.alternatePhone || ''
        });
      }
    } else if (userData) {
      // New address - populate with user data if available
      setFormData(prev => ({
        ...prev,
        name: userData?.name || prev.name,
        email: userData?.email || prev.email,
        phone: userData?.mobile || prev.phone
      }));
    }
  }, [editingAddressId, addresses, userData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Required fields
    const requiredFields = [
      { field: 'name', label: 'Full Name' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone' },
      { field: 'address', label: 'Address' },
      { field: 'pincode', label: 'Pincode' },
      { field: 'locality', label: 'Locality' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' }
    ];
    
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field as keyof typeof formData]?.trim()) {
        newErrors[field] = `${label} is required`;
        isValid = false;
      }
    });
    
    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate phone number (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    // Validate pincode (6 digits)
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
      isValid = false;
    }
    
    // Validate alternate phone if provided
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const saveAddress = async (makeDefault: boolean = false) => {
    if (!isAuthenticated) return;
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    setIsSaving(true);
    try {
      let response;
      
      if (editingAddressId) {
        // Update existing address
        response = await fetch(`/api/user/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            isDefault: makeDefault
          }),
        });
      } else {
        // Create new address
        response = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            isDefault: makeDefault
          }),
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the address in the context
        if (editingAddressId) {
          dispatch({ 
            type: 'UPDATE_ADDRESS', 
            address: { 
              id: editingAddressId, 
              ...formData, 
              isDefault: makeDefault 
            } 
          });
        } else if (data.address) {
          dispatch({ type: 'ADD_ADDRESS', address: data.address });
        }
        
        toast.success(editingAddressId ? 'Address updated successfully' : 'Address saved successfully');
        onSuccess();
      } else {
        toast.error(editingAddressId ? 'Failed to update address' : 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(editingAddressId ? 'Failed to update address' : 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {editingAddressId ? 'Edit Address' : addresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone * (10 digits)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.phone 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="alternatePhone" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Alternate Phone (optional)
          </label>
          <input
            type="tel"
            id="alternatePhone"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.alternatePhone 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.alternatePhone && (
            <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="address" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Address (House No, Building, Street) *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.address 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="locality" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Locality / Area / Street *
          </label>
          <input
            type="text"
            id="locality"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.locality 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.locality && (
            <p className="text-red-500 text-xs mt-1">{errors.locality}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="landmark" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Landmark (optional)
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.landmark 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
        </div>
        
        <div>
          <label htmlFor="city" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            City / Town / District *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.city 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="state" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            State *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.state 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="pincode" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pincode * (6 digits)
          </label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md ${
              errors.pincode 
                ? 'border-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
            }`}
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3">
        <button
          type="button"
          onClick={() => saveAddress(false)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
        </button>
        
        <button
          type="button"
          onClick={() => saveAddress(true)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save as Default'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}


