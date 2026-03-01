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
