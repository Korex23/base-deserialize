export const runtime = "edge"; // ⚡ Fast, low-memory Edge runtime

const RPC_URL = process.env.BASE_RPC_URL;

if (!RPC_URL) {
  throw new Error("❌ Missing BASE_RPC_URL");
}

const ERC20_ABI = {
  balanceOf: "0x70a08231",
};

const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

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

async function ethCall(to: string, data: string) {
  return await rpc("eth_call", [{ to, data }, "latest"]);
}

function hexToUint(hex: string) {
  return BigInt(hex || "0x0").toString();
}

export async function POST(req: Request) {
  try {
    const { tokenAddress, walletAddress } = await req.json();

    if (!isHexAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: "Invalid wallet address" }), {
        status: 400,
      });
    }

    if (!tokenAddress) {
      return new Response(JSON.stringify({ error: "Missing token address" }), {
        status: 400,
      });
    }

    const isNative = tokenAddress.toLowerCase() === NATIVE_TOKEN.toLowerCase();

    if (isNative) {
      const balanceHex = await rpc("eth_getBalance", [walletAddress, "latest"]);

      return new Response(JSON.stringify({ balance: hexToUint(balanceHex) }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isHexAddress(tokenAddress)) {
      return new Response(JSON.stringify({ error: "Invalid token address" }), {
        status: 400,
      });
    }

    const code = await rpc("eth_getCode", [tokenAddress, "latest"]);
    if (code === "0x") {
      return new Response(
        JSON.stringify({ error: "Token contract does not exist" }),
        { status: 404 }
      );
    }

    const paddedWallet = walletAddress
      .toLowerCase()
      .replace("0x", "")
      .padStart(64, "0");

    const balanceData = ERC20_ABI.balanceOf + paddedWallet;

    const balanceHex = await ethCall(tokenAddress, balanceData);

    const result = {
      balance: hexToUint(balanceHex),
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ /api/balance error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch token balance" }),
      { status: 500 }
    );
  }
}
