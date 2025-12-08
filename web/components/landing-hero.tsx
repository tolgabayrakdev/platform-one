"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

export default function LandingHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4 md:mb-6"
      >
        <div className="mb-3 md:mb-4 flex justify-center">
          <Image
            src="/Garajmuhabbet.png"
            alt="Garaj Muhabbet Logo"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
            priority
          />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
          Sende Aramıza Katıl!
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-base md:text-lg lg:text-xl text-foreground/90 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto px-4"
      >
        Türkiye'nin <span className="font-semibold text-primary">81 ilinden</span> araç sahiplerinin bir araya geldiği topluluk platformu. 
        Araçlarınız hakkında <span className="font-semibold text-primary">sorular sorun, deneyimlerinizi paylaşın, yardımlaşın</span>. 
        Yedek parça, servis, bakım ve araç konularında bilgi alışverişi yapın.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 px-4"
      >
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          Ücretsiz Kayıt Ol
        </Link>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm font-medium rounded-lg border border-primary/30 bg-background hover:bg-primary/10 transition-colors w-full sm:w-auto"
        >
          İçerikleri Keşfet
        </Link>
      </motion.div>
    </motion.div>
  );
}
