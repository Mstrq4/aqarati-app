// ============ طبقة API وهمية للمرحلة الأولى ============

import { Property, User, Notification, Reminder, SearchFilters, Office } from '../types';
import { MOCK_PROPERTIES, MOCK_USERS, MOCK_OFFICES, MOCK_NOTIFICATIONS, MOCK_REMINDERS } from '../data/mockData';

// محاكاة تأخير الشبكة
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ============ المصادقة ============

export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay();
    // محاكاة تسجيل دخول وهمي
    if (!email || !password) throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
    const user = MOCK_USERS['user_1'];
    return { user, token: 'mock_token_' + Date.now() };
  },

  async register(data: { name: string; email: string; phone: string; password: string; role: string }): Promise<{ user: User; token: string }> {
    await delay();
    if (!data.email || !data.password) throw new Error('البيانات غير مكتملة');
    const user: User = {
      id: 'user_' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role as User['role'],
      savedProperties: [],
      notifications: [],
    };
    return { user, token: 'mock_token_' + Date.now() };
  },

  async getProfile(): Promise<User> {
    await delay(500);
    return MOCK_USERS['user_1'];
  },

  logout() {
    return Promise.resolve(true);
  },
};

// ============ العقارات ============

export const propertiesAPI = {
  async search(filters: SearchFilters = {}): Promise<Property[]> {
    await delay();
    let result = [...MOCK_PROPERTIES];

    if (filters.city) result = result.filter(p => p.location.city === filters.city);
    if (filters.type) result = result.filter(p => p.type === filters.type);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.minPrice) result = result.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice) result = result.filter(p => p.price <= filters.maxPrice!);
    if (filters.minArea) result = result.filter(p => p.area >= filters.minArea!);
    if (filters.maxArea) result = result.filter(p => p.area <= filters.maxArea!);
    if (filters.bedrooms) result = result.filter(p => p.bedrooms >= filters.bedrooms!);
    if (filters.features?.length) {
      result = result.filter(p => filters.features!.every(f => p.features.includes(f)));
    }

    return result;
  },

  async getById(id: string): Promise<Property | null> {
    await delay(500);
    return MOCK_PROPERTIES.find(p => p.id === id) || null;
  },

  async getSimilar(propertyId: string, limit: number = 4): Promise<Property[]> {
    await delay(600);
    const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
    if (!prop) return [];
    return MOCK_PROPERTIES
      .filter(p => p.id !== propertyId && (p.type === prop.type || p.status === prop.status))
      .slice(0, limit);
  },

  async getFeatured(): Promise<Property[]> {
    await delay(500);
    return MOCK_PROPERTIES.sort((a, b) => b.views - a.views).slice(0, 4);
  },

  async getLatest(): Promise<Property[]> {
    await delay(500);
    return [...MOCK_PROPERTIES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getByCity(city: string): Promise<Property[]> {
    await delay();
    return MOCK_PROPERTIES.filter(p => p.location.city === city);
  },

  async toggleFavorite(propertyId: string): Promise<boolean> {
    await delay(300);
    return true;
  },

  async addProperty(data: Partial<Property>): Promise<Property> {
    await delay(1200);
    const newProp: Property = {
      id: 'prop_' + Date.now(),
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'شقة',
      status: data.status || 'للبيع',
      category: data.category || 'سكني',
      price: data.price || 0,
      area: data.area || 0,
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      floor: data.floor || 0,
      age: data.age || 0,
      location: data.location || { city: '', district: '', street: '', coordinates: { lat: 0, lng: 0 } },
      features: data.features || [],
      images: data.images || [],
      owner: data.owner || { name: '', phone: '', type: 'مالك' },
      createdAt: new Date().toISOString(),
      views: 0,
      favorites: 0,
    };
    return newProp;
  },
};

// ============ المكاتب ============

export const officesAPI = {
  async getAll(): Promise<Office[]> {
    await delay(600);
    return MOCK_OFFICES;
  },

  async getById(id: string): Promise<Office | null> {
    await delay(400);
    return MOCK_OFFICES.find(o => o.id === id) || null;
  },

  async getTopRated(): Promise<Office[]> {
    await delay(500);
    return [...MOCK_OFFICES].sort((a, b) => b.rating - a.rating);
  },
};

// ============ التذكيرات ============

export const remindersAPI = {
  async getAll(): Promise<Reminder[]> {
    await delay(400);
    return MOCK_REMINDERS;
  },

  async getUpcoming(): Promise<Reminder[]> {
    await delay(300);
    return MOCK_REMINDERS.filter(r => !r.completed);
  },

  async toggle(id: string): Promise<Reminder> {
    await delay(300);
    const rem = MOCK_REMINDERS.find(r => r.id === id);
    if (rem) rem.completed = !rem.completed;
    return rem!;
  },

  async add(data: Partial<Reminder>): Promise<Reminder> {
    await delay(500);
    return {
      id: 'rem_' + Date.now(),
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      time: data.time || '',
      type: data.type || 'أخرى',
      completed: false,
      propertyId: data.propertyId,
    };
  },
};

// ============ الإشعارات ============

export const notificationsAPI = {
  async getAll(): Promise<Notification[]> {
    await delay(400);
    return MOCK_NOTIFICATIONS;
  },

  async getUnreadCount(): Promise<number> {
    await delay(200);
    return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  },

  async markRead(id: string): Promise<void> {
    await delay(200);
    const n = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (n) n.read = true;
  },

  async markAllRead(): Promise<void> {
    await delay(300);
    MOCK_NOTIFICATIONS.forEach(n => n.read = true);
  },
};
