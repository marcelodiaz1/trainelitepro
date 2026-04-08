"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact({ dict }: { dict: any }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = dict.contactPage;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "4519aa82-20b8-47aa-a2db-3e1ca0194b36");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setState("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setState("error");
      }
    } catch (error) {
      setState("error");
    }
  }

  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar dict={dict} />

      {/* HERO */}
      <section className="py-32 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <h1 
          className="text-5xl md:text-6xl font-bold mb-6"
          dangerouslySetInnerHTML={{ __html: t.hero.title }}
        />
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
          {t.hero.subtitle}
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.info.title}</h2>
            <p className="text-gray-400">{t.info.description}</p>
            <ul className="space-y-2 text-gray-300"> 
              <li><span className="font-bold text-[#ff6b1a]">{t.info.addressLabel}:</span> {t.info.addressValue}</li>
            </ul>
            <Link
              href="/register"
              className="inline-block mt-6 bg-[#ff6b1a] px-10 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition"
            >
              {t.info.cta}
            </Link>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#161616] p-8 rounded-2xl border border-gray-800"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.form.title}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-semibold" htmlFor="name">{t.form.nameLabel}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t.form.namePlaceholder}
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" htmlFor="email">{t.form.emailLabel}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" htmlFor="message">{t.form.messageLabel}</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder={t.form.messagePlaceholder}
                  rows={5}
                  className="w-full p-3 rounded-lg bg-[#111111] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6b1a]"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-[#ff6b1a] text-black font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {state === "idle" && t.form.buttonIdle}
                {state === "loading" && t.form.buttonLoading}
                {state === "success" && t.form.buttonSuccess}
                {state === "error" && t.form.buttonError}
              </button>

              {state === "success" && (
                <p className="text-green-500 text-center mt-2 font-medium">
                  {t.form.successMsg}
                </p>
              )}
              {state === "error" && (
                <p className="text-red-500 text-center mt-2 font-medium">
                  {t.form.errorMsg}
                </p>
              )}
            </form>
          </motion.div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 
          className="text-5xl md:text-6xl font-bold mb-6"
          dangerouslySetInnerHTML={{ __html: t.finalCta.title }}
        />
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          {t.finalCta.description}
        </p>
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          {t.finalCta.button}
        </Link>
      </section>

      <Footer dict={dict} />
    </main>
  );
}