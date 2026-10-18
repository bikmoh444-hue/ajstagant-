import type { NextConfig } from 'next';

// Autoriser uniquement le projet Storage configuré.
const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];
if (storageUrl) {
  const url = new URL(storageUrl);
  if (url.protocol === 'https:' || url.protocol === 'http:') {
    remotePatterns.push({
      protocol: url.protocol === 'https:' ? 'https' : 'http', hostname: url.hostname,
      port: url.port, pathname: '/storage/v1/object/**',
    });
  }
}

// Un serveur dev ouvert ne doit pas écraser les artefacts du build de production.
const config: NextConfig = {
 distDir:process.env.NODE_ENV==='development'?'.next':'.next-production',
 poweredByHeader:false,
 images:{remotePatterns},
 experimental:{serverActions:{bodySizeLimit:'6mb'}},
 async headers(){return [{source:'/:path*',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  {key:'Content-Security-Policy',value:"frame-ancestors 'none'; base-uri 'self'; object-src 'none'"},
 ]}];},
};
export default config;
