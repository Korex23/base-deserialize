export const runtime = "edge"; // ⚡ Ultra-low memory, no cold starts

const RPC_URL = process.env.BASE_RPC_URL;
const ERC20_ABI = {
  balanceOf: "0x70a08231",
  decimals: "0x313ce567",
  symbol: "0x95d89b41",
};

function isHexAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

async function rpc(method: string, params: any[]) {
  const res = await fetch(RPC_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method,
      params,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// Helper for eth_call
async function ethCall(to: string, data: string) {
  return await rpc("eth_call", [{ to, data }, "latest"]);
}

// Decode hex → uint
function hexToUint(hex: string) {
  return BigInt(hex || "0x0").toString();
}

// Decode hex string
function hexToString(hex: string) {
  if (!hex || hex === "0x") return "";
  const bytes = hex.replace(/^0x/, "");
  const str = Buffer.from(bytes, "hex").toString("utf8").replace(/\0+$/, "");
  return str;
}

export async function POST(req: Request) {
  try {
    const { tokenAddress, walletAddress } = await req.json();

    if (!isHexAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: "Invalid wallet" }), {
        status: 400,
      });
    }

    if (!isHexAddress(tokenAddress)) {
      return new Response(JSON.stringify({ error: "Invalid token address" }), {
        status: 400,
      });
    }

    // Check contract existence
    const code = await rpc("eth_getCode", [tokenAddress, "latest"]);
    if (code === "0x") {
      return new Response(
        JSON.stringify({ error: "Token contract does not exist" }),
        {
          status: 404,
        }
      );
    }

    // Prepare call data
    const walletPadded = walletAddress
      .toLowerCase()
      .replace("0x", "")
      .padStart(64, "0");

    const balanceData = ERC20_ABI.balanceOf + walletPadded;
    const decimalsData = ERC20_ABI.decimals;
    const symbolData = ERC20_ABI.symbol;

    // Parallel calls
    const [balanceHex, symbolHex, decimalsHex] = await Promise.all([
      ethCall(tokenAddress, balanceData),
      ethCall(tokenAddress, symbolData),
      ethCall(tokenAddress, decimalsData),
    ]);

    const result = {
      balance: hexToUint(balanceHex),
      symbol: hexToString(symbolHex),
      decimals: Number(hexToUint(decimalsHex)),
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ /api/token-info error:", err);

    return new Response(
      JSON.stringify({ error: "Failed to fetch token information" }),
      { status: 500 }
    );
  }
}
