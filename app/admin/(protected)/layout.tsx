import { requireAdmin } from '@/lib/admin/auth';
import { AdminShell } from '@/components/admin/admin-shell';
export default async function Layout({children}:{children:React.ReactNode}){
 const {client,user,role}=await requireAdmin();
 const {data}=await client.from('site_settings').select('club_name,logo_url').single();
 return <AdminShell name={data?.club_name??'A.J.S TAGANT'} logo={data?.logo_url??null} email={user.email??user.id} role={role}>{children}</AdminShell>;
}
