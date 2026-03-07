'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Terjadi Kesalahan
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Maaf, sistem sedang mengalami gangguan. Kami sedang berusaha memperbaikinya.
        {error.message.includes('Konfigurasi') && (
          <span className="block mt-2 text-sm text-destructive font-medium bg-destructive/5 p-2 rounded">
            {error.message}
          </span>
        )}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Refresh Halaman
        </button>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
