import { create } from "zustand";

interface Position {
  underlyingAssetIndex: string;  // contract address 형태
  optionTokenId: string;  // big number string
  length: string;  // string number
  isBuys: string;  // comma separated boolean string
  strikePrices: string;  // comma separated number string
  isCalls: string;  // comma separated boolean string
  optionNames: string;  // comma separated string
  mainOptionStrikePrice: number;
  pairedOptionStrikePrice: number;
  markIv: number;
  markPrice: number;
  
  // Size related fields
  size: string;  // string number
  sizeOpened: string;
  sizeClosing: string;
  sizeClosed: string;
  sizeSettled: string;
  
  // Position direction
  isBuy: boolean;
  executionPrice: string;  // big number string
  
  // Opened position details
  openedToken: string;  // contract address
  openedAmount: string;  // string number
  openedCollateralToken: string;
  openedCollateralAmount: string;  // string number
  openedAvgExecutionPrice: string;  // big number string
  openedAvgSpotPrice: string;  // big number string
  
  // Closed position details
  closedToken: string;
  closedAmount: string;  // string number
  closedCollateralToken: string;
  closedCollateralAmount: string;  // string number
  closedAvgExecutionPrice: string;  // string number
  closedAvgSpotPrice: string;  // string number
  
  // Settled position details
  settledToken: string;
  settledAmount: string;  // string number
  settledCollateralToken: string;
  settledCollateralAmount: string;  // string number
  settledPrice: string;  // string number
  
  // Status flags
  isSettled: boolean;
  lastProcessBlockTime: string;  // string timestamp
}

export interface ExpiryGroup {
  expiry: string,
  positions: Position[],
  settlePrice: string,
}

interface AssetGroups {
  BTC: ExpiryGroup[],
  ETH: ExpiryGroup[]
}

interface PortfolioState { 
  data: AssetGroups
  setPortfolioData: (data: AssetGroups) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  data: {
    BTC: [],
    ETH: []
  },
  setPortfolioData: (newData) => set({ data: newData })
}))