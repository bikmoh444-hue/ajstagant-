import {spawnSync} from 'node:child_process';
for(const script of ['check-domain','check-auth','check-session','check-security','check-admin','check-history-images','check-team-compatibility','check-uploads']){
 const result=spawnSync(process.execPath,[`scripts/${script}.mjs`],{stdio:'inherit',windowsHide:true});
 if(result.status!==0)process.exit(result.status??1);
}
