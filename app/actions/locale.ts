'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
export async function setLocale(value:string) {
 if(value!=='fr'&&value!=='ar')throw new Error('Langue invalide');
 (await cookies()).set('ajt-locale',value,{path:'/',sameSite:'lax',httpOnly:true,secure:process.env.NODE_ENV==='production',maxAge:31536000});
 revalidatePath('/','layout');
}
