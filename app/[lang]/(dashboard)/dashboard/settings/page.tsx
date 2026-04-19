import { getDictionary } from "@/lib/get-dictionary";
import SettingsClient from "./SettingsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <SettingsClient dict={dict} lang={lang} />;
}