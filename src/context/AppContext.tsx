import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Property {
  id: string;
  title: string;
  type: 'شقة' | 'فيلا' | 'أرض' | 'محل';
  purpose: 'بيع' | 'إيجار' | 'استثمار';
  city: string;
  district: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  status: 'نشط' | 'مسودة';
  createdAt: string;
}

interface AppContextType {
  properties: Property[];
  addProperty: (p: Omit<Property, 'id' | 'status' | 'createdAt'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);

  const addProperty = useCallback((p: Omit<Property, 'id' | 'status' | 'createdAt'>) => {
    const newProp: Property = {
      ...p,
      id: Date.now().toString(),
      status: 'نشط',
      createdAt: new Date().toISOString(),
    };
    setProperties(prev => [newProp, ...prev]);
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ properties, addProperty, updateProperty, deleteProperty }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
