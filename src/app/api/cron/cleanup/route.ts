
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role)
// We need service role to delete users' files and records without RLS restrictions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Cron Job Handler for Cleanup
 * 
 * This endpoint should be called periodically (e.g., every hour) to clean up old orders.
 * It deletes orders with status 'completed' or 'cancelled' that are older than 24 hours.
 * It also cleans up associated storage files (proof of payment, etc.) if any.
 * 
 * Security: Protected by a CRON_SECRET header.
 */
export async function GET(req: NextRequest) {
  // 1. Verify Authentication
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 2. Fetch orders to be deleted
    const { data: orders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_proof_url, status, created_at')
      .in('status', ['completed', 'cancelled'])
      .lt('created_at', twentyFourHoursAgo);

    if (fetchError) {
      console.error('Error fetching old orders:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders to cleanup', count: 0 });
    }

    // 3. Delete files from Storage
    const filesToDelete: string[] = [];
    orders.forEach(order => {
      if (order.payment_proof_url) {
        // Extract file path from URL if possible, or just the filename
        // Assuming payment_proof_url stores the full public URL or path
        // We need the path relative to the bucket.
        // Example: https://xyz.supabase.co/storage/v1/object/public/payments/proof.jpg
        // We need "proof.jpg" or "folder/proof.jpg"
        
        try {
          const url = new URL(order.payment_proof_url);
          const pathParts = url.pathname.split('/public/payments/'); // Adjust based on your bucket structure
          if (pathParts.length > 1) {
            filesToDelete.push(pathParts[1]);
          }
        } catch (e) {
          console.warn('Invalid URL format for payment proof:', order.payment_proof_url);
        }
      }
    });

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('payments')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // We continue to delete records even if file deletion fails, 
        // but ideally we should log this.
      }
    }

    // 4. Delete Records from DB
    const orderIds = orders.map(o => o.id);
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (deleteError) {
      throw deleteError;
    }

    // 5. Audit Log
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        operation: 'AUTO_CLEANUP',
        table_name: 'orders',
        old_data: {
            count: orders.length,
            ids: orderIds,
            deleted_files: filesToDelete
        },
        performed_by: null // System
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json({
      message: 'Cleanup successful',
      deleted_orders_count: orders.length,
      deleted_files_count: filesToDelete.length
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup Cron Job Failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
