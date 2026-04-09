import { getDictionary } from "@/lib/get-dictionary";
import NewMealClient from "./NewMealClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Recipe | Dashboard",
};

/**
 * Server Component: New Meal Page
 * Fetches localization data and passes it to the client form.
 */
export default async function NewMealPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // Await the language parameter from the URL
  const { lang } = await params;

  // Fetch the dictionary for the requested language
  const dict = await getDictionary(lang as any);

  return (
    <NewMealClient 
      dict={dict} 
      lang={lang} 
    />
  );
}