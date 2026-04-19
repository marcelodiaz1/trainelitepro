"use client";

import LocalizedLink from "@/components/LocalizedLink";
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Dumbbell } from "lucide-react";

export default function Footer({ dict }: { dict: any }) {
  const t = dict.footer;

  if (!t) return null;

  return (
    <footer className="bg-[#080808] text-gray-400 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <LocalizedLink href="/" className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold">
              <Dumbbell size={30} className="text-[#ff6b1a] drop-shadow-[0_0_8px_#ff6b1a]" />
              <span className="bg-gradient-to-r from-[#ff6b1a] to-orange-400 bg-clip-text text-transparent">
                TrainElitePro
              </span>
            </LocalizedLink>
            <p className="text-sm leading-relaxed max-w-xs">
              {t.description}
            </p>
            <div className="flex gap-4 items-center">
              {[
                { icon: <Instagram size={18} />, href: "https://instagram.com/trainelitepro" },
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Linkedin size={18} />, href: "#" },
              ].map((social, i) => (
                <LocalizedLink 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff6b1a] hover:text-black transition-all duration-300"
                >
                  {social.icon}
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">{t.quickLinks}</h3>
            <nav className="flex flex-col gap-3 text-sm">
              <LocalizedLink href="/" className="hover:text-white transition-colors w-fit">{t.links.home}</LocalizedLink>
              <LocalizedLink href="/benefits" className="hover:text-white transition-colors w-fit">{t.links.benefits}</LocalizedLink>
              <LocalizedLink href="/pricing" className="hover:text-white transition-colors w-fit">{t.links.pricing}</LocalizedLink>
              <LocalizedLink href="/trainers" className="hover:text-white transition-colors w-fit">{t.links.trainers}</LocalizedLink>
            </nav>
          </div>

          {/* Account Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">{t.account}</h3>
            <nav className="flex flex-col gap-3 text-sm">
              <LocalizedLink href="/login" className="hover:text-white transition-colors w-fit">{t.links.login}</LocalizedLink>
              <LocalizedLink href="/register" className="hover:text-white transition-colors w-fit">{t.links.trainerSignUp}</LocalizedLink>
              <LocalizedLink href="/register" className="hover:text-white transition-colors w-fit">{t.links.traineeSignUp}</LocalizedLink>
            </nav>
          </div>

          {/* Newsletter/Contact Mini Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-2">{t.links.contact}</h3>
            <div className="flex flex-col gap-4 text-sm">
               <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#ff6b1a]" />
                  <span>support@trainelitepro.com</span>
               </div>
               <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#ff6b1a]" />
                  <span>Global Coaching Network</span>
               </div>
               <div className="mt-2 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <p className="text-[11px] text-orange-200/60 uppercase font-bold tracking-tighter">Status</p>
                  <p className="text-xs text-white font-medium">Platform Online & Secure</p>
               </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} TrainElitePro. {t.rights}
          </p>
          <div className="flex gap-8 text-[11px] uppercase tracking-widest font-bold">
            <LocalizedLink href="/privacy" className="hover:text-white transition-colors">Privacy</LocalizedLink>
            <LocalizedLink href="/terms" className="hover:text-white transition-colors">Terms</LocalizedLink>
            <LocalizedLink href="/cookies" className="hover:text-white transition-colors">Cookies</LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
}