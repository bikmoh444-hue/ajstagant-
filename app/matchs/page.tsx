import { getPageMetadata } from '@/lib/data/metadata';
import './matches.css';
import { MatchesPage } from '@/components/matches/matches-page';
import { getSportsContent } from '@/lib/data/repository';
export async function generateMetadata(){return getPageMetadata('matchs');}
export default async function Page() { return <MatchesPage content={await getSportsContent()} />; }
