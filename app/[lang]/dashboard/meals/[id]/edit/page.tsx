import { getDictionary } from "@/lib/get-dictionary";
import EditMealClient from "./EditMealClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Meal | Dashboard",
};

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <EditMealClient 
      dict={dict} 
      lang={lang} 
    />
  );
}