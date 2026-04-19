import { getDictionary } from "@/lib/get-dictionary";
import NewWorkoutRoutineClient from "./NewWorkoutRoutineClient";

export default async function NewRoutinePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <NewWorkoutRoutineClient 
      dict={dict} 
      lang={lang} 
    />
  );
}