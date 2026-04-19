import { getDictionary } from "@/lib/get-dictionary";
import NewTraineeClient from "./NewTraineeClient";

/**
 * Server Component to handle localized onboarding page.
 * Fetches the dictionary based on the URL locale.
 */
export default async function NewTraineePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Fetch dictionary for the specific language
  const dict = await getDictionary(lang as any);

  return <NewTraineeClient dict={dict} lang={lang} />;
}