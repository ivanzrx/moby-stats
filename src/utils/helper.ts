import { ExpiryGroup } from "@/store/position";
import { Strategy, Ticker, UA_TICKER_TO_DECIMAL, VaultIndex } from "./constants";
import { OptionsInfo, OptionsInfoDetail } from "@/store/optionsInfo";
import Pako from "pako";

export interface ProcessedPosition {
  mainOptionName: string,
  pairedOptionStrikePrice: number,
  isBuy: boolean,
  parsedSize: number,
  greeks: {
    delta: number,
    gamma: number,
    vega: number,
    theta: number
  },
  pnl: number, // in USD
  roi: number // in percentage
}

interface TransformedData {
  [key: string]: ProcessedPosition[]; // 인덱스 시그니처 추가
}

const initialOptionDetail: OptionsInfoDetail = {         
  instrument: "", 
  optionId: "",
  strikePrice: 0,
  markIv: 0,
  markPrice: 0,
  riskPremiumRateForBuy: 0,
  riskPremiumRateForSell: 0,
  delta: 0,
  gamma: 0,
  vega: 0,
  theta: 0,
  volume: 0,
  isOptionAvailable: false
}

const getGreeks = (isCombo: boolean, mainOptionInfo: OptionsInfoDetail, pairedOptionInfo: OptionsInfoDetail, parsedSize: number, isBuy: boolean) => {
  if (
    (isCombo && (!mainOptionInfo || !pairedOptionInfo)) ||
    (!isCombo && !mainOptionInfo)
  ) {
    return {
      delta: 0,
      gamma: 0,
      vega: 0,
      theta: 0
    }
  }

  return isCombo
    ? {
        delta: (mainOptionInfo.delta - pairedOptionInfo.delta) * parsedSize * (isBuy ? 1 : -1),
        gamma: (mainOptionInfo.gamma - pairedOptionInfo.gamma) * parsedSize * (isBuy ? 1 : -1),
        vega: (mainOptionInfo.vega - pairedOptionInfo.vega) * parsedSize * (isBuy ? 1 : -1),
        theta: (mainOptionInfo.theta - pairedOptionInfo.theta) * parsedSize * (isBuy ? 1 : -1)
      }
    : {
        delta: mainOptionInfo.delta * parsedSize * (isBuy ? 1 : -1),
        gamma: mainOptionInfo.gamma * parsedSize * (isBuy ? 1 : -1),
        vega: mainOptionInfo.vega * parsedSize * (isBuy ? 1 : -1),
        theta: mainOptionInfo.theta * parsedSize * (isBuy ? 1 : -1)
      }
}

export function transformAndSortPositionData(underlyingAsset: Ticker.UnderlyingAsset, data: ExpiryGroup[], optionsInfo: OptionsInfo) {
  const transformedData = data.reduce<TransformedData>((acc, item) => {
    if (
      item.settlePrice !== "0" ||
      Number(item.expiry) < Math.floor(Date.now() / 1000)
    ) {
      return acc;
    }

    const sortedPositions = item.positions.sort((a, b) => {
      return Number(a.mainOptionStrikePrice) - Number(b.mainOptionStrikePrice);
    });

    const processedPositions = sortedPositions
      .filter(position => !position.isSettled)
      .map(position => {
        const isCombo = Number(position.length) > 1;
        const mainOptionName = getMainOptionName(BigInt(position.optionTokenId), position.optionNames);
        const pairedOptionName = getPairedOptionName(BigInt(position.optionTokenId), position.optionNames);
        const pairedOptionStrikePrice = getStrikePriceByInstrument(pairedOptionName);

        const isBuy = position.isBuy;
        
        const mainOptionInfo = optionsInfo[mainOptionName] || initialOptionDetail;
        const pairedOptionInfo = optionsInfo[pairedOptionName] || initialOptionDetail;
        const parsedSize = Number(position.size) / (10 ** UA_TICKER_TO_DECIMAL[underlyingAsset]);
        const greeks = getGreeks(isCombo, mainOptionInfo, pairedOptionInfo, parsedSize, position.isBuy);

        const parsedMarkPrice = isCombo
          ? Math.max((mainOptionInfo.markPrice - pairedOptionInfo.markPrice) || Number(position.markPrice), 0)
          : Math.max(mainOptionInfo.markPrice || Number(position.markPrice), 0);
        const parsedExecutionPrice = Number(position.executionPrice) / (10 ** 30);
        const closePayoff = isBuy
          ? parsedMarkPrice - parsedExecutionPrice
          : parsedExecutionPrice - parsedMarkPrice;
        const pnl = closePayoff * parsedSize;
        const roi = closePayoff / parsedExecutionPrice * 100;

        return {
          mainOptionName,
          pairedOptionStrikePrice,
          isBuy,
          parsedSize,
          greeks,
          pnl,
          roi
        };
      });

    acc[item.expiry] = processedPositions;
    return acc;
  }, {});

  const sortedKeys = Object.keys(transformedData).sort((a, b) => Number(a) - Number(b));
  
  const finalResult = sortedKeys.reduce<TransformedData>((acc, key) => {
    acc[key] = transformedData[key];
    return acc;
  }, {});

  return finalResult;
}

export function parseOptionTokenId(optionTokenId: bigint): {
  underlyingAssetIndex: number,
  expiry: number,
  strategy: Strategy,
  length: number,
  isBuys: boolean[],
  strikePrices: number[],
  isCalls: boolean[],
  vaultIndex: VaultIndex
} {
  const underlyingAssetIndex = Number((optionTokenId >> BigInt(240)) & BigInt(0xFFFF));
  const expiry = Number((optionTokenId >> BigInt(200)) & BigInt(0xFFFFFFFFFF));
  const strategy = Number((optionTokenId >> BigInt(196)) & BigInt(0xF));
  if (strategy === Strategy.NotSupported) throw new Error("Invalid strategy");
  
  const length = Number((optionTokenId >> BigInt(194)) & BigInt(0x3)) + 1; // Adjusted for 2 bits length

  let isBuys = [];
  let strikePrices = [];
  let isCalls = [];

  for (let i = 0; i < 4; i++) {
      isBuys.push(Boolean((optionTokenId >> BigInt(193 - 48 * i)) & BigInt(0x1)));
      strikePrices.push(Number((optionTokenId >> BigInt(147 - 48 * i)) & BigInt(0x3FFFFFFFFFF)));
      isCalls.push(Boolean((optionTokenId >> BigInt(146 - 48 * i)) & BigInt(0x1)));
  }

  const vaultIndex = Number(optionTokenId & BigInt(0x3)); // Adjusted for 2 bits vault index

  return { underlyingAssetIndex, expiry, strategy, length, isBuys, strikePrices, isCalls, vaultIndex };
}

export function isCallSpread(strategy: Strategy) {
  return strategy === Strategy.BuyCallSpread || strategy === Strategy.SellCallSpread;
}

export function isPutSpread(strategy: Strategy) {
  return strategy === Strategy.BuyPutSpread || strategy === Strategy.SellPutSpread;
}

export function getStrategy(optionTokenId: bigint): Strategy {
  const { strategy } = parseOptionTokenId(optionTokenId);
  return strategy;
}

export function getMainOptionName(optionTokenId: bigint, optionNames: string): string {
  const strategy = getStrategy(optionTokenId);
  const optionNameArr = optionNames.split(",");

  if (isPutSpread(strategy)) return optionNameArr[1];

  return optionNameArr[0];
}

export function getPairedOptionName(optionTokenId: bigint, optionNames: string): string {
  const strategy = getStrategy(optionTokenId);
  const optionNameArr = optionNames.split(",");

  if (isPutSpread(strategy)) return optionNameArr[0];

  if (isCallSpread(strategy)) return optionNameArr[1];

  return "";
}

export function getStrikePriceByInstrument(instrument: string): number {
  const instrumentArr = instrument.split("-");
  return Number(instrumentArr[2]);
}

export const getCurrentUTCDate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function getLatestOlpAnalysisData(olpAnalysisDataGzip: ArrayBuffer) {
  const olpAnalysisData = JSON.parse(
    new TextDecoder().decode(
      Pako.inflate(new Uint8Array(olpAnalysisDataGzip))
    )
  );

  const latestTimestamp = Object.keys(olpAnalysisData).reduce((latest, current) => 
    Number(current) > Number(latest) ? current : latest
  );

  return olpAnalysisData[latestTimestamp].mOlp;
}