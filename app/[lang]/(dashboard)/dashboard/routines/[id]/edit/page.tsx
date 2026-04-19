import { getDictionary } from "@/lib/get-dictionary";
import EditRoutineClient from "./EditRoutineClient";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <EditRoutineClient 
      dict={dict} 
      lang={lang} 
    />
  );
}