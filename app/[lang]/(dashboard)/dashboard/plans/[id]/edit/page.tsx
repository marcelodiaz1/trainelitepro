import { getDictionary } from "@/lib/get-dictionary";
import EditPlanClient from "./EditPlanClient";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <EditPlanClient 
      dict={dict} 
      lang={lang} 
    />
  );
}