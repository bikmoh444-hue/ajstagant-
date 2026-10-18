type DocumentObject=Record<string,unknown>;
const object=(value:unknown):DocumentObject=>value&&typeof value==='object'&&!Array.isArray(value)?value as DocumentObject:{};
const url=(value:unknown)=>typeof value==='string'&&value.trim()?value:null;

// Source commune, indépendante de la langue. Compatibilité avec les anciens
// documents : récupérer d'abord la photo FR, puis AR, sans modifier son URL.
export function historyImageSource(settings:unknown,imageUrl:unknown):string|null{
 const docs=object(settings);
 return url(imageUrl)??url(object(object(docs.fr).image).src)??url(object(object(docs.ar).image).src);
}

export function historyDocumentWithImage(document:unknown,imageUrl:string|null):DocumentObject{
 const doc=object(document);
 return {...doc,image:{alt:'',caption:'',...object(doc.image),src:imageUrl}};
}

// Ne conserver aucune source d'image dans les textes localisés. Garder les
// anciennes références divergentes pour ne perdre aucun média existant.
export function historyTextDocuments(settings:unknown,imageUrl:string|null):DocumentObject{
 const docs=structuredClone(object(settings));
 const originalSource=historyImageSource(settings,null);
 const previous=Array.isArray(docs._legacy_history_image_url)?docs._legacy_history_image_url.filter((item):item is string=>typeof item==='string'):[];
 for(const locale of ['fr','ar']){
  const doc=object(docs[locale]);const image={...object(doc.image)};
  const oldUrl=url(image.src);if(imageUrl&&imageUrl===originalSource&&oldUrl&&oldUrl!==imageUrl)previous.push(oldUrl);
  delete image.src;docs[locale]={...doc,image};
 }
 if(previous.length)docs._legacy_history_image_url=[...new Set(previous)];
 return docs;
}
