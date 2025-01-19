import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const useCustomWindow = () => {
  const pathname = usePathname();
  const [nextWindow, setWindow] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nextWindow = window;
      setWindow(nextWindow);
    }
  }, [pathname]);

  return nextWindow;
};

export default useCustomWindow;
