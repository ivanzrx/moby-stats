"use client"

import { useOptionsInfoStore } from "@/store/optionsInfo";
import { usePortfolioStore } from "@/store/position";
import { Ticker } from "@/utils/constants";
import { ProcessedPosition, transformAndSortPositionData } from "@/utils/helper";
import { useEffect, useState } from "react";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
const sumGreeks = (positions: ProcessedPosition[]) => {
  return positions.reduce((acc, pos) => ({
    delta: acc.delta + pos.greeks.delta,
    gamma: acc.gamma + pos.greeks.gamma,
    vega: acc.vega + pos.greeks.vega,
    theta: acc.theta + pos.greeks.theta,
  }), { delta: 0, gamma: 0, vega: 0, theta: 0 });
};

const calculateTotalPnL = (positions: ProcessedPosition[]) => {
  return positions.reduce((total, pos) => total + pos.pnl, 0);
};

const getTotalPositionsCount = (positionsMap: {[key: string]: ProcessedPosition[]}) => {
  return Object.values(positionsMap).reduce((count, positions) => count + positions.length, 0);
};

const GreeksCard = ({ greeks }: { greeks: { delta: number; gamma: number; vega: number; theta: number; } }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="text-2xl font-bold text-[#C1D182] mb-6">Total Greeks</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm opacity-70">Delta</div>
            <div className="text-lg font-semibold">{greeks.delta.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Gamma</div>
            <div className="text-lg font-semibold">{greeks.gamma.toFixed(8)}</div>
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

const SummaryCard = ({ totalPnL, totalPositions }: { totalPnL: number; totalPositions: number }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="text-2xl font-bold text-[#C1D182] mb-6">Portfolio Summary</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70">Total PnL</div>
            <div className={totalPnL >= 0 ? "text-success text-xl font-semibold" : "text-error text-xl font-semibold"}>
              {totalPnL >= 0 ? `$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
            </div>
          </div>
          <div>
            <div className="text-sm opacity-70">Total Positions</div>
            <div className="text-xl font-semibold">{totalPositions}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PositionsTable = ({ positions }: { positions: {[key: string]: ProcessedPosition[]} }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="text-2xl font-bold text-[#C1D182] mb-6">Positions</div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Option Name</th>
                <th>Paired Strike</th>
                <th>Size</th>
                <th>PnL</th>
                <th>Delta</th>
                <th>Gamma</th>
                <th>Vega</th>
                <th>Theta</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(positions).map(([expiry, positionsList]) => {
                const expiryGreeks = sumGreeks(positionsList);
                const expiryPnL = calculateTotalPnL(positionsList);
                const formattedDate = formatDate(Number(expiry));
                
                return [
                  // 만기일 구분 행
                  <tr key={expiry} className="bg-base-300 font-semibold">
                    <td className="font-bold">{formattedDate}</td>
                    <td></td>
                    <td></td>
                    <td className={expiryPnL >= 0 ? "text-success" : "text-error"}>
                      {expiryPnL >= 0 ? `$${expiryPnL.toFixed(2)}` : `-$${Math.abs(expiryPnL).toFixed(2)}`}
                    </td>
                    <td>{expiryGreeks.delta.toFixed(4)}</td>
                    <td>{expiryGreeks.gamma.toFixed(8)}</td>
                    <td>{expiryGreeks.vega.toFixed(4)}</td>
                    <td>{expiryGreeks.theta.toFixed(4)}</td>
                  </tr>,
                  // 개별 포지션 행들
                  ...positionsList.map((position, index) => (
                    <tr key={`${expiry}-${index}`} className="opacity-70">
                      <td>{position.mainOptionName}</td>
                      <td>{position.pairedOptionStrikePrice || ''}</td>
                      <td className={position.isBuy ? "text-success" : "text-error"}>
                        {position.isBuy ? position.parsedSize.toFixed(8) : `-${position.parsedSize.toFixed(8)}`}
                      </td>
                      <td className={position.pnl >= 0 ? "text-success" : "text-error"}>
                        {position.pnl >= 0 ? `$${position.pnl.toFixed(2)}` : `-$${Math.abs(position.pnl).toFixed(2)}`}
                      </td>
                      <td>{position.greeks.delta.toFixed(4)}</td>
                      <td>{position.greeks.gamma.toFixed(8)}</td>
                      <td>{position.greeks.vega.toFixed(4)}</td>
                      <td>{position.greeks.theta.toFixed(4)}</td>
                    </tr>
                  ))
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function BTC() {
  const { data: portfolioData } = usePortfolioStore();
  const { data: optionsInfo } = useOptionsInfoStore();
  const [positions, setPositions] = useState<{[key: string]: ProcessedPosition[]}>({});

  useEffect(() => {
    if (!portfolioData?.[Ticker.UnderlyingAsset.BTC] || !optionsInfo) return;
    
    const processedPositions = transformAndSortPositionData(
      Ticker.UnderlyingAsset.BTC, 
      portfolioData[Ticker.UnderlyingAsset.BTC], 
      optionsInfo
    );
    setPositions(processedPositions);
  }, [portfolioData?.[Ticker.UnderlyingAsset.BTC], optionsInfo]);

  // 전체 Greeks 계산
  const totalGreeks = Object.values(positions).reduce((acc, positionsList) => {
    const greeks = sumGreeks(positionsList);
    return {
      delta: acc.delta + greeks.delta,
      gamma: acc.gamma + greeks.gamma,
      vega: acc.vega + greeks.vega,
      theta: acc.theta + greeks.theta,
    };
  }, { delta: 0, gamma: 0, vega: 0, theta: 0 });

  // 전체 PnL과 포지션 수 계산
  const totalPnL = Object.values(positions).reduce((total, positionsList) => 
    total + calculateTotalPnL(positionsList), 0
  );
  const totalPositionsCount = getTotalPositionsCount(positions);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard totalPnL={totalPnL} totalPositions={totalPositionsCount} />
        <GreeksCard greeks={totalGreeks} />
      </div>
      <div className="grid grid-cols-1">
        <PositionsTable positions={positions} />
      </div>
    </div>
  );
}