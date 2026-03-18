"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");

    const formData = new FormData(e.currentTarget);
    
    // Formspree API call
    const response = await fetch("https://formspree.io/f/marcelo.diaz.santis@gmail.com", {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      setState("success");
    } else {
      setState("error");
    }
  }
  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="py-32 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Get in <span className="text-[#ff6b1a]">Touch</span> with TrainElitePro
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
          Have questions, feedback, or need support? Our team is here to help you scale your fitness business.
        </p>
      </section>

      {/* CONTACT INFO & FORM */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Information</h2>
            <p className="text-gray-400">
              Reach out to us via email or phone. We’ll respond as fast as possible.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li><span className="font-bold text-[#ff6b1a]">Email:</span> support@trainelitepro.com</li>
              <li><span className="font-bold text-[#ff6b1a]">Phone:</span> +61 123 456 789</li>
              <li><span className="font-bold text-[#ff6b1a]">Address:</span> Sydney, Australia</li>
            </ul>
            <Link
              href="/register"
              className="inline-block mt-6 bg-[#ff6b1a] px-10 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition"
            >
              Start Your Free Trial
            </Link>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#161616] p-8 rounded-2xl border border-gray-800"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  placeholder="Your message..."
                  rows={5}
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#ff6b1a] text-black font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition"
              >
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Ready to Grow Your <span className="text-[#ff6b1a]">Fitness Business?</span>
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Join hundreds of trainers already growing their online client base, managing workouts, meal plans, and tracking progress seamlessly.
        </p>
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Create Trainer Account
        </Link>
      </section>

      <Footer />
    </main>
  );
}