import { useEffect, useState } from "react";

/**
 * Returns the number of items to show based on viewport:
 * - mobile (<768px): 3
 * - tablet (768-1023px): 4
 * - desktop (>=1024px): 6
 */
export function useResponsiveCount() {
  const [count, setCount] = useState<number>(() => {
    if (typeof window === "undefined") return 6;
    const w = window.innerWidth;
    if (w < 768) return 3;
    if (w < 1024) return 4;
    return 6;
  });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setCount(3);
      else if (w < 1024) setCount(4);
      else setCount(6);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return count;
}
