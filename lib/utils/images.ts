// Optimiser uniquement les images publiques connues. Les URLs externes et
// signées gardent leur comportement existant, sans requête serveur arbitraire.
export function canOptimizeImage(src:string):boolean{
 if(!src||/\.(svg|ico)(?:[?#]|$)/i.test(src))return false;
 if(/^\/images\/(?!\/)/.test(src)&&!src.includes('..'))return true;
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!base)return false;
 try{
  const image=new URL(src),configured=new URL(base);
  return image.origin===configured.origin&&image.pathname.startsWith('/storage/v1/object/public/')&&!image.search&&!image.username&&!image.password;
 }catch{return false;}
}
