import { NextResponse } from 'next/server'

export async function GET() {
  const mockData = [
    {
      tokenA: 'ETH',
      tokenB: 'USDC',
      priceImpact: 3.75,
      dexRoute: ['Umbra'],
      detailsUrl: '/swap?tokenA=ETH&tokenB=USDC',
      tokenAIcon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
      tokenBIcon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      tokenA: 'tETH',
      tokenB: 'SOL',
      priceImpact: 2.12,
      dexRoute: ['Invariant'],
      detailsUrl: '/swap?tokenA=tETH&tokenB=SOL',
      tokenAIcon: 'https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/06833c4417faafd198ef8cf904612c721e5d96db/deployments/warp_routes/tETH/logo.svg',
      tokenBIcon: 'https://raw.githubusercontent.com/github/explore/14191328e15689ba52d5c10e18b43417bf79b2ef/topics/solana/solana.png'
    },
  ]

  return NextResponse.json(mockData)
}

