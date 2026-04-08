"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";
import { Globe } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClientLayoutWrapper({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode;
  dict: any;
  lang: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${lang}/login`);
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, lang]);

  const redirectedPathname = (targetLang: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = targetLang;
    return segments.join("/");
  };

  if (loading) {
    return (
      <div className="bg-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-b-2 border-[#ff6b1a] rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            {lang === "zh" ? "身份验证中" : lang === "es" ? "Autenticando" : "Authenticating"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b0b]">
      <Sidebar dict={dict} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-end px-8 border-b border-white/5">
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/5">
            <Globe size={14} className="ml-2 text-gray-500" />
            <div className="flex gap-1 text-[10px] font-black uppercase tracking-tighter">
              {['en', 'es', 'zh'].map((l) => (
                <Link
                  key={l}
                  href={redirectedPathname(l)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    lang === l 
                    ? "bg-[#ff6b1a] text-black" 
                    : "text-gray-500 hover:text-white"
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}