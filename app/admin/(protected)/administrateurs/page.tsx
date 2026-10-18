import { requireAdmin } from '@/lib/admin/auth';
import { AdminUsers } from '@/components/admin/admin-users';
export default async function Page(){const {client}=await requireAdmin(true);const {data,error}=await client.from('admin_users').select('*').order('created_at');if(error)throw new Error('Liste des administrateurs indisponible.');return <AdminUsers users={data??[]}/>;}
