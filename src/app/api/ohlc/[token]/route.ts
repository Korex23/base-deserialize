// import { NextRequest } from "next/server";
// import prisma from "@/lib/prisma"; // update to your actual prisma import path

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { token: string } }
// ) {
//   const { token } = await params;

//   const modelMap = {
//     solana: prisma.solanaOhlc,
//     wif: prisma.wifoOhlc,
//     "turbo-usd": prisma.tUsdOhlc,
//     orca: prisma.orcaOhlc,
//     "turbo-eth": prisma.tEthOhlc,
//     "usd-coin": prisma.usdcOhlc,
//     "bitz-2": prisma.bitzOhlc,
//     ethereum: prisma.ethereumOhlc,
//   };

//   const model = modelMap[token];
//   if (!model) {
//     return new Response(JSON.stringify({ error: "Invalid token" }), {
//       status: 400,
//     });
//   }

//   const ohlcData = await model.findMany({
//     orderBy: { timestamp: "asc" },
//   });

//   const formatted = ohlcData.map((item) => ({
//     time: Number(item.timestamp) / 1000, // UNIX timestamp in seconds
//     open: item.open,
//     high: item.high,
//     low: item.low,
//     close: item.close,
//   }));

//   return new Response(JSON.stringify(formatted), {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
// }
