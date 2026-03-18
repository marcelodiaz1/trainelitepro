"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Dumbbell, Users, Salad, ChartNoAxesColumn, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import TestimonialCard from "@/components/TestimonialCard";
import TrainerCard from "@/components/TrainerCard";
import Footer from "@/components/Footer";
const features = [
  { icon: <Users size={30} />, title: "Client Management", text: "Manage all your trainees in one dashboard." },
  { icon: <Dumbbell size={30} />, title: "Workout Builder", text: "Create powerful workout programs easily." },
  { icon: <Salad size={30} />, title: "Meal Planning", text: "Design custom nutrition plans for your clients." },
  { icon: <ChartNoAxesColumn size={30} />, title: "Progress Tracking", text: "Track weight, strength and performance metrics." },
];

export default function Home() {
  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">

      <Navbar />

      {/* HERO SLIDER */}
      <HeroSlider />

      {/* STATS */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 text-center gap-10">
          <Stat number="10k+" label="Workouts Created" />
          <Stat number="5k+" label="Active Trainers" />
          <Stat number="40k+" label="Trainees" />
          <Stat number="98%" label="Client Satisfaction" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
          Powerful Tools for Fitness Professionals
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.02 }}
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#161616] p-8 rounded-2xl border border-gray-800 hover:border-[#ff6b1a] transition"
            >
              <div className="text-[#ff6b1a] mb-4">{feature.icon}</div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA after features */}
        <div className="text-center mt-16">
          <Link
            href="/register"
            className="bg-[#ff6b1a] px-10 py-4 rounded-xl font-bold text-lg md:text-xl shadow-lg hover:scale-105 transition"
          >
            Start Coaching Today
          </Link>
        </div>
      </section>
 

      {/* TESTIMONIALS */}
      <section className="py-28 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
          Trainers Love TrainElitePro
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <TestimonialCard
            name="John Carter"
            role="Strength Coach"
            image="/trainers/images.jpg"
            quote="TrainElitePro helped me manage 50+ clients easily and grow my business fast!"
          />
          <TestimonialCard
            name="Maria Lopez"
            role="Weight Loss Expert"
            image="/trainers/images3.jpg"
            quote="I can create custom plans and track progress effortlessly. My clients love it!"
          />
          <TestimonialCard
            name="Alex Chen"
            role="Bodybuilding Coach"
            image="/trainers/images1.jpg"
            quote="The best tool I've used for managing training programs and payments seamlessly."
          />
        </div>
      </section>
 

     {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Ready to Scale Your <span className="text-[#ff6b1a]">Fitness Business?</span>
        </h2>

        {/* Supporting text */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Join hundreds of trainers already growing their online client base, managing workouts,
          meal plans, and tracking progress seamlessly — all in one powerful platform.
        </p>

        {/* Button */}
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Create Trainer Account
        </Link>
      </section>
 
      <Footer/>

    </main>
  );
}

function Stat({ number, label }: any) {
  return (
    <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }}>
      <h3 className="text-4xl md:text-5xl font-bold text-[#ff6b1a] mb-2">{number}</h3>
      <p className="text-gray-400">{label}</p>
    </motion.div>
  );
}

 