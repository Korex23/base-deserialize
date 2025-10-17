import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, ArrowLeft } from "lucide-react";

interface SwapSettingsProps {
  onSlippageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentSlippage?: number;
}

const SwapSettingsDialog: React.FC<SwapSettingsProps> = ({
  onSlippageChange,
  currentSlippage = 1.0,
}) => {
  const [selectedSlippage, setSelectedSlippage] =
    useState<number>(currentSlippage);
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const slippageOptions = [0.1, 0.5, 1.0];

  // 🔑 Sync with parent value (important for params)
  useEffect(() => {
    if (slippageOptions.includes(currentSlippage)) {
      setSelectedSlippage(currentSlippage);
      setCustomSlippage("");
    } else {
      setSelectedSlippage(currentSlippage);
      setCustomSlippage(currentSlippage.toString());
    }
  }, [currentSlippage]);

  const handleSlippageSelect = (slippage: number) => {
    setSelectedSlippage(slippage);
    setCustomSlippage("");

    const syntheticEvent = {
      target: { value: slippage.toString() },
    } as React.ChangeEvent<HTMLInputElement>;

    onSlippageChange?.(syntheticEvent);
  };

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSelectedSlippage(numValue);

      const syntheticEvent = {
        target: { value },
      } as React.ChangeEvent<HTMLInputElement>;

      onSlippageChange?.(syntheticEvent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-[#122A10] hover:bg-[#1a3d17] text-white px-2 py-2 h-8 w-8"
        >
          <Settings width={16} height={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-gray-700 text-white max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <ArrowLeft width={16} height={16} />
            </Button>
            <DialogTitle className="text-xl font-semibold">
              Slippage Settings
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Slippage Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Slippage</h3>
            <div className="flex flex-wrap gap-3">
              {slippageOptions.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  className={`px-4 py-2 rounded-lg border ${
                    selectedSlippage === option && !customSlippage
                      ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                      : "bg-transparent hover:bg-gray-700 border-gray-600 text-gray-300"
                  }`}
                  onClick={() => handleSlippageSelect(option)}
                >
                  {option}%
                </Button>
              ))}

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={`px-4 py-2 rounded-lg border ${
                    customSlippage
                      ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                      : "bg-transparent hover:bg-gray-700 border-gray-600 text-gray-300"
                  }`}
                  onClick={() => {
                    const input = document.getElementById(
                      "custom-slippage"
                    ) as HTMLInputElement;
                    input?.focus();
                  }}
                >
                  Custom
                </Button>
                <Input
                  id="custom-slippage"
                  type="number"
                  placeholder="0.0"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippageChange(e.target.value)}
                  className="w-16 h-10 bg-transparent border-gray-600 text-white text-center focus:border-green-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapSettingsDialog;
