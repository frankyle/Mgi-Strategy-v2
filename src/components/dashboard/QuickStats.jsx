// src/components/dashboard/QuickStats.jsx
import React from "react";
import { motion } from "framer-motion";

const QuickStats = () => {
  const stats = [
    { label: "Production Efficiency", value: 88, color: "bg-blue-500" },
    { label: "Raw Material Stock", value: 72, color: "bg-green-500" },
    { label: "Finished Goods Readiness", value: 65, color: "bg-purple-500" },
    { label: "On-Time Delivery Rate", value: 94, color: "bg-emerald-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Quick Stats</h2>
      </div>

      <div className="p-6 space-y-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              <span className="text-sm font-semibold text-gray-900">{stat.value}%</span>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                className={`h-full ${stat.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickStats;
