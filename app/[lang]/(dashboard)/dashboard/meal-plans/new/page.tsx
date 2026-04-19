import { getDictionary } from "@/lib/get-dictionary";
import NewMealPlanClient from "./NewMealPlanClient";

export default async function NewMealPlanPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <NewMealPlanClient 
      dict={dict} 
      lang={lang} 
    />
  );
}