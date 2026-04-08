import { getDictionary } from "@/lib/get-dictionary";
import ContactClient from "./ContactClient"; // This is your "use client" component

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Fetch the dictionary on the server
  const dict = await getDictionary(lang as any);

  // PASS THE DICT PROP HERE - This is what prevents the error
  return <ContactClient dict={dict} />;
}