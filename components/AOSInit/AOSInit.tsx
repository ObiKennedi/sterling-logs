"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export const AOSInit = () => {
  useEffect(() => {
    // Defer AOS initialization until React has completely finished hydration
    const timer = setTimeout(() => {
      AOS.init({
        duration: 800,
        once: true,
        easing: "ease-out-cubic",
        offset: 40,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default AOSInit;
