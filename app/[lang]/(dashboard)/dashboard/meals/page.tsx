import { getDictionary } from "@/lib/get-dictionary";
import MealsClient from "./MealsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <MealsClient dict={dict} lang={lang} />;
}