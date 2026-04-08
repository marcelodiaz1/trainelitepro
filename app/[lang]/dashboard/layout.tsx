// app/[lang]/dashboard/layout.tsx
import { getDictionary } from "@/lib/get-dictionary";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <ClientLayoutWrapper dict={dict} lang={lang}>
      {children}
    </ClientLayoutWrapper>
  );
}