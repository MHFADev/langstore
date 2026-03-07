import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'LANG STR - Top Up Game & Produk Digital';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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

        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '40px',
            boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
           <svg
            width="80"
            height="80"
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

        {/* Title */}
        <div
          style={{
            fontSize: 70,
            fontWeight: 800,
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
            letterSpacing: '-0.025em',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>LANG STORE</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Top Up Game Termurah & Produk Digital Terpercaya
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: '40px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '50px',
            padding: '12px 32px',
            fontSize: 24,
            color: '#60a5fa',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>✨ Proses Otomatis 24 Jam</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}