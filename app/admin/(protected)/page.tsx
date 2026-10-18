import { requireAdmin } from '@/lib/admin/auth';
import { DashboardHome } from '@/components/admin/dashboard-home';
export default async function Page(){await requireAdmin();return <DashboardHome/>;}
