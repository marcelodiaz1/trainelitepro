"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("trainee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    specialty: "",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: role,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address: form.address,
          specialty: role === "trainer" ? form.specialty : null,
          bio: role === "trainer" ? form.bio : null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12">
          
          <div className="bg-[#111111] p-10 rounded-2xl shadow-lg border border-gray-800">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ff6b1a] hover:underline">
                Log in here
              </Link>
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="first_name"
                  placeholder="First Name"
                  required
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
                />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  required
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
              />

              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                required
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
              />

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
                >
                  <option value="trainee">Trainee</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              {role === "trainer" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    name="specialty"
                    placeholder="Primary Specialty (e.g., CrossFit)"
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
                  />
                  <textarea
                    name="bio"
                    placeholder="Tell us about your experience..."
                    rows={3}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#161616] border border-gray-700 focus:border-[#ff6b1a] outline-none transition"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff6b1a] py-3 rounded-lg font-bold hover:bg-[#e85a00] transition active:scale-95 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>

              <p className="text-center text-[11px] text-gray-500 mt-4 px-4">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-white">Terms</Link> and{" "}
                <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
              </p>
            </form>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-4xl font-bold italic uppercase">Join the Squad</h3>
            <p className="text-gray-400 leading-relaxed">
              Unlock personalized training plans, track your stats in real-time, and connect with the best fitness pros in the industry.
            </p>
            <div className="space-y-4">
              <Benefit text="Instant booking with verified trainers" />
              <Benefit text="Workout & nutrition tracking" />
              <Benefit text="Exclusive fitness community access" />
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
      <CheckCircle className="text-[#ff6b1a]" size={20} />
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}