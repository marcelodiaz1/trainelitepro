import { getDictionary } from "@/lib/get-dictionary";
import EditTraineeClient from "./EditTraineeClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <EditTraineeClient dict={dict} lang={lang} />;
}