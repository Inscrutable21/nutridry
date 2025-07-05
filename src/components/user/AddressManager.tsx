'use client'

import { useState, useEffect, createContext, useContext, useReducer } from 'react'
import { toast } from 'react-hot-toast'
import AddressForm from './AddressForm'
import AddressList from './AddressList'

// Define types
interface AddressForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  locality: string;
  city: string;
  state: string;
  landmark: string;
  alternatePhone: string;
}

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

interface FormErrors {
  [key: string]: string;
}

interface AddressManagerProps {
  isDarkMode?: boolean;
  onAddressSelect?: (address: SavedAddress) => void;
  selectedAddressId?: string | null;
  userData?: {
    name?: string;
    email?: string;
    mobile?: string;
  } | null;
  isAuthenticated?: boolean;
}

// Create context for address management
type AddressAction = 
  | { type: 'SET_ADDRESSES', addresses: SavedAddress[] }
  | { type: 'ADD_ADDRESS', address: SavedAddress }
  | { type: 'UPDATE_ADDRESS', address: SavedAddress }
  | { type: 'DELETE_ADDRESS', id: string }
  | { type: 'SET_DEFAULT', id: string };

interface AddressContextType {
  addresses: SavedAddress[];
  dispatch: React.Dispatch<AddressAction>;
  selectedAddressId: string | null;
  isDarkMode: boolean;
  onAddressSelect?: (address: SavedAddress) => void;
  isAuthenticated: boolean;
  userData: AddressManagerProps['userData'];
  editingAddressId: string | null;
  setEditingAddressId: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddressContext = createContext<AddressContextType | null>(null);

export const useAddressContext = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddressContext must be used within an AddressProvider');
  }
  return context;
};

function addressReducer(state: SavedAddress[], action: AddressAction): SavedAddress[] {
  switch (action.type) {
    case 'SET_ADDRESSES':
      return action.addresses;
    case 'ADD_ADDRESS':
      return [...state, action.address];
    case 'UPDATE_ADDRESS':
      return state.map(addr => addr.id === action.address.id ? action.address : addr);
    case 'DELETE_ADDRESS':
      return state.filter(addr => addr.id !== action.id);
    case 'SET_DEFAULT':
      return state.map(addr => ({
        ...addr,
        isDefault: addr.id === action.id
      }));
    default:
      return state;
  }
}

export default function AddressManager({
  isDarkMode = false,
  onAddressSelect,
  selectedAddressId = null,
  userData = null,
  isAuthenticated = false
}: AddressManagerProps) {
  const [addresses, dispatch] = useReducer(addressReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // Fetch saved addresses when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setIsLoading(false);
      setShowAddressForm(true);
    }
  }, [isAuthenticated]);
  
  // Fetch addresses from API
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        if (data.addresses && Array.isArray(data.addresses)) {
          dispatch({ type: 'SET_ADDRESSES', addresses: data.addresses });
          
          // Select default address if available
          const defaultAddress = data.addresses.find((addr: SavedAddress) => addr.isDefault);
          if (defaultAddress && onAddressSelect) {
            onAddressSelect(defaultAddress);
            setShowAddressForm(false);
          } else if (data.addresses.length > 0 && onAddressSelect) {
            // Otherwise select the first address
            onAddressSelect(data.addresses[0]);
            setShowAddressForm(false);
          } else {
            // If no addresses, show the form with user data
            setShowAddressForm(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setShowAddressForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAddressForm = (addressId: string | null = null) => {
    setEditingAddressId(addressId);
    setShowAddressForm(!showAddressForm);
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      dispatch,
      selectedAddressId,
      isDarkMode,
      onAddressSelect,
      isAuthenticated,
      userData,
      editingAddressId,
      setEditingAddressId
    }}>
      <div className={`address-manager ${isDarkMode ? 'dark' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className={`animate-spin rounded-full h-6 w-6 border-t-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : (
          <>
            {!showAddressForm && addresses.length > 0 ? (
              <AddressList onAddNew={toggleAddressForm} />
            ) : (
              <AddressForm 
                onCancel={addresses.length > 0 ? () => toggleAddressForm(null) : undefined} 
                onSuccess={() => {
                  setShowAddressForm(false);
                  setEditingAddressId(null);
                  fetchAddresses();
                }}
                editingAddressId={editingAddressId}
              />
            )}
          </>
        )}
      </div>
    </AddressContext.Provider>
  );
}




