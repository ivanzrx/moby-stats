'use client'
import { useEffect } from 'react'
import { OlpStats, useOlpStatsStore } from '@/store/olpStats'
import { usePriceStore } from '@/store/price'
import { usePortfolioStore } from '@/store/position'
import { IMarket, OptionsInfo, useOptionsInfoStore } from '@/store/optionsInfo'
import { getCurrentUTCDate, getLatestOlpAnalysisData } from '@/utils/helper'
import Pako from 'pako'

export function DataInitializer({ children }: { children: React.ReactNode }) {
  const { setOlpStats } = useOlpStatsStore()
  const { setPriceData } = usePriceStore()
  const { setPortfolioData } = usePortfolioStore()
  const { setOptionsInfo } = useOptionsInfoStore()

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        

        const [marketRes, positionRes, olpAnalysisRes] = await Promise.all([
          fetch("https://moby-data.s3.ap-northeast-2.amazonaws.com/market-data.json"),
          fetch("https://q32okcrsle.execute-api.ap-northeast-2.amazonaws.com/default/moby-arbitrum-one-prod-query?method=getMyPositions&address=0x9e34F79E39AddB64f4874203066fFDdD6Ab63a41"),
          fetch(`https://moby-data.s3.ap-northeast-2.amazonaws.com/olp-analysis/olp-analysis-daily-${getCurrentUTCDate()}.json.gz`)
        ])

        if (!marketRes.ok || !positionRes.ok || !olpAnalysisRes.ok) {
          console.error('Failed to fetch initial data')
        }

        const [marketData, positionData, olpAnalysisDataGzip] = await Promise.all([
          marketRes.json(),
          positionRes.json(),
          olpAnalysisRes.arrayBuffer()
        ])

        const olpAnalysisData = getLatestOlpAnalysisData(olpAnalysisDataGzip);

        const olpStats: OlpStats = {
          assets: olpAnalysisData.assets,
          assetAmounts: marketData.data.olpStats.mOlp.assetAmounts,
          positionValue: olpAnalysisData.positionValue,
          greeks: marketData.data.olpStats.mOlp.greeks
        }

        console.log(olpStats, "olpStats")

        setOlpStats(olpStats);
        setPriceData({
          futures: marketData.data.futuresIndices,
          spot: marketData.data.spotIndices,
          riskFreeRate: marketData.data.riskFreeRates
        });

        setPortfolioData(positionData);

        const optionsInfo = Object.entries(marketData.data.market as IMarket).reduce((output, [ticker, underlyingAssetData]) => {
          underlyingAssetData.expiries.forEach((expiry: number) => {
            const options = underlyingAssetData.options[expiry];
            Object.entries(options).forEach(([optionType, optionList]) => {
              (optionList as []).forEach(({
                instrument,
                optionId,
                strikePrice,
                markIv,
                markPrice,
                riskPremiumRateForBuy,
                riskPremiumRateForSell,
                delta,
                gamma,
                vega,
                theta,
                volume,
                isOptionAvailable
              }) => {
                output[instrument] = {
                  optionId: optionId,
                  strikePrice: strikePrice,
                  markIv: markIv,
                  markPrice: markPrice,
                  riskPremiumRateForBuy: riskPremiumRateForBuy,
                  riskPremiumRateForSell: riskPremiumRateForSell,
                  delta: delta,
                  gamma: gamma,
                  vega: vega,
                  theta: theta,
                  volume: volume,
                  isOptionAvailable: isOptionAvailable
                };
              });
            });
          });
          return output;
        }, {} as OptionsInfo);
        setOptionsInfo(optionsInfo);

        
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      }
    }

    fetchMarket()

    const interval = setInterval(fetchMarket, 60000)

    return () => clearInterval(interval)
  }, [])

  return children
}