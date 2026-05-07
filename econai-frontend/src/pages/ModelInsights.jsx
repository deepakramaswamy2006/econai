import { motion } from "framer-motion";
import ChartPanel from "../components/ChartPanel";

const modelCards = [
  { label: "Model Type", value: "Gradient Boosted Trees" },
  { label: "GDP MAE", value: "0.42" },
  { label: "Crisis AUC", value: "0.91" },
  { label: "Last Retrain", value: "March 4, 2026" }
];

const topFeatures = [
  "Inflation volatility",
  "Debt-to-GDP",
  "Interest rate regime",
  "Current account balance",
  "Unemployment delta"
];

export default function ModelInsights() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Model Ops</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Model Insights</h2>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modelCards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <ChartPanel
        title="Feature Importance Snapshot"
        subtitle="Primary model drivers for forecast quality and crisis classification confidence."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {topFeatures.map((feature, index) => (
            <div key={feature} className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100">
              <span className="text-cyan-300">#{index + 1}</span> {feature}
            </div>
          ))}
        </div>
      </ChartPanel>
    </motion.main>
  );
}
