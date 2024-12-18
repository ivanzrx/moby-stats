import { create } from "zustand";

export interface Greeks {
  delta: number
  gamma: number 
  vega: number
  theta: number
}

export interface AssetAmount {
  utilizedAmount: number
  availableAmount: number
  depositedAmount: number
}

export interface UtilityRatio {
  utilizedUsd: number
  depositedUsd: number
}

interface OlpStats {
  greeks: {
    BTC: Greeks
    ETH: Greeks
  }
  assetAmounts: {
    wbtc: AssetAmount
    weth: AssetAmount
    usdc: AssetAmount
  }
  utilityRatio: UtilityRatio
}

interface OlpStatsState {
  data: OlpStats
  setOlpStats: (data: OlpStats) => void
}

export const useOlpStatsStore = create<OlpStatsState>((set) => ({
  data: {
    greeks: {
      BTC: {
        delta: 0,
        gamma: 0,
        vega: 0,
        theta: 0
      },
      ETH: {
        delta: 0,
        gamma: 0,
        vega: 0,
        theta: 0
      }
    },
    assetAmounts: {
      wbtc: {
        utilizedAmount: 0,
        availableAmount: 0,
        depositedAmount: 0
      },
      weth: {
        utilizedAmount: 0,
        availableAmount: 0,
        depositedAmount: 0
      },
      usdc: {
        utilizedAmount: 0,
        availableAmount: 0,
        depositedAmount: 0
      }
    },
    utilityRatio: {
      utilizedUsd: 0,
      depositedUsd: 0
    }
  },
  setOlpStats: (newData) => set({ data: newData })
}))