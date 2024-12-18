import { create } from "zustand";

export interface OptionsInfoDetail {
  instrument?: string,
  optionId: string,
  strikePrice: number,
  markIv: number,
  markPrice: number,
  riskPremiumRateForBuy: number,
  riskPremiumRateForSell: number,
  delta: number,
  gamma: number,
  vega: number,
  theta: number,
  volume: number,
  isOptionAvailable: boolean
}

export interface OptionsInfo {
  [key: string]: OptionsInfoDetail
}

interface OptionsInfoState {
  data: OptionsInfo
  setOptionsInfo: (data: OptionsInfo) => void
}

// For Market

interface OptionType {
  call: OptionsInfoDetail[],
  put: OptionsInfoDetail[]
}

interface Options {
  [key: string]: OptionType
}

interface IMarketItem {
  expiries: number[],
  options: Options
}

export interface IMarket {
  BTC: IMarketItem,
  ETH: IMarketItem
}

export const useOptionsInfoStore = create<OptionsInfoState>((set) => ({
  data: {},
  setOptionsInfo: (newData) => set({ data: newData })
}))