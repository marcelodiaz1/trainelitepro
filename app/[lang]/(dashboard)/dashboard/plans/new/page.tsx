import { getDictionary } from "@/lib/get-dictionary";
import NewPlanClient from "./NewPlanClient";

export default async function NewPlanPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <NewPlanClient 
      dict={dict} 
      lang={lang} 
    />
  );
}