import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Property, Contact, Reminder, Notification, SearchFilters } from '../types';

// ============ أنواع جهات الاتصال ============
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string; // مالك، مستأجر، وسيط، محامي، مهندس، إلخ
  notes?: string;
  createdAt: string;
}

// ============ عينات أولية ============
const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'sample_1',
    title: 'فيلا الياسمين',
    description: 'فيلا راقية بتصميم عصري، مدخل خاص، حديقة واسعة، مسبح. أضف صوراً حقيقية من معرض هاتفك.',
    type: 'فيلا',
    status: 'للبيع',
    category: 'سكني',
    price: 2500000,
    area: 450,
    bedrooms: 6,
    bathrooms: 5,
    floor: 2,
    age: 3,
    location: { city: 'الرياض', district: 'الياسمين', street: 'شارع الأمير تركي', coordinates: { lat: 24.8239, lng: 46.6525 } },
    features: ['مسبح', 'حديقة', 'مجلس', 'مصعد', 'تكييف مركزي'],
    images: [],
    owner: { name: 'أنت', phone: '', type: 'مالك' },
    createdAt: new Date().toISOString(),
    views: 0,
    favorites: 0,
  },
];

const SAMPLE_CONTACTS: Contact[] = [
  { id: 'c_1', name: 'محمد العقيل', phone: '0500000001', role: 'وسيط', email: 'moh@example.com', notes: 'مكتب الأفق', createdAt: new Date().toISOString() },
  { id: 'c_2', name: 'المهندس خالد', phone: '0500000002', role: 'مهندس', notes: 'فحص إنشائي', createdAt: new Date().toISOString() },
  { id: 'c_3', name: 'المحامي سلمان', phone: '0500000003', role: 'محامي', email: 'salman@law.sa', createdAt: new Date().toISOString() },
];

const SAMPLE_REMINDERS: Reminder[] = [
  { id: 'r_1', title: 'معاينة فيلا الياسمين', description: 'مع المشتري المحتمل', date: '2026-06-10', time: '17:00', type: 'معاينة', completed: false, propertyId: 'sample_1' },
  { id: 'r_2', title: 'تجديد عقد الإيجار', description: 'شقة الكورنيش', date: '2026-06-20', time: '12:00', type: 'موعد', completed: false },
];

const STORAGE_KEYS = {
  PROPERTIES: 'aqarati_properties',
  CONTACTS: 'aqarati_contacts',
  REMINDERS: 'aqarati_reminders',
  SEEN_ONBOARDING: 'aqarati_seen_onboarding',
  USER_NAME: 'aqarati_user_name',
};

// ============ مسار تخزين الصور المحلي ============
const IMAGES_DIR = FileSystem.documentDirectory + 'aqarati_images/';

// ============ سياق التطبيق ============
interface AppState {
  // البيانات
  properties: Property[];
  contacts: Contact[];
  reminders: Reminder[];
  userName: string;
  seenOnboarding: boolean;
  isLoading: boolean;

  // العقارات
  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'views' | 'favorites'>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Property | undefined;
  searchProperties: (filters: SearchFilters) => Property[];

  // جهات الاتصال
  addContact: (c: Omit<Contact, 'id' | 'createdAt'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // التذكيرات
  addReminder: (r: Omit<Reminder, 'id'>) => Promise<Reminder>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  // الصور
  saveImage: (uri: string, propertyId: string) => Promise<string>;
  deleteImage: (localUri: string) => Promise<void>;

  // الإعدادات
  setUserName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userName, setUserNameState] = useState('');
  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ============ تحميل أولي ============
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true }).catch(() => {});

      const [props, cons, rems, seen, name] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROPERTIES),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.SEEN_ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
      ]);

      const isFirstLaunch = !seen;
      if (isFirstLaunch) {
        // أول تشغيل: تعبئة عينات
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(SAMPLE_PROPERTIES)),
          AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(SAMPLE_CONTACTS)),
          AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(SAMPLE_REMINDERS)),
          AsyncStorage.setItem(STORAGE_KEYS.SEEN_ONBOARDING, 'true'),
        ]);
        setProperties(SAMPLE_PROPERTIES);
        setContacts(SAMPLE_CONTACTS);
        setReminders(SAMPLE_REMINDERS);
        setSeenOnboarding(true);
      } else {
        setProperties(props ? JSON.parse(props) : []);
        setContacts(cons ? JSON.parse(cons) : []);
        setReminders(rems ? JSON.parse(rems) : []);
        setSeenOnboarding(true);
      }

      if (name) setUserNameState(name);
    } catch (e) {
      console.error('خطأ في التحميل:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistProperties = async (updated: Property[]) => {
    setProperties(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
  };
  const persistContacts = async (updated: Contact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updated));
  };
  const persistReminders = async (updated: Reminder[]) => {
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  };

  // ============ العقارات ============
  const addProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'views' | 'favorites'>): Promise<Property> => {
    const newProp: Property = {
      ...data,
      id: 'prop_' + Date.now(),
      createdAt: new Date().toISOString(),
      views: 0,
      favorites: 0,
    };
    const updated = [newProp, ...properties];
    await persistProperties(updated);
    return newProp;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const updated = properties.map(p => p.id === id ? { ...p, ...updates } : p);
    await persistProperties(updated);
  };

  const deleteProperty = async (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      // حذف الصور المرتبطة
      for (const img of prop.images) {
        await FileSystem.deleteAsync(img, { idempotent: true }).catch(() => {});
      }
    }
    const updated = properties.filter(p => p.id !== id);
    await persistProperties(updated);
  };

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const searchProperties = (filters: SearchFilters): Property[] => {
    let result = [...properties];
    if (filters.city) result = result.filter(p => p.location.city === filters.city);
    if (filters.type) result = result.filter(p => p.type === filters.type);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.minPrice !== undefined) result = result.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) result = result.filter(p => p.price <= filters.maxPrice!);
    if (filters.minArea !== undefined) result = result.filter(p => p.area >= filters.minArea!);
    if (filters.maxArea !== undefined) result = result.filter(p => p.area <= filters.maxArea!);
    if (filters.bedrooms !== undefined) result = result.filter(p => p.bedrooms >= filters.bedrooms!);
    if (filters.features?.length) result = result.filter(p => filters.features!.every(f => p.features.includes(f)));
    return result;
  };

  // ============ جهات الاتصال ============
  const addContact = async (data: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> => {
    const newContact: Contact = { ...data, id: 'c_' + Date.now(), createdAt: new Date().toISOString() };
    const updated = [newContact, ...contacts];
    await persistContacts(updated);
    return newContact;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    await persistContacts(updated);
  };

  const deleteContact = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    await persistContacts(updated);
  };

  // ============ التذكيرات ============
  const addReminder = async (data: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const newRem: Reminder = { ...data, id: 'r_' + Date.now() };
    const updated = [newRem, ...reminders];
    await persistReminders(updated);
    return newRem;
  };

  const toggleReminder = async (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    await persistReminders(updated);
  };

  const deleteReminder = async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    await persistReminders(updated);
  };

  // ============ الصور ============
  const saveImage = async (uri: string, propertyId: string): Promise<string> => {
    const fileName = `${propertyId}_${Date.now()}.jpg`;
    const destPath = IMAGES_DIR + fileName;
    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  };

  const deleteImage = async (localUri: string) => {
    await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
  };

  // ============ الإعدادات ============
  const setUserName = async (name: string) => {
    setUserNameState(name);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  };

  return (
    <AppContext.Provider value={{
      properties, contacts, reminders, userName, seenOnboarding, isLoading,
      addProperty, updateProperty, deleteProperty, getProperty, searchProperties,
      addContact, updateContact, deleteContact,
      addReminder, toggleReminder, deleteReminder,
      saveImage, deleteImage,
      setUserName,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
