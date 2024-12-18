import { create } from "zustand";

interface Price {
  futures: {
    BTC: number,
    btc: number,
    ETH: number,
    eth: number
  },
  spot: {
    BTC: number,
    btc: number,
    ETH: number,
    eth: number,
    USDC: number,
    usdc: number
  },
  riskFreeRate: {
    BTC: { [key: string]: number },
    btc: { [key: string]: number },
    ETH: { [key: string]: number },
    eth: { [key: string]: number }
  }
}

interface PriceState {
  data: Price
  setPriceData: (data: Price) => void
}

export const usePriceStore = create<PriceState>((set) => ({
  data: {
    futures: {
      BTC: 0,
      btc: 0,
      ETH: 0,
      eth: 0
    },
    spot: {
      BTC: 0,
      btc: 0,
      ETH: 0,
      eth: 0,
      USDC: 0,
      usdc: 0
    },
    riskFreeRate: {
      BTC: {},
      btc: {},
      ETH: {},
      eth: {}
    }
  },
  setPriceData: (newData) => set({ data: newData })
}))