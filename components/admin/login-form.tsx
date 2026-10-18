'use client';
import { useActionState } from 'react';
import { loginAction } from '@/app/admin/actions';
export function LoginForm(){const [state,action,pending]=useActionState(loginAction,{ok:false,message:''});return <form action={action} className="admin-login-form"><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Mot de passe<input name="password" type="password" autoComplete="current-password" required/></label>{state.message&&<p role="alert" className="admin-notice error">{state.message}</p>}<button className="button primary" disabled={pending}>{pending?'CONNEXION…':'SE CONNECTER'}</button></form>;}
