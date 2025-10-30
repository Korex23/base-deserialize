import { NextResponse } from "next/server";
import { JsonRpcProvider, Contract, isAddress } from "ethers";

const BASE_RPC_URL = process.env.BASE_RPC_URL;

if (!BASE_RPC_URL) {
  throw new Error(
    "❌ No RPC URL found in environment variables (BASE_RPC_URL)"
  );
}

const provider = new JsonRpcProvider(BASE_RPC_URL);

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<bigint | null> {
  try {
    if (!isAddress(walletAddress)) {
      console.error("⚠️ Invalid wallet address:", walletAddress);
      return null;
    }

    if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      return await provider.getBalance(walletAddress);
    }

    if (!isAddress(tokenAddress)) {
      console.error("⚠️ Invalid token address:", tokenAddress);
      return null;
    }

    const code = await provider.getCode(tokenAddress);
    if (code === "0x") {
      console.error("⚠️ Address is not a contract:", tokenAddress);
      return null;
    }

    const token = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await token.balanceOf(walletAddress);
    return balance;
  } catch (error) {
    console.error("❌ Error fetching token balance:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { tokenAddress, walletAddress } = await req.json();

    if (!tokenAddress || !walletAddress) {
      return NextResponse.json(
        { error: "Missing tokenAddress or walletAddress" },
        { status: 400 }
      );
    }

    const balance = await getTokenBalance(tokenAddress, walletAddress);

    if (balance === null) {
      return NextResponse.json(
        { error: "Failed to fetch balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({ balance: balance.toString() });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
