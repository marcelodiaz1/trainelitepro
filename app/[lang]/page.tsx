import { getDictionary } from '@/lib/get-dictionary'
import HomeClient from '@/components/HomeClient'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  console.log("Current URL Lang:", lang); // Check your terminal!

  const dict = await getDictionary(lang as any);
  
  if (!dict) {
    return <div>Error: Dictionary not found for {lang}</div>;
  }

  return <HomeClient dict={dict} />;
}