'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass shadow-soft rounded-2xl overflow-hidden ${className}`}
    >
      {image && (
        <div className="relative h-36 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="object-cover w-full h-full"/>
        </div>
      )}
      <div className="p-4">{children}</div>
    </motion.div>
  );
}
