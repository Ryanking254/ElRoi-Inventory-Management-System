import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

const CategoryContext = createContext({
  categories: [],
  loading: false,
  error: null,
  addCategory: async () => ({ success: false }),
  refreshCategories: () => {},
});

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Failed to load categories:', err.message);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: 'Name is required' };

    try {
      const newCategory = await categoryService.create(trimmed);
      setCategories((prev) => [...prev, newCategory]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        addCategory,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}