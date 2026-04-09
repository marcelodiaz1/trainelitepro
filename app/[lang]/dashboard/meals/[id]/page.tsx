import { getDictionary } from "@/lib/get-dictionary";
import MealPlanDetailClient from "./MealPlanDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Details | Dashboard",
};

/**
 * Server Component: Meal Detail Page
 * Fetches the dictionary based on the URL locale and renders the Client Component.
 */
export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Await params for dynamic routing
  const { lang, id } = await params;

  // Fetch localized content
  const dict = await getDictionary(lang as any);

  return (
    <MealPlanDetailClient 
      dict={dict} 
      lang={lang} 
    />
  );
}