import { getDictionary } from "@/lib/get-dictionary";
import EditEvaluationClient from "./EditEvaluationClient";

/**
 * Server-side wrapper for the Edit Evaluation page.
 * Extracts the 'id' from the dynamic route and 'lang' from the URL.
 */
export default async function EditEvaluationPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Resolve the dynamic parameters
  const { lang, id } = await params;
  
  // Fetch translations for the current language
  const dict = await getDictionary(lang as any);

  return (
    <EditEvaluationClient 
      dict={dict} 
      lang={lang} 
    />
  );
}