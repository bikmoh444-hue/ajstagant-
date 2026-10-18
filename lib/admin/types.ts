export interface FieldDefinition {
 name: string; label: string; type: string; required: boolean; nullable: boolean;
 reference?: string; options?: readonly string[];
}
export interface CollectionDefinition { label: string; bucket: string; fields: readonly FieldDefinition[] }
export type AdminRole = 'super_admin' | 'editor';
export interface MutationResult { ok: boolean; message: string; id?: string; url?: string; errors?: Record<string,string[]> }
