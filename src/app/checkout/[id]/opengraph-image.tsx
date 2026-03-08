import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export const alt = 'LANG STR Product';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Initialize Supabase Client directly for edge runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch product data
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  // Default values
  const productName = product?.name || 'Produk LANG STR';
  const productPrice = product?.price 
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)
    : '';
  const productImage = product?.image_url;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        />

        {/* Main Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '90%',
            height: '80%',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Left Side: Product Image */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {productImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={productImage}
                alt={productName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
            
            {/* Price Tag Overlay */}
            {productPrice && (
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: '#2563eb',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  fontSize: 24,
                  fontWeight: 700,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                {productPrice}
              </div>
            )}
          </div>

          {/* Right Side: Info & Logo */}
          <div
            style={{
              width: '35%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '40px',
              background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  fontSize: 16,
                  color: '#60a5fa',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Available Now
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {productName}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#3b82f6',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>LANG STR</span>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>Trusted Digital Store</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
