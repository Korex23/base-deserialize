import { useEffect, useState } from "react";
import { RefreshCcw, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Update to your path

const POLL_INTERVAL = 25; // in seconds

export const SwapQuoteRefresher = ({
  fetchSwapQuote,
  handleReload,
}: {
  fetchSwapQuote: () => Promise<void>;
  handleReload: () => void;
}) => {
  const [secondsLeft, setSecondsLeft] = useState(POLL_INTERVAL);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      await fetchSwapQuote();
      if (!cancelled) {
        setHasFetchedOnce(true);
        setSecondsLeft(POLL_INTERVAL); // start countdown
        setTimeout(poll, POLL_INTERVAL * 1000);
      }
    };

    poll();

    const countdown = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(countdown);
    };
  }, [fetchSwapQuote]);

  const percentage = ((POLL_INTERVAL - secondsLeft) / POLL_INTERVAL) * 100;

  return (
    <Button
      onClick={handleReload}
      className="relative w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 p-0"
    >
      {hasFetchedOnce ? (
        <>
          {/* Background progress */}
          <div
            className="absolute inset-0 rounded-full z-0"
            style={{
              background: `conic-gradient(#10b981 ${percentage}%, #e5e7eb ${percentage}%)`,
            }}
          />
          <div className="absolute inset-1 bg-white rounded-full z-10 flex items-center justify-center">
            <LoaderCircle className="h-4 w-4 text-gray-700 animate-spin-slow" />
          </div>
        </>
      ) : (
        <RefreshCcw className="h-4 w-4 text-gray-700 z-10" />
      )}
    </Button>
  );
};
