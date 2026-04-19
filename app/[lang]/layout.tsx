// app/[lang]/layout.tsx
import "../globals.css";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body className="antialiased">
        {children} {/* This will render PublicLayout OR DashboardLayout */}
      </body>
    </html>
  );
}