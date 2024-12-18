'use client'

import React from 'react';
import { AssetAmount, Greeks, useOlpStatsStore, UtilityRatio } from "@/store/olpStats";
import { usePriceStore } from "@/store/price";

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-[#C1D182]">{children}</h2>
  </div>
);

const UtilityRatioCard = ({ utilityRatio }: { utilityRatio: UtilityRatio }) => {
  const ratio = (utilityRatio.utilizedUsd / utilityRatio.depositedUsd * 100).toFixed(2);
  const ratioNum = parseFloat(ratio);
  
  const getRatioColor = (value: number) => {
    if (value <= 50) return "text-success";
    if (value <= 70) return "text-warning";
    return "text-error";
  };
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <CardTitle>Utility Ratio</CardTitle>
        <div className={`text-5xl font-bold mb-6 ${getRatioColor(ratioNum)}`}>
          {ratio}%
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70">Utilized USD</div>
            <div className="text-xl font-semibold">${utilityRatio.utilizedUsd.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Deposited USD</div>
            <div className="text-xl font-semibold">${utilityRatio.depositedUsd.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GreeksCard = ({ asset, greeks }: { asset: string, greeks: Greeks }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <CardTitle>{asset} Greeks</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm opacity-70">Delta</div>
            <div className="text-lg font-semibold">{greeks.delta.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Gamma</div>
            <div className="text-lg font-semibold">{greeks.gamma.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Vega</div>
            <div className="text-lg font-semibold">{greeks.vega.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Theta</div>
            <div className="text-lg font-semibold">{greeks.theta.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetsTable = ({ assetAmounts }: { assetAmounts: { [key: string]: AssetAmount } }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <CardTitle>Asset Allocations</CardTitle>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="text-right">Deposited</th>
                <th className="text-right">Utilized</th>
                <th className="text-right">Available</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(assetAmounts).map(([asset, amounts]) => (
                <tr key={asset}>
                  <td className="font-medium">{asset.toUpperCase()}</td>
                  <td className="text-right">{amounts.depositedAmount.toFixed(4)}</td>
                  <td className="text-right">{amounts.utilizedAmount.toFixed(4)}</td>
                  <td className="text-right">{amounts.availableAmount.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function OLP() {
  const { data: olpStatsData } = useOlpStatsStore();

  return (
    <div className="p-4 space-y-6">
      {/* Utility Ratio Section */}
      <div className="grid grid-cols-1">
        <UtilityRatioCard utilityRatio={olpStatsData.utilityRatio} />
      </div>

      {/* Greeks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GreeksCard asset="BTC" greeks={olpStatsData.greeks.BTC} />
        <GreeksCard asset="ETH" greeks={olpStatsData.greeks.ETH} />
      </div>

      {/* Assets Table Section */}
      <div className="grid grid-cols-1">
        <AssetsTable assetAmounts={olpStatsData.assetAmounts} />
      </div>
    </div>
  );
}