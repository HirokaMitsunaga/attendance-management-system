import { redirect } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  try {
    const me = await apiClient<MeResponse>('/me');
    if (me.role !== 'admin') {
      redirect('/unauthorized');
    }
  } catch {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}

