// app/[lang]/layout.tsx
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/get-dictionary"; // Adjust path to your file
import "../globals.css";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // 1. Await the params to get the current language
  const { lang } = await params;

  // 2. Fetch the dictionary for the specific language
  // We do this at the layout level so the Navbar can use it on every page
  const dict = await getDictionary(lang as any);

  return (
    <html lang={lang}>
      <body className="antialiased">
        {children} 
      </body>
    </html>
  );
}