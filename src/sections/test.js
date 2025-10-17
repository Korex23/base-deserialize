import { ethers } from "ethers";

(async () => {
  // const WOG = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
  const WOG = "0xEeeeeeEeeeeEeEeeEeeEEEeeeeEeeeeeeeEEeE";
  const local = "http://localhost:3735";
  const prod = "http://evm-api.deserialize.xyz";
  const baseUrl = prod;
  const privateKey =
    "2f110ef58a02c7f9900e0e7956b736e66b1c0cfe3ae5a417bcf656239d13a294";
  const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
  const wallet = new ethers.Wallet(privateKey, provider);
  const userInput = {
    tokenA: WOG,
    tokenB: "0x59ef6f394bdbfef2b19565037ac85071223e94c",
    amountIn: "1000000000000000000",
    dexId: "ZERO_G",
  };
  const res = await fetch(`${baseUrl}/quote`, {
    method: "POST",
    body: JSON.stringify(userInput),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  console.log("data: ", data);

  const quote = { ...data, dexId: "ALL" };
  const quoteData = { quote, publicKey: wallet.address, slippage: 0.5 };

  const swapRes = await fetch(`${baseUrl}/swap`, {
    method: "POST",
    body: JSON.stringify(quoteData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const swapData = await swapRes.json();
  // console.log("swapData: ", swapData)

  for (const tx of swapData.transactions) {
    // const signedTx = await wallet.signTransaction(tx);
    //send transaction
    console.log("tx: ", tx);
    const txResponse = await wallet.sendTransaction(tx);
    console.log("txResponse: ", txResponse);
    const receipt = await txResponse.wait();
    console.log(
      "Transaction was mined in block ",
      await receipt?.getTransaction()
    );
  }

  //you can sign and send the transaction here
})();

// useEffect(() => {
//   if (!isConnected) return;
//   if (txStage !== "idle") return;
//   if (isPerformingSwap) return;

//   const valid =
//     state.sell.token.address &&
//     state.buy.token.address &&
//     enteredAmount &&
//     !isNaN(Number(enteredAmount));

//   if (!valid) return;

//   let stopFn: (() => void) | undefined;
//   setLoading(true);
//   setIsPolling(true);

//   // Trackers for idempotency
//   const successCountRef = { current: 0 };
//   const failureCountRef = { current: 0 };
//   let firstSuccessTracked = false;
//   let firstFailureTracked = false;

//   mixpanel.track("Fetching Quote Started", {
//     wallet_address: address,
//     sell_token: state.sell.token.symbol,
//     buy_token: state.buy.token.symbol,
//     amount_in: enteredAmount,
//     currentChain,
//     dex_id: state.dex || "ZERO_G",
//   });

//   (async () => {
//     try {
//       const { stop } = await quote(
//         {
//           tokenA: state.sell.token.address,
//           tokenB: state.buy.token.address,
//           slippage: 1,
//           amountIn: parseFloat(enteredAmount.toString()),
//           dexId: (state.dex as IDEXID) || "ZERO_G",
//           refreshTimeInMilliseconds: 20000,
//           minRefreshTimeInMilliseconds: 15000,
//           maxRefreshTimeInMilliseconds: 30000,
//         },
//         (q) => {
//           const routePath = Array.isArray(q?.path) ? q.path : [];
//           const amountOut = q.minAmountOutHuman;

//           if (!routePath.length || !amountOut || aToBFalse) {
//             console.warn("No valid route or amountOut from SDK quote:", q);

//             failureCountRef.current += 1;
//             if (!firstFailureTracked) {
//               mixpanel.track("Quote Fetch Failed", {
//                 wallet_address: address,
//                 sell_token: state.sell.token.symbol,
//                 buy_token: state.buy.token.symbol,
//                 amount_in: enteredAmount,
//                 dex_id: state.dex || "ZERO_G",
//                 currentChain,
//               });
//               firstFailureTracked = true;
//             }
//             return;
//           }

//           successCountRef.current += 1;
//           if (!firstSuccessTracked) {
//             mixpanel.track("Quote Fetch Success", {
//               wallet_address: address,
//               sell_token: state.sell.token.symbol,
//               buy_token: state.buy.token.symbol,
//               amount_in: enteredAmount,
//               dex_id: state.dex || "ZERO_G",
//               first_amount_out: amountOut,
//               currentChain,
//             });
//             firstSuccessTracked = true;
//           }

//           dispatch({
//             type: REDUCER_ACTION_TYPE.BUY_AMOUNT,
//             payload: amountOut,
//           });
//           dispatch({
//             type: REDUCER_ACTION_TYPE.SWAP_QUOTE,
//             payload: q,
//           });

//           setLoading(false);
//         }
//       );

//       stopFn = stop;
//     } catch (err) {
//       console.error("Error fetching quote:", err);

//       failureCountRef.current += 1;
//       if (!firstFailureTracked) {
//         mixpanel.track("Quote Fetch Failed", {
//           wallet_address: address,
//           sell_token: state.sell.token.symbol,
//           buy_token: state.buy.token.symbol,
//           amount_in: enteredAmount,
//           dex_id: state.dex || "ZERO_G",
//           error_message: String(err),
//           currentChain,
//         });
//         firstFailureTracked = true;
//       }

//       setLoading(false);
//       setIsPolling(false);
//     }
//   })();

//   return () => {
//     if (stopFn) stopFn();
//     setIsPolling(false);

//     // Track aggregated polling session summary
//     mixpanel.track("Fetching Quote Summary", {
//       wallet_address: address,
//       sell_token: state.sell.token.symbol,
//       buy_token: state.buy.token.symbol,
//       amount_in: enteredAmount,
//       dex_id: state.dex || "ZERO_G",
//       success_count: successCountRef.current,
//       failure_count: failureCountRef.current,
//       currentChain,
//     });
//   };
// }, [
//   isConnected,
//   enteredAmount,
//   state.sell.token.address,
//   state.buy.token.address,
//   state.dex,
//   txStage,
//   isPerformingSwap,
//   activeChain,
// ]);

// useEffect(() => {
//   let intervalId: NodeJS.Timeout;

//   if (isConnected && address) {
//     intervalId = setInterval(() => {
//       fetchWalletAssets(address);
//     }, 30000);
//   }

//   return () => {
//     if (intervalId) clearInterval(intervalId);
//   };
// }, []);

// const performSdkSwap = useCallback(async () => {
//   if (!isConnected) {
//     console.warn("Wallet notisConnected. Cannot perform swap.");
//     return;
//   }
//   if (!state.sell.token.address || !state.buy.token.address) {
//     console.warn("Token addresses not set. Cannot perform swap.");
//     return;
//   }
//   if (!state.swap_quote) {
//     console.warn("No quote available. Cannot perform swap.");
//     return;
//   }

//   mixpanel.track("Swap Transaction Started", {
//     sell_token: state.sell.token.symbol,
//     buy_token: state.buy.token.symbol,
//     sell_token_address: state.sell.token.address,
//     buy_token_address: state.buy.token.address,
//     amountIn: state.swap_quote?.amountIn,
//     amountOut: state.swap_quote?.amountOut,
//     wallet_address: address,
//     dex_id: state.dex || "ALL",
//     currentChain,
//   });

//   setIsPerformingSwap(true);
//   setTxStage("signing");

//   try {
//     const [res, error] = await swap({
//       dexID: "ALL",
//       quote: { ...state.swap_quote },
//       feeRate: "0",
//     });

//     if (!res) {
//       throw new Error(error || "Swap failed");
//     }

//     setTxStage("broadcast");
//     const signature = res.transactionHash;

//     setTxStage("mining");
//     fetchWalletAssets(address || "");
//     setTxStage("confirmed");

//     toast({
//       title: "Transaction Completed",
//       description: (
//         <a
//           className="underline"
//           target="_blank"
//           href={`https://chainscan-galileo.0g.ai/tx/${signature}`}
//         >
//           {signature}
//         </a>
//       ),
//       className: "border-2 border-green-500 mt-4",
//     });
//     mixpanel.track("Swap Success", {
//       tx_signature: signature,
//       tx_url: `https://chainscan-galileo.0g.ai/tx/${signature}`,
//       timestamp: new Date().toISOString(),
//       currentChain,
//     });
//   } catch (err: any) {
//     console.error("Swap error:", err);
//     setTxStage("failed");

//     if (err?.code === 4001) {
//       toast({
//         title: "Transaction Rejected",
//         description: "You rejected the transaction.",
//         className: "border-2 border-red-500 mt-4",
//       });
//       mixpanel.track("User Rejected Swap Transaction", { currentChain });
//     } else {
//       toast({
//         title: "Transaction Failed",
//         description:
//           err?.message === "Returned error: Internal JSON-RPC error."
//             ? "0g network error, please try again"
//             : err.message || "An error occurred.",
//         className: "border-2 border-red-500 mt-4",
//       });
//       mixpanel.track("Swap Failed", {
//         error_code: err.code,
//         error_message: err.message,
//         stage: txStage,
//         currentChain,
//       });
//     }
//   } finally {
//     setIsPerformingSwap(false);
//     setTimeout(() => setTxStage("idle"), 1500);
//   }
// }, [
//   isConnected,
//   state.sell.token.address,
//   state.buy.token.address,
//   state.swap_quote,
//   state.dex,
//   address,
//   fetchWalletAssets,
//   toast,
//   swap,
// ]);
