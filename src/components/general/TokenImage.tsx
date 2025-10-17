import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface TokenImageInterface {
  src: string;
  alt: string;
  className?: string;
  loading: "eager" | "lazy" | undefined;
}

const TokenImage = ({ src, alt, className, loading }: TokenImageInterface) => {
  return useMemo(() => {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(className)}
        loading={loading}
        width={40}
        height={40}
      />
    );
  }, [src, alt, className, loading]);
};

export default TokenImage;
