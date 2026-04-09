import { getDictionary } from "@/lib/get-dictionary";
import PlanDetailClient from "./PlanDetailClient";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <PlanDetailClient 
      dict={dict} 
      lang={lang} 
    />
  );
}