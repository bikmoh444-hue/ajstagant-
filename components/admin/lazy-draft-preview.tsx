'use client';
import dynamic from 'next/dynamic';
export const LazyDraftPreview=dynamic(()=>import('./draft-preview').then(module=>module.DraftPreview),{
 loading:()=> <p role="status">Chargement de l’aperçu…</p>,
});
