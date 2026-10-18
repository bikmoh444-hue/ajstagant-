import { getPublicSettings } from '@/lib/data/public-settings';
export const dynamic='force-dynamic';
export async function GET(){
 const settings=await getPublicSettings();
 if(settings.favicon_url)return new Response(null,{status:307,headers:{Location:settings.favicon_url,'Cache-Control':'no-store'}});
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${settings.secondary_color}"/><circle cx="32" cy="32" r="27" fill="none" stroke="${settings.accent_color}" stroke-width="3"/><text x="32" y="39" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="8" fill="${settings.accent_color}">A.J.S TAGANT</text></svg>`;
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store'}});
}
