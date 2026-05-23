const EASE_OUT = [0.22, 1, 0.36, 1];

export const pageFadeRise = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE_OUT } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const modalPop = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: EASE_OUT } },
};

export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: EASE_OUT } },
};

export const drawerSlide = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: EASE_OUT } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18, ease: EASE_OUT } },
};
