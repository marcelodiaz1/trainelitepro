"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 border-t border-gray-800 py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

        {/* Logo & Description */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-[#ff6b1a]">TrainElitePro</h1>
          <p className="text-gray-400">
            The ultimate platform for personal trainers to manage clients, workouts, and nutrition with ease.
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
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <Link href="/" className="hover:text-[#ff6b1a] transition">Home</Link>
          <Link href="/benefits" className="hover:text-[#ff6b1a] transition">Benefits</Link>
          <Link href="/pricing" className="hover:text-[#ff6b1a] transition">Pricing</Link>
          <Link href="/trainers" className="hover:text-[#ff6b1a] transition">Trainers</Link>
          <Link href="/contact" className="hover:text-[#ff6b1a] transition">Contact</Link>
        </div>

        {/* Account Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold mb-4">Account</h3>
          <Link href="/register" className="hover:text-[#ff6b1a] transition">Trainer Sign Up</Link>
          <Link href="/login" className="hover:text-[#ff6b1a] transition">Login</Link>
          <Link href="/register" className="hover:text-[#ff6b1a] transition">Trainee Sign Up</Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TrainElitePro. All rights reserved.
      </div>
    </footer>
  );
}