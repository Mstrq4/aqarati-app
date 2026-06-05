// أنواع بيانات تطبيق عقاراتي

export type PropertyType = 'شقة' | 'فيلا' | 'أرض' | 'مكتب' | 'محل' | 'مستودع' | 'عمارة';

export type PropertyStatus = 'للبيع' | 'للإيجار' | 'بيع أو إيجار';

export type PropertyCategory = 'سكني' | 'تجاري' | 'صناعي' | 'زراعي';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  category: PropertyCategory;
  price: number;
  area: number; // متر مربع
  bedrooms: number;
  bathrooms: number;
  floor: number;
  age: number; // سنة
  location: {
    city: string;
    district: string;
    street: string;
    coordinates: { lat: number; lng: number };
  };
  features: string[];
  images: string[];
  owner: {
    name: string;
    phone: string;
    type: 'مالك' | 'مكتب عقاري';
  };
  createdAt: string;
  views: number;
  favorites: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'مستخدم' | 'وسيط' | 'مدير مكتب';
  officeId?: string;
  savedProperties: string[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'عقار' | 'رسالة' | 'تذكير' | 'نظام';
  read: boolean;
  createdAt: string;
  propertyId?: string;
}

export interface Office {
  id: string;
  name: string;
  logo?: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  propertyCount: number;
  verified: boolean;
}

export interface SearchFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  features?: string[];
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'معاينة' | 'دفعة' | 'موعد' | 'أخرى';
  completed: boolean;
  propertyId?: string;
}

// نوع جهة اتصال
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  notes?: string;
  createdAt: string;
}
