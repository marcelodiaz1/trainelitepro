import { getDictionary } from "@/lib/get-dictionary";
import MealPlansClient from "./MealPlansClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <MealPlansClient dict={dict} lang={lang} />;
}