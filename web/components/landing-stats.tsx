"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  color: string;
}

function AnimatedCounter({ value, color }: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString('tr-TR')
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return <motion.span className={`text-xl md:text-2xl font-bold ${color}`}>{display}</motion.span>;
}

interface StatsProps {
  totalPosts: number;
  totalUsers: number;
  totalCities: number;
  totalBrands: number;
}

export default function LandingStats({ totalPosts, totalUsers, totalCities, totalBrands }: StatsProps) {
  const stats = [
    { label: "Toplam Gönderi", value: totalPosts, icon: "📝", color: "text-blue-500" },
    { label: "Aktif Kullanıcı", value: totalUsers, icon: "👥", color: "text-green-500" },
    { label: "Şehir", value: totalCities, icon: "📍", color: "text-purple-500" },
    { label: "Marka", value: totalBrands, icon: "🚗", color: "text-orange-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          className="p-4 md:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <span className="text-xl md:text-2xl">{stat.icon}</span>
            <AnimatedCounter value={stat.value} color={stat.color} />
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
