// src/components/dashboard/RecentActivity.jsx
import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    { text: "New batch created", detail: "BATCH-1024 - Moringa Powder", time: "2h ago", color: "bg-green-500" },
    { text: "Sale recorded", detail: "TZS 750,000 - Zanzibar Spa", time: "5h ago", color: "bg-blue-500" },
    { text: "Low stock alert", detail: "Fresh Turmeric below reorder level", time: "1d ago", color: "bg-orange-500" },
    { text: "Batch completed", detail: "BATCH-1023 - Pilau Masala", time: "2d ago", color: "bg-purple-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent Activity
        </h2>
      </div>

      <div className="p-6 space-y-5">
        {activities.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={`h-2 w-2 rounded-full ${item.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.text}</p>
              <p className="text-xs text-gray-600">{item.detail}</p>
            </div>
            <span className="text-xs text-gray-500">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
