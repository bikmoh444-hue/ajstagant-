import { Trophy, Medal, Award } from 'lucide-react';
export function TrophySymbol({name}:{name?:string}){const Icon=name==='medal'?Medal:name==='award'?Award:Trophy;return <Icon size={32}/>;}
