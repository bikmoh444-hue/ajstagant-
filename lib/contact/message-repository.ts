import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContactMessageRepository } from '@/lib/types/contact';
import { createServiceClient } from '@/lib/supabase/service';
import { contactStorageMode } from './config';
import { createHash } from 'node:crypto';

export class ContactStorageUnavailable extends Error {}
export class ContactQuotaExceeded extends Error {}

// Adaptateur local explicite. L'étape Supabase remplacera ce dépôt.
export function getContactMessageRepository(source='shared'): ContactMessageRepository {
  const mode = contactStorageMode();
  return {
    async save(message) {
      if(mode==='supabase'){
        if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new ContactStorageUnavailable('Contact service not configured');
        const key=createHash('sha256').update(`${process.env.CONTACT_RATE_LIMIT_SECRET??process.env.SUPABASE_SERVICE_ROLE_KEY}:${source}`).digest('hex');
        const {data,error}=await createServiceClient().rpc('submit_contact',{p_key:key,p_full_name:message.name,p_email:message.email,p_phone:message.phone??'',p_subject:message.subject,p_message:message.message});
        if(error){if(error.message.includes('CONTACT_RATE_LIMIT'))throw new ContactQuotaExceeded();throw new Error('Contact persistence failed');}
        message.id=data;return;
      }
      if (mode !== 'local') throw new ContactStorageUnavailable('Contact storage disabled');
      const directory = path.resolve(process.cwd(), '.local', 'contact-messages');
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(path.join(directory, `${message.id}.json`), JSON.stringify(message, null, 2), { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    },
  };
}
