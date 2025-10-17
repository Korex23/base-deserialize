import { motion } from "framer-motion";

const SkeletonCard = () => {
  return (
    <ul className="grid md:grid-cols-2 grid-cols-1 gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
          className="relative rounded-xl border border-green-700 bg-zinc-900 p-4 shadow-sm space-y-3 animate-pulse"
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-zinc-700 rounded" />
              <div className="h-3 w-24 bg-zinc-700 rounded" />
            </div>

            <div className="flex justify-between">
              <div className="h-3 w-20 bg-zinc-700 rounded" />
              <div className="h-3 w-24 bg-zinc-700 rounded" />
            </div>

            <div className="flex justify-between">
              <div className="h-3 w-24 bg-zinc-700 rounded" />
              <div className="h-3 w-16 bg-zinc-700 rounded" />
            </div>

            <div className="flex justify-between">
              <div className="h-3 w-16 bg-zinc-700 rounded" />
              <div className="h-3 w-20 bg-zinc-700 rounded" />
            </div>

            <div className="flex justify-between">
              <div className="h-3 w-16 bg-zinc-700 rounded" />
              <div className="h-3 w-28 bg-zinc-700 rounded" />
            </div>

            <div className="h-2 w-32 bg-zinc-700 rounded" />
          </div>

          <div className="absolute bottom-3 right-3 h-4 w-4 bg-zinc-700 rounded-full" />
        </motion.li>
      ))}
    </ul>
  );
};

export default SkeletonCard;
