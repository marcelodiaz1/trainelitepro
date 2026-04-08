"use client";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Dumbbell, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import LocaleSwitcher from "./LocaleSwitcher";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar({ dict }: { dict: any }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Use variables for cleaner code
  const t = dict.navbar;

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, profile_picture")
        .eq("id", userId)
        .single();
      
      if (!error) setProfile(data);
    };

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) fetchProfile(user.id);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Map links to translation keys
  const navLinks = [
    { name: t.links.benefits, href: "/benefits" },
    { name: t.links.pricing, href: "/pricing" },
    { name: t.links.trainers, href: "/trainers" },
    { name: t.links.contact, href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-black/60 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-5">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold">
          <Dumbbell size={30} className="text-[#ff6b1a] drop-shadow-[0_0_8px_#ff6b1a]" />
          <span className="bg-gradient-to-r from-[#ff6b1a] to-orange-400 bg-clip-text text-transparent">
            TrainElitePro
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-10 items-center text-lg font-semibold">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="relative group transition-colors hover:text-[#ff6b1a]">
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#ff6b1a] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden lg:block"> 
          <Suspense fallback={<div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />}>
            <LocaleSwitcher />
          </Suspense>
        </div>

        {/* PROFILE / CTA */}
        <div className="hidden md:flex items-center gap-6">
          {profile ? (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/10 transition group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-[#ff6b1a]/50 overflow-hidden flex items-center justify-center">
                {profile.profile_picture ? (
                  <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={16} className="text-gray-400" />
                )}
              </div>
              <span className="text-sm font-bold group-hover:text-[#ff6b1a] transition">
                {profile.first_name ? `${profile.first_name} ${profile.last_name}` : t.actions.account}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white transition">{t.actions.login}</Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-[#ff6b1a] to-orange-400 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition"
              >
                {t.actions.getStarted}
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-screen w-72 bg-[#111] shadow-2xl p-8 flex flex-col gap-8 text-lg"
          >
            <div className="flex justify-end">
              <X size={28} onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>

            {profile && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-[#ff6b1a]">
                    {profile.profile_picture ? (
                      <img src={profile.profile_picture} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={24} className="text-gray-400" />
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-black uppercase italic">{profile.first_name}</p>
                    <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                      {t.actions.settings}
                    </Link>
                 </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-gray-300 hover:text-[#ff6b1a]">
                {link.name}
              </Link>
            ))}

            {!profile && (
              <div className="flex flex-col gap-4 mt-4">
                <Link href="/login" className="border border-[#ff6b1a] px-5 py-3 rounded-lg text-center" onClick={() => setOpen(false)}>
                  {t.actions.login}
                </Link>
                <Link href="/register" className="bg-[#ff6b1a] px-5 py-3 rounded-lg text-center font-semibold" onClick={() => setOpen(false)}>
                  {t.actions.getStarted}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}