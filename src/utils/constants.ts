export namespace Ticker {
  export enum MainStableAsset {
    USDC = 'USDC'
  }

  export enum UnderlyingAsset {
    BTC = 'BTC',
    ETH = 'ETH'
  }

  export enum OlpAsset {
    WBTC = "WBTC",
    WETH = "WETH",
    USDC = "USDC",
    HONEY = "HONEY"
  }
  
  export enum QuoteAsset { // OlpAsset + Native ETH
    ETH = "ETH",
    WBTC = "WBTC",
    WETH = "WETH",
    USDC = "USDC",
    HONEY = "HONEY"
  }
}

export enum VaultIndex {
  sVault = 0,
  mVault = 1,
  lVault = 2,
}

export enum Strategy {
  NotSupported = 0,
  BuyCall = 1,
  SellCall = 2,
  BuyPut = 3,
  SellPut = 4,
  BuyCallSpread = 5,
  SellCallSpread = 6,
  BuyPutSpread = 7,
  SellPutSpread = 8
}

export const UA_TICKER_TO_DECIMAL: { [key: string]: number } = {
  [Ticker.UnderlyingAsset.BTC]: 8,
  [Ticker.UnderlyingAsset.ETH]: 18,
}
