import { JsonRpcProvider, Contract, isAddress } from "ethers";

const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL;
if (!BASE_RPC_URL) {
  throw new Error(
    "❌ No RPC URL found in environment variables (NEXT_PUBLIC_BASE_RPC_URL)"
  );
}

const provider = new JsonRpcProvider(BASE_RPC_URL);

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
];

const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export interface TokenBalanceResult {
  tokenAddress: string;
  balance: bigint;
  symbol?: string;
  decimals?: number;
}

/**
 * Fetches a wallet’s balance for either a native token or an ERC20 token.
 * @param tokenAddress The token’s contract address (or NATIVE_TOKEN_ADDRESS for native tokens)
 * @param walletAddress The wallet to query
 * @returns {TokenBalanceResult | null} Structured balance info or null if failed
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<TokenBalanceResult | null> {
  try {
    // Validate wallet address
    if (!isAddress(walletAddress)) {
      console.error("⚠️ Invalid wallet address:", walletAddress);
      return null;
    }

    // Handle native token (e.g., ETH or BASE)
    if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      const balance = await provider.getBalance(walletAddress);
      return {
        tokenAddress: NATIVE_TOKEN_ADDRESS,
        balance,
        symbol: "ETH",
        decimals: 18,
      };
    }

    // Validate token address
    if (!isAddress(tokenAddress)) {
      console.error("⚠️ Invalid token address:", tokenAddress);
      return null;
    }

    // Verify it's a contract
    const code = await provider.getCode(tokenAddress);
    if (code === "0x") {
      console.error("⚠️ Address is not a contract:", tokenAddress);
      return null;
    }

    const token = new Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, symbol, decimalsRaw] = await Promise.all([
      token.balanceOf(walletAddress),
      token.symbol().catch(() => undefined),
      token.decimals().catch(() => undefined),
    ]);

    const decimals = decimalsRaw ? Number(decimalsRaw) : undefined;

    return {
      tokenAddress,
      balance,
      symbol,
      decimals,
    };
  } catch (error) {
    console.error("❌ Error fetching token balance:", error);
    return null;
  }
}
