import { getDictionary } from "@/lib/get-dictionary";
import TraineeProfileClient from "./TraineeProfileClient";

export default async function TraineeProfilePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <TraineeProfileClient dict={dict} lang={lang} />;
}