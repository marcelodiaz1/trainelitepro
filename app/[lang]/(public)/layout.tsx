// app/[lang]/(public)/layout.tsx
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/get-dictionary";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as any);

  return (
    <>
      <Navbar dict={dict} lang={lang} />
      <main>{children}</main>
    </>
  );
}