// "use client";
// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
//   useReducer,
//   ChangeEvent,
// } from "react";
// import { Aldrich, Montserrat_Alternates } from "next/font/google";
// import { motion } from "framer-motion";
// import { ExchangeIcon } from "@/components/general/Icons";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { reducerAction } from "@/reducers/swapform-reducer";
// import { useWallet } from "@/context/user-wallet-provider";
// import SwapInputgroup from "@/components/form/swapinputgroup";
// import TokenCard from "@/components/general/TokenCard";
// import { mainnetDefaults } from "@/data/mock-data";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import {
//   InputActionButtonType,
//   SwapQuoteResponse,
//   TokenAsset,
// } from "@/types/swapform";
// import { REDUCER_ACTION_TYPE } from "@/lib/constant";
// import useDebounce from "@/hooks/useDebounce";
// import { DexIdTypes } from "@/types/swapform";
// import { parseUnits, formatUnits, ethers } from "ethers";
// import SwapImpact from "@/components/form/swapImpact";
// import { useToast } from "@/hooks/use-toast";
// import { MAINNET_API_URL, TESTNET_API_URL } from "@/lib/constant";
// import SwapCustomConnectButton from "@/components/general/SwapConnectButton";
// import mixpanel from "@/lib/mixpanel";

// const montserrat_alternates = Montserrat_Alternates({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

// const SwapForm = () => {
//   const {
//     isConnected,
//     assets,
//     address,
//     finalEthBalance,
//     fetchWalletAssets,
//     currentChain,
//     tokenList,
//   } = useWallet();

//   const { toast } = useToast();
//   // const { swap, quote } = useDeserializeEVM(
//   //   currentChain,
//   //   isConnected ? address ?? "" : ""
//   // );
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();
//   const currentSearchParams = useRef(new URLSearchParams(searchParams));

//   const [loading, setLoading] = useState(false);
//   const isFetchingRef = useRef(false);
//   const [hasInitializedFromURL, setHasInitializedFromURL] = useState(false);

//   const tokenIn = searchParams.get("tokenIn");
//   const tokenOut = searchParams.get("tokenOut");
//   const amount = searchParams.get("amount");
//   const dexId = searchParams.get("dexId");

//   const queryParamsHandler = useCallback(
//     (query: string) => {
//       router.replace(`${pathname}?${query}`, { scroll: false });
//     },
//     [pathname, router]
//   );

//   const initialValue = useMemo(
//     () => ({
//       buy: mainnetDefaults.buy,
//       sell: {
//         ...mainnetDefaults.sell,
//         amount: "",
//       },
//       dex: "ZERO_G" as DexIdTypes,
//     }),
//     []
//   );

//   const [isPerformingSwap, setIsPerformingSwap] = useState<boolean>(false);
//   const [txStage, setTxStage] = useState<
//     | "idle"
//     | "signing"
//     | "broadcast"
//     | "mining"
//     | "confirmed"
//     | "failed"
//     | "done"
//   >("idle");
//   const [state, dispatch] = useReducer(reducerAction, initialValue);

//   useEffect(() => {
//     dispatch({ type: REDUCER_ACTION_TYPE.RESET, payload: initialValue });
//   }, [initialValue]);

//   useEffect(() => {
//     if (!hasInitializedFromURL) return;

//     console.log("Chain changed, resetting to defaults for:", currentChain);

//     // Reset to new chain defaults
//     dispatch({
//       type: REDUCER_ACTION_TYPE.SELL_TOKEN,
//       payload: {
//         ...mainnetDefaults.sell.token,
//         balance: "0",
//         logoURI: mainnetDefaults.sell.token.logo,
//       },
//     });

//     dispatch({
//       type: REDUCER_ACTION_TYPE.BUY_TOKEN,
//       payload: {
//         ...mainnetDefaults.buy.token,
//         balance: "0",
//         logoURI: mainnetDefaults.buy.token.logo,
//       },
//     });

//     // Clear amounts when switching chains
//     dispatch({ type: REDUCER_ACTION_TYPE.SELL_AMOUNT, payload: "" });
//     dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });

//     // Clear URL params
//     currentSearchParams.current.delete("tokenIn");
//     currentSearchParams.current.delete("tokenOut");
//     currentSearchParams.current.delete("amount");
//     queryParamsHandler(currentSearchParams.current.toString());
//   }, [
//     currentChain,
//     mainnetDefaults,
//     hasInitializedFromURL,
//     queryParamsHandler,
//   ]);

//   const enteredAmount = useDebounce(state.sell.amount, 500);

//   // Get current balances from assets array
//   const currentSellBalance = useMemo(() => {
//     if (!assets?.length || !state.sell.token.address) return "0";
//     const asset = assets.find(
//       (a) => a.address.toLowerCase() === state.sell.token.address.toLowerCase()
//     );
//     return asset?.balance || "0";
//   }, [assets, state.sell.token.address]);

//   const currentBuyBalance = useMemo(() => {
//     if (!assets?.length || !state.buy.token.address) return "0";
//     const asset = assets.find(
//       (a) => a.address.toLowerCase() === state.buy.token.address.toLowerCase()
//     );
//     return asset?.balance || "0";
//   }, [assets, state.buy.token.address]);

//   // Initialize from URL params once when tokenList is available
//   useEffect(() => {
//     if (!tokenList.length || hasInitializedFromURL) return;

//     const findToken = (address?: string) =>
//       address
//         ? tokenList.find(
//             (t) => t.address.toLowerCase() === address.toLowerCase()
//           )
//         : undefined;

//     const findAsset = (address?: string) =>
//       address
//         ? assets.find((a) => a.address.toLowerCase() === address.toLowerCase())
//         : undefined;

//     let hasUpdates = false;

//     // Set buy token from URL
//     if (tokenOut) {
//       const buyToken = findToken(tokenOut);
//       const buyAsset = findAsset(tokenOut);

//       if (buyToken) {
//         console.log("Setting buy token:", buyToken.symbol, buyAsset?.balance);
//         dispatch({
//           type: REDUCER_ACTION_TYPE.BUY_TOKEN,
//           payload: {
//             ...buyToken,
//             balance: buyAsset?.balance?.toString() ?? "0",
//             logoURI: buyToken.logo ?? mainnetDefaults.buy.token.logo,
//           },
//         });
//         hasUpdates = true;
//       }
//     }

//     // Set sell token from URL
//     if (tokenIn) {
//       const sellToken = findToken(tokenIn);
//       const sellAsset = findAsset(tokenIn);

//       if (sellToken) {
//         console.log(
//           "Setting sell token:",
//           sellToken.symbol,
//           sellAsset?.balance
//         );
//         dispatch({
//           type: REDUCER_ACTION_TYPE.SELL_TOKEN,
//           payload: {
//             ...sellToken,
//             balance: sellAsset?.balance?.toString() ?? "0",
//             logoURI: sellToken.logo ?? mainnetDefaults.sell.token.logo,
//           },
//         });
//         hasUpdates = true;
//       }
//     }

//     // Set amount from URL
//     if (amount && amount !== state.sell.amount.toString()) {
//       console.log("Setting amount:", amount);
//       dispatch({
//         type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
//         payload: parseFloat(amount),
//       });
//       hasUpdates = true;
//     }

//     // Set dex from URL
//     if (dexId && dexId !== state.dex) {
//       console.log("Setting dex:", dexId);
//       dispatch({
//         type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE,
//         payload: dexId as DexIdTypes,
//       });
//       hasUpdates = true;
//     }

//     if (hasUpdates) {
//       setHasInitializedFromURL(true);
//     }
//   }, [
//     tokenList.length,
//     assets,
//     tokenIn,
//     tokenOut,
//     amount,
//     dexId,
//     hasInitializedFromURL,
//     state.sell.amount,
//     state.dex,
//   ]);

//   // Update balances when assets change (after wallet operations)
//   useEffect(() => {
//     if (!assets?.length) return;
//     if (!hasInitializedFromURL) return; // Only update balances after initial setup

//     console.log("Updating balances from assets...");

//     // Update sell token balance
//     if (state.sell.token.address) {
//       const sellBalance = currentSellBalance;
//       if (sellBalance !== state.sell.balance) {
//         console.log("Updating sell balance:", sellBalance);
//         dispatch({
//           type: REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE,
//           payload: sellBalance,
//         });
//       }
//     }

//     // Update buy token balance
//     if (state.buy.token.address) {
//       const buyBalance = currentBuyBalance;
//       if (buyBalance !== state.buy.balance) {
//         console.log("Updating buy balance:", buyBalance);
//         dispatch({
//           type: REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE,
//           payload: buyBalance,
//         });
//       }
//     }
//   }, [
//     assets,
//     currentSellBalance,
//     currentBuyBalance,
//     hasInitializedFromURL,
//     state.sell.token.address,
//     state.buy.token.address,
//     state.sell.balance,
//     state.buy.balance,
//   ]);

//   const selectedTokenHandler = useCallback(
//     async (item: TokenAsset, type: "sell" | "buy") => {
//       // console.log(`Selecting ${type} token:`, item);

//       // Get the current balance for the selected token
//       const tokenBalance =
//         assets?.find(
//           (a) => a.address.toLowerCase() === item.address.toLowerCase()
//         )?.balance || "0";

//       // Create token payload with current balance
//       const tokenPayload = {
//         ...item,
//         balance: tokenBalance,
//         decimals: item.decimals,
//         logoURI:
//           item.logo ??
//           (type === "sell"
//             ? mainnetDefaults.sell.token.logo
//             : mainnetDefaults.buy.token.logo),
//       };

//       // console.log(tokenPayload);

//       // Update the token
//       dispatch({
//         type:
//           type === "sell"
//             ? REDUCER_ACTION_TYPE.SELL_TOKEN
//             : REDUCER_ACTION_TYPE.BUY_TOKEN,
//         payload: tokenPayload,
//       });

//       // Update the balance separately to ensure it's current
//       dispatch({
//         type:
//           type === "sell"
//             ? REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE
//             : REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE,
//         payload: tokenBalance,
//       });

//       // Update URL params
//       if (currentSearchParams.current) {
//         currentSearchParams.current.set(
//           `token${type === "sell" ? "In" : "Out"}`,
//           item.address
//         );
//         queryParamsHandler(currentSearchParams.current.toString());
//       }
//     },
//     [assets, queryParamsHandler]
//   );

//   const changeHandler = useCallback(
//     (e: ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value.trim();

//       if (value === "") {
//         currentSearchParams.current.delete("amount");
//         dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
//       } else {
//         currentSearchParams.current.set("amount", value);
//       }

//       dispatch({
//         type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
//         payload: value ? parseFloat(value) : "",
//       });
//       queryParamsHandler(currentSearchParams.current.toString());
//     },
//     [queryParamsHandler]
//   );

//   const actionHandler = useCallback(
//     async (type: InputActionButtonType) => {
//       try {
//         const updateAmount = (amt: number | string) => {
//           const amountStr = typeof amt === "number" ? amt.toString() : amt;
//           currentSearchParams.current.set("amount", amountStr);
//           dispatch({
//             type: REDUCER_ACTION_TYPE.SELL_AMOUNT,
//             payload: parseFloat(amountStr),
//           });
//         };

//         if (type === "clear") {
//           currentSearchParams.current.delete("amount");
//           dispatch({ type: REDUCER_ACTION_TYPE.SELL_AMOUNT, payload: "" });
//           dispatch({ type: REDUCER_ACTION_TYPE.BUY_AMOUNT, payload: "" });
//         } else if (type === "max") {
//           // Use the current balance from useMemo
//           updateAmount(currentSellBalance);
//         } else if (type === "50%") {
//           const halfBalance = parseFloat(currentSellBalance) / 2;
//           updateAmount(halfBalance);
//         }

//         queryParamsHandler(currentSearchParams.current.toString());
//       } catch (err) {
//         console.error("Error in actionHandler:", err);
//       }
//     },
//     [currentSellBalance, queryParamsHandler]
//   );

//   const swapCurrency = useCallback(() => {
//     dispatch({ type: REDUCER_ACTION_TYPE.SWAP });
//     currentSearchParams.current.set("tokenIn", `${state.buy.token.address}`);
//     currentSearchParams.current.set("tokenOut", `${state.sell.token.address}`);
//     currentSearchParams.current.set("amount", `${state.buy.amount}`);
//     queryParamsHandler(currentSearchParams.current.toString());
//   }, [
//     state.buy.token.address,
//     state.sell.token.address,
//     queryParamsHandler,
//     state.buy.amount,
//   ]);

//   const isBusy = loading || isPerformingSwap || txStage !== "idle";

//   const fetchQuote = useCallback(async () => {
//     if (!isConnected) return;
//     if (txStage !== "idle") return;
//     if (isPerformingSwap) return;

//     const valid =
//       state.sell.token.address &&
//       state.buy.token.address &&
//       enteredAmount &&
//       !isNaN(Number(enteredAmount));

//     if (!valid) return;

//     // console.log(state.sell.token);
//     // console.log(state.buy.token);

//     const inputDecimal = state.sell.token.decimals;
//     const outputDecimal = state.buy.token.decimals;

//     // console.log(inputDecimal, outputDecimal);

//     const amountInRaw = parseUnits(
//       enteredAmount.toString(),
//       inputDecimal ?? 18
//     ).toString();

//     const quoteBody = {
//       tokenA: state.sell.token.address,
//       tokenB: state.buy.token.address,
//       dexId: state.dex,
//       amountIn: amountInRaw,
//     };

//     setLoading(true);

//     const baseURL =
//       currentChain === "0gMainnet" ? MAINNET_API_URL : TESTNET_API_URL;

//     try {
//       // console.log(quoteBody);

//       const res = await fetch(`${baseURL}/quote`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(quoteBody),
//       });
//       const quote: SwapQuoteResponse = await res.json();
//       const amountOut = quote.amountOut;
//       const amountOutHuman = formatUnits(amountOut, outputDecimal ?? 18);
//       const routePlan = quote.routePlan;

//       if (routePlan.length <= 0 || !amountOut) {
//         return;
//       }

//       dispatch({
//         type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
//         payload: amountOutHuman,
//       });

//       dispatch({
//         type: REDUCER_ACTION_TYPE.SWAP_QUOTE,
//         payload: quote,
//       });

//       setLoading(false);

//       // console.log(quote);
//     } catch (error) {
//       console.error(error);
//     }
//   }, [
//     currentChain,
//     state.sell.token.address,
//     state.sell.token.decimals,
//     state.buy.token.address,
//     enteredAmount,
//     state.dex,
//     txStage,
//     isPerformingSwap,
//     isConnected,
//   ]);

//   useEffect(() => {
//     fetchQuote(); // run once immediately
//     const intervalId = setInterval(fetchQuote, 30000);
//     return () => clearInterval(intervalId);
//   }, [fetchQuote]);

//   const performSwap = useCallback(async () => {
//     if (!isConnected) {
//       console.warn("Wallet notisConnected. Cannot perform swap.");
//       return;
//     }
//     if (!state.sell.token.address || !state.buy.token.address) {
//       console.warn("Token addresses not set. Cannot perform swap.");
//       return;
//     }
//     if (!state.swap_quote) {
//       console.warn("No quote available. Cannot perform swap.");
//       return;
//     }

//     mixpanel.track("Swap Transaction Started", {
//       sell_token: state.sell.token.symbol,
//       buy_token: state.buy.token.symbol,
//       sell_token_address: state.sell.token.address,
//       buy_token_address: state.buy.token.address,
//       amountIn: state.swap_quote?.amountIn,
//       amountOut: state.swap_quote?.amountOut,
//       wallet_address: address,
//       dex_id: state.dex || "ALL",
//       currentChain,
//     });

//     setIsPerformingSwap(true);
//     setTxStage("signing");

//     const baseURL =
//       currentChain === "0gMainnet" ? MAINNET_API_URL : TESTNET_API_URL;
//     const swapBody = {
//       publicKey: address,
//       quote: { ...state.swap_quote, dexId: "ALL" },
//       slippage: 0.5,
//     };

//     try {
//       const res = await fetch(`${baseURL}/swap`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(swapBody),
//       });

//       const result = await res.json(); // should be an array of tx objects
//       const transactions = result.transactions;
//       console.log("Swap transactions:", transactions);

//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       setTxStage("broadcast");
//       // 1. Simulate each tx individually
//       for (const tx of transactions) {
//         try {
//           await provider.call({
//             to: tx.to,
//             from: tx.from,
//             data: tx.data,
//             value: tx.value || "0x0",
//           });
//           console.log("Simulation OK for:", tx.to);
//         } catch (err) {
//           console.log("Simulation failed for:", tx.to, err);
//         }
//       }

//       const sendResults = await Promise.allSettled(
//         transactions.map((tx) =>
//           signer.sendTransaction({
//             to: tx.to,
//             data: tx.data,
//             value: tx.value ? ethers.toBeHex(tx.value) : "0x0",
//           })
//         )
//       );

//       const successfulTxs = sendResults
//         .map((r) => (r.status === "fulfilled" ? r.value : null))
//         .filter(Boolean);

//       // ✅ Pick the hash of the last successful tx
//       const lastTx = successfulTxs[successfulTxs.length - 1] || null;
//       const txHash = lastTx?.hash || null;

//       console.log(
//         "Broadcast results:",
//         sendResults.map((r, i) => ({
//           index: i,
//           status: r.status,
//           hash: r.status === "fulfilled" ? r.value.hash : null,
//           reason: r.status === "rejected" ? r.reason : null,
//         }))
//       );

//       setTxStage("mining");

//       // 3. Wait for receipts with per-tx error handling
//       const receiptResults = await Promise.allSettled(
//         successfulTxs.map((txResp) => txResp.wait())
//       );

//       console.log(
//         "Receipt results:",
//         receiptResults.map((r, i) => ({
//           index: i,
//           status: r.status,
//           receipt: r.status === "fulfilled" ? r.value.hash : null,
//           reason: r.status === "rejected" ? r.reason : null,
//         }))
//       );

//       setTxStage("confirmed");
//       fetchWalletAssets(address || "");

//       // ✅ Only show toast if we have a txHash
//       if (txHash) {
//         toast({
//           title: "Transaction Completed",
//           description: (
//             <a
//               className="underline"
//               target="_blank"
//               href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
//             >
//               {txHash}
//             </a>
//           ),
//           className: "border-2 border-green-500 mt-4",
//         });

//         mixpanel.track("Swap Success", {
//           tx_signature: txHash,
//           tx_url: `https://chainscan-galileo.0g.ai/tx/${txHash}`,
//           timestamp: new Date().toISOString(),
//           currentChain,
//         });
//       }
//     } catch (err: any) {
//       console.error("Swap error:", err);
//       setTxStage("failed");

//       if (err?.code === 4001) {
//         toast({
//           title: "Transaction Rejected",
//           description: "You rejected the transaction.",
//           className: "border-2 border-red-500 mt-4",
//         });
//         mixpanel.track("User Rejected Swap Transaction", { currentChain });
//       } else {
//         toast({
//           title: "Transaction Failed",
//           description:
//             err?.message === "Returned error: Internal JSON-RPC error."
//               ? "0g network error, please try again"
//               : err.message || "An error occurred.",
//           className: "border-2 border-red-500 mt-4",
//         });
//         mixpanel.track("Swap Failed", {
//           error_code: err.code,
//           error_message: err.message,
//           stage: txStage,
//           currentChain,
//         });
//       }
//     } finally {
//       setIsPerformingSwap(false);
//       setTimeout(() => setTxStage("idle"), 1500);
//     }
//   }, [
//     isConnected,
//     state.sell.token.address,
//     state.buy.token.address,
//     state.swap_quote,
//     state.dex,
//     address,
//     fetchWalletAssets,
//     toast,
//   ]);

//   const label = loading
//     ? "Fetching swap quote…"
//     : txStage === "signing"
//     ? "Awaiting wallet signature…"
//     : txStage === "broadcast"
//     ? "Submitting transaction…"
//     : txStage === "mining"
//     ? "Waiting for confirmation…"
//     : isPerformingSwap
//     ? "Processing…"
//     : "Swap";

//   return (
//     <section className="pt-1">
//       <section className="pt-1">
//         <div>
//           <TokenCard>
//             <div className="flex justify-between items-center mb-5">
//               <h1
//                 className={`text-3xl bg-white bg-clip-text text-transparent w-full ${montserrat_alternates.className}`}
//               >
//                 Swap
//               </h1>
//               <div className="flex items-center space-x-2">
//                 <div className="bg-[#122A10] text-white px-2 py-0.5 rounded-lg text-sm">
//                   <Dialog>
//                     <DialogTrigger className="bg-[#122A10] hover:bg-[#122A10] text-white px-1 py-1.5">
//                       <span className="whitespace-nowrap">
//                         Dex:{" "}
//                         <span className="text-[#20801F]">
//                           {" "}
//                           {state.dex === "ZERO_G" ? "JAINE" : state.dex}
//                         </span>
//                       </span>
//                     </DialogTrigger>
//                     <DialogContent className="w-[90%]">
//                       <DialogHeader>
//                         <DialogTitle>Route Dex</DialogTitle>
//                         <DialogDescription>
//                           Select Your Preferred Dex Pools To Use.
//                         </DialogDescription>
//                         <div className="flex flex-row flex-wrap pt-4 gap-2">
//                           {["ALL", "ZERO_G"].map((dex) => (
//                             <DialogClose key={dex}>
//                               <Button
//                                 className="bg-slate-200 text-black mr-2"
//                                 onClick={() => {
//                                   dispatch({
//                                     type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE,
//                                     payload: dex as DexIdTypes,
//                                   });
//                                   currentSearchParams.current.set("dexId", dex);
//                                   queryParamsHandler(
//                                     currentSearchParams.current.toString()
//                                   );
//                                 }}
//                               >
//                                 {dex === "ZERO_G" ? "JAINE" : dex}
//                               </Button>
//                             </DialogClose>
//                           ))}
//                         </div>
//                       </DialogHeader>
//                     </DialogContent>
//                   </Dialog>
//                 </div>

//                 <div className="py-0.5 rounded-md text-sm">
//                   <Button
//                     className="relative bg-[#122A10] hover:bg-[#122A10] w-[37px] h-[37px] p-0 rounded-xl flex items-center justify-center"
//                     disabled={
//                       loading ||
//                       isFetchingRef.current ||
//                       !enteredAmount ||
//                       !state.sell.token.address ||
//                       !state.buy.token.address
//                     }
//                     aria-label="Refresh quote"
//                     title="Refresh quote"
//                   >
//                     {loading ? (
//                       <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
//                     ) : (
//                       <svg
//                         width="18"
//                         height="18"
//                         viewBox="0 0 18 18"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path
//                           d="M8.8 17.76C7.59 17.76 6.45 17.53 5.38 17.07C4.31 16.61 3.39 15.98 2.6 15.19C1.81 14.4 1.18 13.48 0.72 12.41C0.26 11.34 0.03 10.21 0.03 9C0.03 7.78 0.26 6.64 0.72 5.57C1.18 4.51 1.8 3.58 2.59 2.79C3.38 2 4.31 1.37 5.38 0.91C6.45 0.45 7.58 0.22 8.79 0.22C10 0.22 11.14 0.45 12.21 0.91C13.28 1.37 14.21 2 15 2.79C15.79 3.57 16.41 4.5 16.87 5.57C17.33 6.63 17.56 7.77 17.56 8.99C17.56 10.2 17.33 11.34 16.87 12.41C16.41 13.47 15.79 14.4 15 15.19C14.21 15.98 13.28 16.61 12.22 17.07C11.15 17.53 10.01 17.76 8.8 17.76Z"
//                           fill="white"
//                         />
//                       </svg>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <form>
//               <div className="relative flex flex-col gap-5">
//                 <SwapInputgroup
//                   id="Sell"
//                   type="number"
//                   variant="sell"
//                   label="Sell"
//                   placeholder="0.00"
//                   disabled={false}
//                   value={state.sell.amount}
//                   selectedToken={state.sell.token}
//                   otherSelectedToken={state.buy.token}
//                   onChange={changeHandler}
//                   autoFocus={true}
//                   actionHandler={actionHandler}
//                   tokenData={tokenList.map((token) => ({
//                     ...token,
//                     balance: "0",
//                     logoURI: token.logo,
//                   }))}
//                   setSelectedToken={(item) =>
//                     selectedTokenHandler(item, "sell")
//                   }
//                   tokenBalance={Number(currentSellBalance)}
//                   tokenRate={
//                     Number(state.swap_quote?.tokenPrice) *
//                       Number(enteredAmount) || 0
//                   }
//                   finalEthBalance={finalEthBalance}
//                   loading={loading}
//                   tokenList={tokenList}
//                 />

//                 <motion.button
//                   className="transition absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
//                   type="button"
//                   aria-label="Swap chains"
//                   onClick={swapCurrency}
//                 >
//                   <ExchangeIcon />
//                 </motion.button>

//                 <SwapInputgroup
//                   id="Buy"
//                   variant="buy"
//                   label="Buy"
//                   placeholder="0.00"
//                   otherSelectedToken={state.sell.token}
//                   selectedToken={state.buy.token}
//                   value={state.buy.amount}
//                   disabled={false}
//                   loading={loading}
//                   tokenData={tokenList.map((token) => ({
//                     ...token,
//                     balance: "0",
//                     logoURI: token.logo,
//                   }))}
//                   setSelectedToken={(item) => selectedTokenHandler(item, "buy")}
//                   tokenBalance={Number(currentBuyBalance)}
//                   tokenRate={
//                     Number(state.swap_quote?.tokenPrice) *
//                       Number(state.sell.amount) || 0
//                   }
//                   finalEthBalance={finalEthBalance}
//                   tokenList={tokenList}
//                 />
//               </div>

//               <div className="mt-6">
//                 <SwapCustomConnectButton
//                   performSdkSwap={performSwap}
//                   tokenA={state.sell.token.address}
//                   tokenB={state.buy.token.address}
//                   isBusy={isBusy}
//                   isPerformingSwap={isPerformingSwap}
//                   label={label}
//                   enteredAmount={String(enteredAmount)}
//                 />
//               </div>
//             </form>
//           </TokenCard>
//         </div>
//         {state.swap_quote && (
//           <SwapImpact
//             rawQuote={state.swap_quote}
//             sellToken={state.sell.token}
//             buyToken={state.buy.token}
//             loading={loading}
//           />
//         )}
//       </section>
//     </section>
//   );
// };

// export default SwapForm;
