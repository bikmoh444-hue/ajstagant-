import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const nodeRequire=createRequire(import.meta.url),calls=[];
let authorized=true,referenced=true;
const userId='e9b490ca-29bc-4f4d-8533-565244d19bdd';
const storage={
 upload:async(path,bytes,options)=>{calls.push({path,length:bytes.length,options});return {error:null};},
 getPublicUrl:path=>({data:{publicUrl:`https://test.supabase.co/storage/v1/object/public/players/${path}`}}),
 remove:async()=>{calls.push({remove:true});return {error:null};},
};
const client={storage:{from:()=>storage},rpc:async()=>({data:referenced,error:null}),from:()=>({
 insert:async()=>({error:null}),select(){return this;},eq(){return this;},
 single:async()=>({data:{bucket_id:'players',public_url:'https://test.example/photo.png',object_path:'photo.png'},error:null}),
 delete(){return this;},then(resolve){return Promise.resolve({error:null}).then(resolve);},
})};
const loaded={exports:{}};
const {outputText}=ts.transpileModule(readFileSync('app/admin/media-actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const require=id=>id==='next/cache'?{revalidatePath(){}}:id==='@/lib/admin/auth'?{requireAdmin:async()=>{if(!authorized)throw new Error('unauthorized');return {client,user:{id:userId}};}}:nodeRequire(id);
new Function('require','exports','module',outputText)(require,loaded.exports,loaded);
const {uploadMedia,deleteMedia}=loaded.exports;
function form(bytes,mime='image/png',bucket='players'){const data=new FormData();data.set('bucket',bucket);data.set('file',new File([bytes],'original-untrusted-name.svg',{type:mime}));return data;}
authorized=false;await assert.rejects(()=>uploadMedia(form('image')),/unauthorized/);authorized=true;
assert.equal((await uploadMedia(form('<svg onload="alert(1)"></svg>','image/svg+xml'))).ok,false);
assert.equal((await uploadMedia(form(''))).ok,false);
assert.equal((await uploadMedia(form(new Uint8Array(5242881)))).ok,false);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRL0AAAAASUVORK5CYII=','base64');
assert.equal((await uploadMedia(form(png,'image/jpeg'))).ok,false);
assert.equal((await uploadMedia(form(png,'image/png','private'))).ok,false);
assert.equal(calls.length,0);
assert.equal((await uploadMedia(form(png))).ok,true);
assert.match(calls[0].path,new RegExp(`^${userId}/[0-9a-f-]{36}\\.png$`));
assert.equal(calls[0].options.contentType,'image/png');assert.equal(calls[0].options.upsert,false);
assert.equal((await deleteMedia(userId)).ok,false);assert.ok(!calls.some(call=>call.remove));
referenced=false;assert.equal((await deleteMedia(userId)).ok,true);
authorized=false;await assert.rejects(()=>deleteMedia(userId),/unauthorized/);
console.log('PASS médias simulés : autorisation, formats, signature MIME, quota 5 Mo, noms UUID et protection des images référencées.');
