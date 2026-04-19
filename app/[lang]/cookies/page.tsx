import { getDictionary } from "@/lib/get-dictionary";
import CookiesClient from "./CookiesClient";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <CookiesClient dict={dict} />;
}