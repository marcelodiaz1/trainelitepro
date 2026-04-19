import { getDictionary } from "@/lib/get-dictionary";
import NewEvaluationClient from "./NewEvaluationClient";

/**
 * Server component that prepares the localized dictionary 
 * and handles the dynamic route parameters.
 */
export default async function NewEvaluationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Fetch the dictionary for the requested locale (en, es, or zh)
  const dict = await getDictionary(lang as any);

  return (
    <NewEvaluationClient 
      dict={dict} 
      lang={lang} 
    />
  );
}