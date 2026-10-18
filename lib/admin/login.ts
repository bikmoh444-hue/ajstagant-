import { z } from 'zod';

export const loginSchema = z.object({
 email: z.string().trim().pipe(z.email()),
 password: z.string().min(1).max(200),
});

export function loginErrorMessage(error: { code?: string; status?: number; name?: string }) {
 if (error.code === 'email_not_confirmed') return 'Confirmez votre adresse email avant de vous connecter. Si vous avez été invité, ouvrez le lien reçu pour définir votre mot de passe.';
 if (error.status === 429 || error.code === 'over_request_rate_limit') return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
 if (error.status === 0 || error.name === 'AuthRetryableFetchError' || (error.status ?? 0) >= 500) return 'Le service de connexion est indisponible. Vérifiez la connexion à Supabase puis réessayez.';
 if (error.code === 'email_provider_disabled') return 'La connexion par email est désactivée dans Supabase Auth.';
 return 'Email ou mot de passe incorrect. Utilisez le mot de passe défini pour ce compte Supabase.';
}

export function isAdminRole(role: unknown): role is 'editor' | 'super_admin' {
 return role === 'editor' || role === 'super_admin';
}
