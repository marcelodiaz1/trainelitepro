import { getDictionary } from "@/lib/get-dictionary";
import EditMealPlanClient from "./EditMealPlanClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Meal Plan | Dashboard",
};

/**
 * Server Component: Edit Meal Plan Page
 * Extracts the 'lang' and 'id' from the URL and initializes translations.
 */
export default async function EditMealPlanPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Await the URL parameters
  const { lang, id } = await params;

  // Fetch the dictionary for the requested language (en, es, zh)
  const dict = await getDictionary(lang as any);

  return (
    <EditMealPlanClient 
      dict={dict} 
      lang={lang} 
    />
  );
}