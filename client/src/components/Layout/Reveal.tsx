import { motion } from "framer-motion";
import React from "react";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

// Entrada suave (fade + subida) disparada ao entrar na viewport.
// Respeita prefers-reduced-motion via MotionConfig global.
export const Reveal = ({
  children,
  delay = 0,
  y = 18,
  className,
  style,
  onClick,
}: RevealProps) => {
  return (
    <motion.div
      className={className}
      style={style}
      onClick={onClick}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
