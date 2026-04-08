import { getDictionary } from "@/lib/get-dictionary";
import PricingClient from "./PricingClient";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <PricingClient dict={dict} />;
}