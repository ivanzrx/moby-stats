"use client";

import React from "react";
import { AssetAmount, Assets, Greeks, useOlpStatsStore } from "@/store/olpStats";

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-[#C1D182]">{children}</h2>
  </div>
);

const UtilityRatioCard = ({ assets }: { assets: Assets }) => {
  const ratio = ((assets.utilizedUsd / assets.depositedUsd) * 100).toFixed(2);
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
        <div className={`text-7xl font-bold mb-6 ${getRatioColor(ratioNum)}`}>{ratio}%</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70">Utilized USD</div>
            <div className="text-xl font-semibold">${assets.utilizedUsd.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Deposited USD</div>
            <div className="text-xl font-semibold">${assets.depositedUsd.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValueRow = ({ label, value, isSubItem = false }: { label: string, value: number, isSubItem?: boolean }) => (
  <div className={`flex justify-between items-center ${isSubItem ? 'pl-4' : ''}`}>
    <div className={`text-sm ${isSubItem ? 'opacity-70' : 'font-semibold'}`}>{label}</div>
    <div className={`${isSubItem ? 'text-sm' : 'text-lg font-semibold'} ${value >= 0 ? 'text-success' : 'text-error'}`}>
      {value >= 0 ? `$${value.toLocaleString()}` : `-$${Math.abs(value).toLocaleString()}`}
    </div>
  </div>
);

const OLPValueCard = ({ assets, positionValue }: { assets: Assets, positionValue: number }) => {
  const olpDv = assets.depositedUsd;  // OLPDV
  const olpPv = positionValue;  // OLPPV
  const totalValue = olpDv + olpPv;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <CardTitle>OLP Value</CardTitle>
        
        {/* Total Value */}
        <div className="mb-4">
          <ValueRow label="Total Value" value={totalValue} />
        </div>

        {/* OLPDV Section */}
        <div className="space-y-2 mb-4">
          <ValueRow label="OLPDV (Deposited Value)" value={olpDv} />
          <ValueRow label="Pool Value" value={assets.poolUsd} isSubItem />
          <ValueRow label="Reserved Value" value={-assets.reservedUsd} isSubItem />
          <ValueRow label="Pending Value" value={-assets.pendingRpUsd} isSubItem />
          <ValueRow label="Utilized Value" value={assets.utilizedUsd} isSubItem />
        </div>

        {/* OLPPV Section */}
        <div className="space-y-2">
          <ValueRow label="OLPPV (Position Value)" value={olpPv} />
        </div>
      </div>
    </div>
  );
};

const GreeksCard = ({ asset, greeks }: { asset: string; greeks: Greeks }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UtilityRatioCard assets={olpStatsData.assets} />
        <OLPValueCard assets={olpStatsData.assets} positionValue={olpStatsData.positionValue} />
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
