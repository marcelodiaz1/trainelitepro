import { getDictionary } from "@/lib/get-dictionary";
import BenefitsClient from "./BenefitsClient"; // Import the file we made in Step 1

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  // 1. Get the language from the URL
  const { lang } = await params;
  
  // 2. Load the dictionary file
  const dict = await getDictionary(lang as any);

  // 3. Put the component inside and pass the dict
  return <BenefitsClient dict={dict} />;
}