import React, { createContext, useContext, useState, useEffect } from 'react';
import { itemService } from '../services/api';

const InspectorContext = createContext();

export const InspectorProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeClaimItem, setActiveClaimItem] = useState(null);
  const [activeMatchItem, setActiveMatchItem] = useState(null);

  // Load an initial item for inspector preview if none selected
  useEffect(() => {
    if (!selectedItem) {
      itemService
        .getAll({ limit: 1 })
        .then((res) => {
          if (res.data.success && res.data.items?.length > 0) {
            setSelectedItem(res.data.items[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <InspectorContext.Provider
      value={{
        selectedItem,
        setSelectedItem,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        activeClaimItem,
        setActiveClaimItem,
        activeMatchItem,
        setActiveMatchItem,
      }}
    >
      {children}
    </InspectorContext.Provider>
  );
};

export const useInspector = () => useContext(InspectorContext);
export default InspectorContext;
