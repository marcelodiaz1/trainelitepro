import { getDictionary } from "@/lib/get-dictionary";
import MealPlanDetailClient from "./MealPlanDetailClient";

/**
 * Server Component that fetches the translation dictionary 
 * and passes it to the Client Component.
 */
export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Await the params (required in newer Next.js versions)
  const { lang, id } = await params;
  
  // Fetch the specific dictionary (en, es, etc.)
  const dict = await getDictionary(lang as any);

  return (
    <MealPlanDetailClient 
      dict={dict} 
      lang={lang} 
    />
  );
}