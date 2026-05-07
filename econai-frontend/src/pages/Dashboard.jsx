import { useEffect, useState } from "react";
import {
  FaPercent,
  FaUsers,
  FaExclamationTriangle
} from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";

import MetricCard from "../components/MetricCard";
import Card from "../components/ChartPanel";
import GDPTrendChart from "../components/charts/GDPTrendChart";
import InflationGDPChart from "../components/charts/InflationGDPChart";
import TradeChart from "../components/charts/TradeChart";
import RiskGauge from "../components/charts/RiskGauge";
import { getLatestReport } from "../services/api";

const fallbackMetrics = {
  gdpForecast: 3.8,
  inflationRate: 2.1,
  unemploymentRate: 4.5,
  riskIndex: 22.0
};

function WelcomeBanner() {
  return (
    <Card
      title="Economic Dashboard"
      subtitle="Real-time macro forecasting and stress monitoring with model-driven financial indicators."
    >
      {/* You can add more content to the banner card if needed */}
    </Card>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(fallbackMetrics);
  const [reportText, setReportText] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getLatestReport();
        const payload = response?.data;

        if (isMounted && payload) {
          setMetrics({
            gdpForecast: Number(payload.gdpForecast ?? fallbackMetrics.gdpForecast),
            inflationRate: Number(payload.inflationRate ?? fallbackMetrics.inflationRate),
            unemploymentRate: Number(payload.unemploymentRate ?? fallbackMetrics.unemploymentRate),
            riskIndex: Number(payload.riskIndex ?? fallbackMetrics.riskIndex)
          });
          setReportText(payload.report || "No insights available at this time.");
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Failed to fetch live report:", err);
        if (isMounted && !reportText) {
            setMetrics(fallbackMetrics);
            setReportText("⚠️ **Live Feed Disconnected.** Showing fallback data.");
        }
      } finally {
        if (isMounted) setTimeout(() => setLoading(false), 700);
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 10000);
    
    return () => { 
        isMounted = false; 
        clearInterval(intervalId);
    };
  }, [reportText]);

  return (
    <main className="space-y-6">
      <WelcomeBanner />

      {/* Top row: 4 metric cards – each col-span-3 in a 12-col grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <MetricCard title="GDP Forecast" value={metrics.gdpForecast} icon={FaArrowTrendUp}
            trend="+0.4% vs prev quarter" trendUp loading={loading} color="cyan" />
        </div>
        <div className="col-span-3">
          <MetricCard title="Inflation Rate" value={metrics.inflationRate} icon={FaPercent}
            trend="-0.2% disinflation" trendUp loading={loading} color="indigo" />
        </div>
        <div className="col-span-3">
          <MetricCard title="Unemployment" value={metrics.unemploymentRate} icon={FaUsers}
            trend="-0.1% labor improvement" trendUp loading={loading} color="emerald" />
        </div>
        <div className="col-span-3">
          <MetricCard title="Risk Index" value={metrics.riskIndex} icon={FaExclamationTriangle}
            trend="+1.7% volatility" trendUp={false} loading={loading} color="rose" />
        </div>
      </div>

      {/* Middle row: GDP Chart (col-span-8) + Risk Gauge (col-span-4) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card title="GDP Trend Analysis">
            <GDPTrendChart loading={loading} />
          </Card>
        </div>
        <div className="col-span-4">
          <Card title="Crisis Risk Index">
            <RiskGauge risk={metrics.riskIndex / 100} loading={loading} />
          </Card>
        </div>
      </div>

      <Card title="🤖 EconAI Pulse Report" subtitle={`Last Sync: ${lastUpdate}`}>
        {loading && !reportText ? (
          <div className="p-4 text-slate-400">Gathering intelligence...</div>
        ) : (
          <div
            className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: reportText
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-amber-400">$1</em>')
            }}
          />
        )}
      </Card>

      {/* Bottom row: Inflation vs GDP (col-span-6) + Trade Balance (col-span-6) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6">
          <Card title="Inflation vs. GDP">
            <InflationGDPChart loading={loading} />
          </Card>
        </div>
        <div className="col-span-6">
          <Card title="Trade Balance Analysis">
            <TradeChart loading={loading} />
          </Card>
        </div>
      </div>
    </main>
  );
}
