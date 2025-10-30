import { JsonRpcProvider, Contract, isAddress } from "ethers";

const provider = new JsonRpcProvider(process.env.BASE_RPC_URL);
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
];

export async function POST(req: Request) {
  try {
    const { tokenAddress, walletAddress } = await req.json();

    if (!isAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: "Invalid wallet" }), {
        status: 400,
      });
    }

    if (!isAddress(tokenAddress)) {
      return new Response(JSON.stringify({ error: "Invalid token address" }), {
        status: 400,
      });
    }

    // Check if contract exists at the address
    const code = await provider.getCode(tokenAddress);
    if (code === "0x") {
      return new Response(
        JSON.stringify({
          error: "Token contract does not exist",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, symbol, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.symbol(),
      contract.decimals(),
    ]);

    // ✅ Convert BigInt -> string manually
    const result = {
      balance: balance ? balance.toString() : "0",
      symbol,
      decimals: Number(decimals),
    };

    // ✅ Safe JSON serialization
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error in /api/token-info:", err);

    // Handle specific contract errors
    if (
      err.code === "CALL_EXCEPTION" ||
      err.message?.includes("call revert exception")
    ) {
      return new Response(
        JSON.stringify({ error: "Token contract is not a valid ERC20 token" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to fetch token information" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
