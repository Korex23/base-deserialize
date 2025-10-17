import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import BN from "bn.js";
import { DYNAMIC_POINT_LIST } from "./constant";

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// HDR: SLEEP/DELAY
export const delay = async (time: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Promise resolved after ${time} milliseconds`);
    }, time * 1000);
  });
};

// HDR: Split string in the middle
export const splitStringInMiddle = (
  str: string,
  visibleChars: number = 4
): string => {
  if (str.length <= visibleChars * 2) {
    return str;
  }
  const firstPart = str.slice(0, visibleChars);
  const secondPart = str.slice(-visibleChars);

  return `${firstPart}...${secondPart}`;
};

// const QUEST_THRESHOLD: number = 500;

export const getPairPointRate = (tokenA: string, tokenB: string) => {
  return DYNAMIC_POINT_LIST.find(
    (fee) =>
      fee.tokens.find((t) => t === tokenA) &&
      fee.tokens.find((t) => t === tokenB)
  );
};

export const getDeserializePoint = (
  tokenA: string,
  tokenB: string,
  amountInUsd: number
) => {
  const defaultPointRate = 0.2;
  const pairPointRate = getPairPointRate(tokenA, tokenB);

  // console.log("pairPointRate?.feeRate : ", pairPointRate?.feeRate);
  if (pairPointRate?.feeRate === 0) {
    return 0;
  }
  const pointR = pairPointRate?.feeRate ?? defaultPointRate;

  return pointR * amountInUsd * 5;
};

export const formatSmallNumber = (num: number | null): string => {
  if (!num || num === 0) return "0.00";

  if (Math.abs(num) < 0.0001) {
    const scientific = num.toExponential();
    const [coefficient, exponentStr] = scientific.split("e");
    const exponent = parseInt(exponentStr);
    const [, decimal = ""] = coefficient.split(".");

    const significant = decimal.replace(/^0+/, "").slice(0, 5);
    const zeroCount = Math.abs(exponent) - 1;

    return `0.0<small class="text-[8px]">${zeroCount}</small>${significant}`;
  }

  return `${num.toFixed(4)}`;
};
