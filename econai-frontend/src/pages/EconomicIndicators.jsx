import { motion } from "framer-motion";
import CountryComparison from "../components/charts/CountryComparison";

export default function EconomicIndicators() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 p-4 md:p-8"
    >
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Data Matrix</p>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Economic Indicators</h2>
      </header>

      <CountryComparison />
    </motion.main>
  );
}
