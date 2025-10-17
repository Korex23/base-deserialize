import { useEffect, useRef, useState } from "react";

const useClickOutiside = (initialValue: boolean) => {
  const [visible, setVisible] = useState(initialValue);

  const ref = useRef<HTMLDivElement>(null);

  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (ref?.current && !ref?.current.contains(target)) {
      setVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handler);

    return () => {
      document.addEventListener("mousedown", handler);
    };
  }, [ref]);
  return { ref, visible, setVisible };
};

export default useClickOutiside;
