import { getDictionary } from "@/lib/get-dictionary";
import DashboardClient from "./DashboardClient";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // 1. Fetch the dictionary server-side
  const dict = await getDictionary(lang as any);

  // 2. Pass it to the Client Component
  return <DashboardClient dict={dict} />;
}