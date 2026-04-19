"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import LocalizedLink from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login({ dict }: { dict: any }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Safety check
  const t = dict?.loginPage;
  if (!t) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col">
    
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12">
          
          <div className="bg-[#111111] p-10 rounded-2xl shadow-lg border border-gray-900">
            <h2 className="text-3xl font-bold mb-2">{t.title}</h2>
            <p className="text-gray-400 mb-6">
              {t.noAccount}{" "}
              <LocalizedLink href="/register" className="text-[#ff6b1a] hover:underline font-medium">
                {t.createAccount}
              </LocalizedLink>
            </p>

            {error && <p className="text-red-500 mb-4 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 outline-none focus:border-[#ff6b1a] transition"
              />
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 outline-none focus:border-[#ff6b1a] transition"
                />
                <div className="text-right">
                  <LocalizedLink 
                    href="/forgot-password" 
                    className="text-sm text-gray-400 hover:text-[#ff6b1a] transition"
                  >
                    {t.forgotPassword}
                  </LocalizedLink>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff6b1a] text-black py-3 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 mt-2"
              >
                {loading ? t.loading : t.loginButton}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-4xl md:text-5xl font-bold leading-tight">
              {t.sideTitle}
            </h3>
            <div className="space-y-4">
              {t.benefits.map((benefitText: string, index: number) => (
                <Benefit key={index} text={benefitText} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer dict={dict} />
    </main>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle className="text-[#ff6b1a]" size={22} />
      <span className="text-gray-300 text-lg">{text}</span>
    </div>
  );
}