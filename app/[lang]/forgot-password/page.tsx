// app/[lang]/forgot-password/page.tsx
import { getDictionary } from "@/lib/get-dictionary";
import ForgotPassword from "./ForgotPasswordClient";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return <ForgotPassword dict={dict} />;
}