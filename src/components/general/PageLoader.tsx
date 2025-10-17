import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader className="animate-spin size-10 text-green-300" />
    </div>
  );
};

export default PageLoader;
