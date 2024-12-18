import { create } from "zustand";

export interface Assets {
  poolUsd: number
  pendingMpUsd: number
  pendingRpUsd: number
  reservedUsd: number
  utilizedUsd: number
  availableUsd: number
  depositedUsd: number
}

export interface AssetAmount {
  utilizedAmount: number
  availableAmount: number
  depositedAmount: number
}

export interface Greeks {
  delta: number
  gamma: number 
  vega: number
  theta: number
}

export interface OlpStats {
  assets: Assets,
  assetAmounts: {
    wbtc: AssetAmount
    weth: AssetAmount
    usdc: AssetAmount
  },
  positionValue: number,
  greeks: {
    BTC: Greeks
    ETH: Greeks
  }
}

interface OlpStatsState {
  data: OlpStats
  setOlpStats: (data: OlpStats) => void
}

export const useOlpStatsStore = create<OlpStatsState>((set) => ({
  data: {
    assets: {
      poolUsd: 0,
      pendingMpUsd: 0,
      pendingRpUsd: 0,
      reservedUsd: 0,
      utilizedUsd: 0,
      availableUsd: 0,
      depositedUsd: 0
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
    positionValue: 0,
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
  },
  setOlpStats: (newData) => set({ data: newData })
}))