// "use client";

// import React, { useState } from "react";
// import { SwapSDK } from "evm-deserialize-client-sdk"; // adjust import as needed

// const sdk = new SwapSDK("0G"); // default chain

// export default function SwapSDKDemo() {
//   const [quote, setQuote] = useState<any>(null);
//   const [swapResult, setSwapResult] = useState<any>(null);
//   const [tokenList, setTokenList] = useState<any>(null);
//   const [tokenListWithDetails, setTokenListWithDetails] = useState<any>(null);
//   const [tokenPrice, setTokenPrice] = useState<any>(null);
//   const [tokenDetails, setTokenDetails] = useState<any>(null);
//   const [balance, setBalance] = useState<any>(null);
//   const [tokenInfo, setTokenInfo] = useState<any>(null);

//   const [wallet, setWallet] = useState("");
//   const [token, setToken] = useState("");
//   const [amountIn, setAmountIn] = useState("");

//   async function fetchQuote() {
//     try {
//       const data = await sdk.getQuote({
//         tokenA: token,
//         tokenB: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//         amountIn,
//         dexId: "ALL",
//       });
//       setQuote(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function executeSwap() {
//     if (!quote) return alert("Get a quote first");

//     try {
//       const data = await sdk.executeSwap({
//         publicKey: wallet,
//         quote: {
//           ...quote,
//         },
//         slippage: 1,
//       });
//       setSwapResult(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function fetchTokenList() {
//     setTokenList(await sdk.getTokenList());
//   }

//   async function fetchTokenListWithDetails() {
//     setTokenListWithDetails(await sdk.getTokenListWithDetails());
//   }

//   async function fetchTokenPrice() {
//     setTokenPrice(await sdk.getTokenPrice(token));
//   }

//   async function fetchTokenDetails() {
//     setTokenDetails(await sdk.getTokenDetails(token));
//   }

//   async function fetchBalance() {
//     setBalance(
//       await sdk.getTokenBalance({
//         tokenAddress: token,
//         walletAddress: wallet,
//       })
//     );
//   }

//   async function fetchTokenInfo() {
//     setTokenInfo(
//       await sdk.getTokenInfo({
//         tokenAddress: token,
//         walletAddress: wallet,
//       })
//     );
//   }

//   return (
//     <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
//       <h1>SwapSDK Demo</h1>

//       {/* Input Section */}
//       <div
//         style={{
//           marginBottom: 20,
//           padding: 15,
//           border: "1px solid #ccc",
//           borderRadius: 8,
//         }}
//       >
//         <h3>Configuration</h3>
//         <div
//           style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}
//         >
//           <div>
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Wallet Address
//             </label>
//             <input
//               value={wallet}
//               onChange={(e) => setWallet(e.target.value)}
//               placeholder="0x..."
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 border: "1px solid #ddd",
//                 borderRadius: 4,
//               }}
//             />
//           </div>

//           <div>
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Token Address
//             </label>
//             <input
//               value={token}
//               onChange={(e) => setToken(e.target.value)}
//               placeholder="0x..."
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 border: "1px solid #ddd",
//                 borderRadius: 4,
//               }}
//             />
//           </div>

//           <div>
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Amount In
//             </label>
//             <input
//               value={amountIn}
//               onChange={(e) => setAmountIn(e.target.value)}
//               placeholder="1000000"
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 border: "1px solid #ddd",
//                 borderRadius: 4,
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div
//         style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10 }}
//       >
//         <button
//           onClick={fetchQuote}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #007bff",
//             backgroundColor: "#007bff",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Quote
//         </button>
//         <button
//           onClick={executeSwap}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #28a745",
//             backgroundColor: "#28a745",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Execute Swap
//         </button>
//         <button
//           onClick={fetchTokenList}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #6c757d",
//             backgroundColor: "#6c757d",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token List
//         </button>
//         <button
//           onClick={fetchTokenListWithDetails}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #6c757d",
//             backgroundColor: "#6c757d",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token List With Details
//         </button>
//         <button
//           onClick={fetchTokenPrice}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #ffc107",
//             backgroundColor: "#ffc107",
//             color: "black",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token Price
//         </button>
//         <button
//           onClick={fetchTokenDetails}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #17a2b8",
//             backgroundColor: "#17a2b8",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token Details
//         </button>
//         <button
//           onClick={fetchBalance}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #6610f2",
//             backgroundColor: "#6610f2",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token Balance
//         </button>
//         <button
//           onClick={fetchTokenInfo}
//           style={{
//             padding: "10px 15px",
//             border: "1px solid #e83e8c",
//             backgroundColor: "#e83e8c",
//             color: "white",
//             borderRadius: 4,
//             cursor: "pointer",
//           }}
//         >
//           Get Token Info
//         </button>
//       </div>

//       {/* Results Section */}
//       <div style={{ display: "grid", gap: 15 }}>
//         {quote && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Quote</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(quote, null, 2)}
//             </pre>
//           </div>
//         )}

//         {swapResult && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Swap Result</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(swapResult, null, 2)}
//             </pre>
//           </div>
//         )}

//         {tokenList && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Token List</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(tokenList, null, 2)}
//             </pre>
//           </div>
//         )}

//         {tokenListWithDetails && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Token List With Details</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(tokenListWithDetails, null, 2)}
//             </pre>
//           </div>
//         )}

//         {tokenPrice && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Token Price</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(tokenPrice, null, 2)}
//             </pre>
//           </div>
//         )}

//         {tokenDetails && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Token Details</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(tokenDetails, null, 2)}
//             </pre>
//           </div>
//         )}

//         {balance && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Balance</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(balance, null, 2)}
//             </pre>
//           </div>
//         )}

//         {tokenInfo && (
//           <div
//             style={{
//               padding: 15,
//               border: "1px solid #dee2e6",
//               borderRadius: 4,
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h4>Token Info</h4>
//             <pre style={{ margin: 0, fontSize: 12, overflow: "auto" }}>
//               {JSON.stringify(tokenInfo, null, 2)}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
