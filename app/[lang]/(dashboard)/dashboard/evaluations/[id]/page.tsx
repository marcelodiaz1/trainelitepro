import { getDictionary } from "@/lib/get-dictionary";
import EvaluationDetailClient from "./EvaluationDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <EvaluationDetailClient dict={dict} lang={lang} />;
}