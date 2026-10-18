import { HomePage } from '@/components/home/home-page';
import { getHomeContent } from '@/lib/data/repository';
export default async function Page() { return <HomePage content={await getHomeContent()} />; }
