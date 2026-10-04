"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export const AOSInit = () => {
  useEffect(() => {
    // Initialize AOS safely on client after component tree is mounted
    const initAOS = () => {
      AOS.init({
        duration: 800,
        once: true,
        easing: "ease-out-cubic",
        offset: 40,
        disableMutationObserver: false,
      });
      AOS.refresh();
    };

    if (typeof window !== "undefined") {
      const timer = setTimeout(initAOS, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

export default AOSInit;
