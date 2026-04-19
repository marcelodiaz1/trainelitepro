import { getDictionary } from "@/lib/get-dictionary";
import TraineesTableClient from "./TraineesTableClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <TraineesTableClient dict={dict} lang={lang} />;
}