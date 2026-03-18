"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12">
          <div className="bg-[#111111] p-10 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-400 mb-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#ff6b1a] hover:underline">
                Create one here
              </Link>
            </p>

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 outline-none focus:border-[#ff6b1a]"
              />
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 outline-none focus:border-[#ff6b1a]"
                />
                <div className="text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-gray-400 hover:text-[#ff6b1a] transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff6b1a] py-3 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50 mt-2"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-4xl font-bold">Train Smarter with TrainElitePro</h3>
            <div className="space-y-4">
              <Benefit text="Find verified personal trainers near you" />
              <Benefit text="Book sessions instantly" />
              <Benefit text="Track your workouts and progress" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle className="text-[#ff6b1a]" size={22} />
      <span className="text-gray-300">{text}</span>
    </div>
  );
}