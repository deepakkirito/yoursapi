import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const useCustomWindow = () => {
  const pathname = usePathname();
  const [nextWindow, setNextWindow] = useState(typeof window !== "undefined" ? window : null);

  useEffect(() => {
    if (!nextWindow && typeof window !== "undefined") {
      setNextWindow(window);
    }
  }, [pathname, nextWindow]);

  return nextWindow;
};

export default useCustomWindow;
