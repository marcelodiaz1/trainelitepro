import { getDictionary } from "@/lib/get-dictionary";
import EvaluationsTableClient from "./EvaluationsTableClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <EvaluationsTableClient dict={dict} lang={lang} />;
}