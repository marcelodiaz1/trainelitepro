"use client";
import { Suspense, useState, useEffect } from "react";
import LocalizedLink from "@/components/LocalizedLink";
import { Menu, X, Dumbbell, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import LocaleSwitcher from "./LocaleSwitcher";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar({ dict, lang }: { dict: any; lang: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<any>(null);

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
        
        {/* LOGO - Added flex-shrink-0 to prevent disappearing on mobile */}
        <LocalizedLink href="/" className="flex items-center gap-2 text-xl md:text-3xl font-extrabold flex-shrink-0">
          <Dumbbell size={30} className="text-[#ff6b1a] drop-shadow-[0_0_8px_#ff6b1a]" />
          <span className="bg-gradient-to-r from-[#ff6b1a] to-orange-400 bg-clip-text text-transparent italic uppercase tracking-tighter block">
            TrainElitePro
          </span>
        </LocalizedLink>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-10 items-center text-sm font-bold uppercase tracking-widest text-white">
          {navLinks.map((link) => (
            <LocalizedLink key={link.href} href={link.href} className="relative group transition-colors hover:text-[#ff6b1a]">
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#ff6b1a] transition-all group-hover:w-full" />
            </LocalizedLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-8"> 
          <Suspense fallback={<div className="w-10 h-6 bg-white/5 animate-pulse rounded" />}>
            <LocaleSwitcher />
          </Suspense>

          <div className="flex items-center gap-6">
            {profile ? (
              <LocalizedLink 
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
                <span className="text-xs font-black uppercase tracking-tighter group-hover:text-[#ff6b1a] transition text-white">
                  {profile.first_name ? `${profile.first_name}` : t.actions.account}
                </span>
              </LocalizedLink>
            ) : (
              <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest">
                <LocalizedLink href="/login" className="text-white hover:text-[#ff6b1a] transition">{t.actions.login}</LocalizedLink>
                <LocalizedLink
                  href="/register"
                  className="bg-[#ff6b1a] text-black px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                >
                  {t.actions.getStarted}
                </LocalizedLink>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-80 bg-[#080808] z-50 p-8 flex flex-col gap-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5"
            >
              <div className="flex justify-between items-center mb-4">
                <Dumbbell size={24} className="text-[#ff6b1a]" />
                {/* Fixed X color - added text-white */}
                <X size={28} onClick={() => setOpen(false)} className="cursor-pointer text-white hover:text-[#ff6b1a] transition" />
              </div>

              {profile && (
                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-[#ff6b1a]">
                      {profile.profile_picture ? (
                        <img src={profile.profile_picture} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-gray-400" />
                      )}
                   </div>
                   <div>
                      <p className="text-sm font-black uppercase italic text-white">{profile.first_name}</p>
                      <LocalizedLink href="/dashboard/settings" onClick={() => setOpen(false)} className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                        {t.actions.settings}
                      </LocalizedLink>
                   </div>
                </div>
              )}

              <nav className="flex flex-col gap-6 text-sm font-black uppercase tracking-[0.2em]">
                {navLinks.map((link) => (
                  <LocalizedLink 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setOpen(false)} 
                    className="text-white hover:text-[#ff6b1a] transition"
                  >
                    {link.name}
                  </LocalizedLink>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-4">
                <div className="py-4 border-t border-white/5">
                  <LocaleSwitcher />
                </div>
                {!profile ? (
                  <>
                    <LocalizedLink href="/login" className="border border-white/10 text-white px-5 py-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition" onClick={() => setOpen(false)}>
                      {t.actions.login}
                    </LocalizedLink>
                    <LocalizedLink href="/register" className="bg-[#ff6b1a] text-black px-5 py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/20" onClick={() => setOpen(false)}>
                      {t.actions.getStarted}
                    </LocalizedLink>
                  </>
                ) : (
                  <LocalizedLink href="/dashboard" className="bg-white/10 text-white px-5 py-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest" onClick={() => setOpen(false)}>
                    Dashboard
                  </LocalizedLink>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}