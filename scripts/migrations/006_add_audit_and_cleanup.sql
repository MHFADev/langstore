
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to admins (service role)
CREATE POLICY "Allow service role to do everything on audit_logs" 
ON public.audit_logs 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON public.audit_logs(operation);

-- Index for orders cleanup
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at);

-- Function to cleanup old orders (can be called via RPC or Cron)
-- Note: File deletion usually happens in application layer, but we can delete records here.
CREATE OR REPLACE FUNCTION cleanup_old_orders_records()
RETURNS TABLE (deleted_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INT;
BEGIN
    -- Delete orders that are 'completed' or 'cancelled' and older than 24 hours
    -- We can also archive them to another table if needed, but requirements say "delete".
    
    WITH deleted AS (
        DELETE FROM public.orders
        WHERE status IN ('completed', 'cancelled') 
          AND created_at < NOW() - INTERVAL '24 hours'
        RETURNING id, status, created_at
    )
    SELECT count(*) INTO affected_rows FROM deleted;

    -- Log the operation if anything was deleted
    IF affected_rows > 0 THEN
        INSERT INTO public.audit_logs (operation, table_name, old_data)
        VALUES (
            'BATCH_DELETE', 
            'orders', 
            jsonb_build_object('description', 'Auto-cleanup of old orders', 'count', affected_rows)
        );
    END IF;

    RETURN QUERY SELECT affected_rows;
END;
$$;
