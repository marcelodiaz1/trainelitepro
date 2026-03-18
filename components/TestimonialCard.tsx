"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  quote: string;
}

export default function TestimonialCard({ name, role, image, quote }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 40 }}
      className="bg-[#161616] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition"
    >
      {/* Profile Image */}
      <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
        <Image src={image} alt={name} width={80} height={80} className="object-cover" />
      </div>

      {/* Quote Icon */}
      <div className="text-[#ff6b1a] mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6v-6H9v6zm-6-6h6V5H3v6zm12 0h6V5h-6v6z" />
        </svg>
      </div>

      {/* Quote Text */}
      <p className="text-gray-300 mb-6 italic text-lg">{quote}</p>

      {/* Name and Role */}
      <h4 className="font-bold text-xl mb-1">{name}</h4>
      <p className="text-gray-400 mb-3">{role}</p>

      {/* Stars */}
      <div className="flex items-center gap-1 ">
        <Star size={16}  className="flex items-center gap-1 fill-yellow-400 text-yellow-400"/>
        <Star size={16}  className="flex items-center gap-1 fill-yellow-400 text-yellow-400"/>
        <Star size={16}  className="flex items-center gap-1 fill-yellow-400 text-yellow-400"/>
        <Star size={16}  className="flex items-center gap-1 fill-yellow-400 text-yellow-400"/>
        <Star size={16}  className="flex items-center gap-1 fill-yellow-400 text-yellow-400"/>
         
      </div>
    </motion.div>
  );
}