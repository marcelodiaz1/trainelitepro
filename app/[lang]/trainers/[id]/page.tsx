import { getDictionary } from "@/lib/get-dictionary";
import TrainerProfileClient from "./TrainerProfileClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  
  // Fetch the dictionary based on the URL language (en, es, zh)
  const dict = await getDictionary(lang as any);

  return <TrainerProfileClient dict={dict} />;
}