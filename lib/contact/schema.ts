import { z } from 'zod';
import type { ContactErrors } from '@/lib/types/contact';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez au moins 2 caractères.').max(100, 'Le nom est limité à 100 caractères.'),
  email: z.string().trim().email('Indiquez une adresse email valide.').max(254, 'Adresse email trop longue.'),
  phone: z.string().trim().max(30, 'Le téléphone est limité à 30 caractères.').refine(value => !value || /^[+\d\s().-]{6,30}$/.test(value), 'Indiquez un numéro de téléphone valide.').optional(),
  subject: z.string().trim().max(150, 'Le sujet est limité à 150 caractères.').optional().transform(value=>value&&value.length>=3?value:'Message du site'),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.').max(5000, 'Votre message est limité à 5 000 caractères.'),
  website: z.string().max(0, 'Soumission refusée.').default(''),
});

export function contactFieldErrors(error: z.ZodError): ContactErrors {
  return error.flatten().fieldErrors as ContactErrors;
}
