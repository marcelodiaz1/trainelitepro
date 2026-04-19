"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPassword({ dict }: { dict: any }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Safety check to prevent the "undefined" crash
  const t = dict?.forgotPassword;

  if (!t) return null;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t.success);
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col">
    

      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-md w-full bg-[#111111] p-10 rounded-2xl shadow-lg">

          <h2 className="text-3xl font-bold mb-4 text-center">
            {t.title}
          </h2>

          <p className="text-gray-400 text-center mb-6">
            {t.subtitle}
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}

          <form onSubmit={handleReset} className="space-y-4">

            <input
              type="email"
              placeholder={t.placeholder}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b1a]"
            />

            <button
              type="submit"
              className="w-full bg-[#ff6b1a] py-3 rounded-lg font-bold hover:scale-105 transition text-black"
            >
              {t.button}
            </button>

          </form>

        </div>
      </section>

      <Footer dict={dict} />
    </main>
  );
}