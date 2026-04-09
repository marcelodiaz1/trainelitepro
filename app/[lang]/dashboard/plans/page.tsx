import { getDictionary } from "@/lib/get-dictionary";
import PlansManagementClient from "./PlansManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans Management | Dashboard",
};

export default async function PlansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <PlansManagementClient 
      dict={dict} 
      lang={lang} 
    />
  );
}