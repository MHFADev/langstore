export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  payment_qris_url?: string;
  payment_bank_name?: string;
  payment_account_number?: string;
  payment_account_name?: string;
  payment_dana_number?: string;
  payment_gopay_number?: string;
  whatsapp_number_admin?: string;
  favicon_url?: string;
  site_title?: string;
  site_description?: string;
  site_meta_image?: string;
  site_keywords?: string;
  google_analytics_id?: string;
  google_search_console_id?: string;
  canonical_url?: string;
  // Banner Settings (Legacy/Single)
  banner_url?: string;
  banner_title?: string;
  banner_description?: string;
  banner_active?: boolean;
}

export interface Banner {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_whatsapp: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  // Included relations
  product?: Product;
}
