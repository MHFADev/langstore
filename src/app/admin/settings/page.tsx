import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UpdatePasswordForm } from '@/components/admin/UpdatePasswordForm';
import { UpdateEmailForm } from '@/components/admin/UpdateEmailForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminHeader userEmail={user.email} />

      <main className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Akun</h1>
          <p className="text-muted-foreground">
            Kelola informasi login dan keamanan akun admin Anda.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:max-w-4xl">
          <UpdateEmailForm currentEmail={user.email || ''} />
          <UpdatePasswordForm />
        </div>
      </main>
    </div>
  );
}
