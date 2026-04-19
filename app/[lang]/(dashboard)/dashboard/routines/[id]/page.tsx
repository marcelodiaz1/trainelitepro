import { getDictionary } from "@/lib/get-dictionary";
import RoutineDetailClient from "./RoutineDetailClient";

export default async function RoutinePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <RoutineDetailClient 
      dict={dict} 
      lang={lang} 
    />
  );
}