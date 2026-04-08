"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

// Add { dict } as a prop
export default function Footer({ dict }: { dict: any }) {
  const t = dict.footer; // Shortcut for easier reading

  return (
    <footer className="bg-[#111111] text-gray-400 border-t border-gray-800 py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

        {/* Logo & Description */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-[#ff6b1a]">TrainElitePro</h1>
          <p className="text-gray-400">
            {t.description}
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="#" aria-label="Facebook" className="hover:text-[#ff6b1a]"><Facebook size={20} /></Link>
            <Link href="#" aria-label="Instagram" className="hover:text-[#ff6b1a]"><Instagram size={20} /></Link>
            <Link href="#" aria-label="Twitter" className="hover:text-[#ff6b1a]"><Twitter size={20} /></Link>
            <Link href="#" aria-label="LinkedIn" className="hover:text-[#ff6b1a]"><Linkedin size={20} /></Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold mb-4">{t.quickLinks}</h3>
          <Link href="/" className="hover:text-[#ff6b1a] transition">{t.links.home}</Link>
          <Link href="/benefits" className="hover:text-[#ff6b1a] transition">{t.links.benefits}</Link>
          <Link href="/pricing" className="hover:text-[#ff6b1a] transition">{t.links.pricing}</Link>
          <Link href="/trainers" className="hover:text-[#ff6b1a] transition">{t.links.trainers}</Link>
          <Link href="/contact" className="hover:text-[#ff6b1a] transition">{t.links.contact}</Link>
        </div>

        {/* Account Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold mb-4">{t.account}</h3>
          <Link href="/register" className="hover:text-[#ff6b1a] transition">{t.links.trainerSignUp}</Link>
          <Link href="/login" className="hover:text-[#ff6b1a] transition">{t.links.login}</Link>
          <Link href="/register" className="hover:text-[#ff6b1a] transition">{t.links.traineeSignUp}</Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TrainElitePro. {t.rights}
      </div>
    </footer>
  );
}