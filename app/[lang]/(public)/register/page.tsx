import { getDictionary } from "@/lib/get-dictionary";
import RegisterClient from "./RegisterClient";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <RegisterClient dict={dict} />;
}