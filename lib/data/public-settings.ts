import 'server-only';
import { cache } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/public';
import type { Row } from '@/lib/supabase/database';
import { navigation } from './navigation';
import { getLocale } from '@/lib/locale';
import { translate } from '@/lib/i18n';
export const getPublicSettings=cache(async():Promise<Row<'site_settings'>>=>{
 if(!isSupabaseConfigured())return {id:'preview',singleton:true,club_name:'A.J.S TAGANT',club_name_ar:'الجمعية الشبابية لرياضة تكانت',slogan:'Plus qu’une équipe, une famille.',slogan_ar:'أكثر من فريق، عائلة واحدة',logo_url:null,header_logo_url:null,footer_logo_url:null,favicon_url:null,primary_color:'#2F4294',secondary_color:'#101A49',accent_color:'#F8DA32',background_color:'#FFFFFF',heading_font:'Anton',body_font:'Poppins',contact_email:null,contact_phone:null,whatsapp_url:null,address:'Tagant, Maroc',address_ar:'تكانت، المغرب',map_url:null,facebook_url:null,instagram_url:null,youtube_url:null,tiktok_url:null,footer_text:'A.J.S TAGANT. Tous droits réservés.',seo_title:null,seo_description:null,seo_image_url:null,updated_at:''};
 const {data,error}=await createPublicClient().from('site_settings').select('*').single();
 if(error||!data)throw new Error('Configuration publique indisponible. Vérifier les migrations et le seed.');
 return data;
});
export const getPublicNavigation=cache(async()=>{
 const locale=await getLocale();
 if(!isSupabaseConfigured())return navigation.map(item=>({...item,label:translate(locale,item.label)}));
 const {data,error}=await createPublicClient().from('navigation_items').select('*').order('sort_order');
 if(error)throw new Error('Navigation indisponible');
 return (data??[]).map(item=>({href:item.href,label:locale==='ar'&&item.label_ar?item.label_ar:item.label_fr}));
});
