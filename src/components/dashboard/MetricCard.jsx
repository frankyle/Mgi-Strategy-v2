import { motion } from "framer-motion";

export function MetricCard({ title, value, icon: Icon, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-gray-300 shadow-md bg-white 
                 hover:shadow-lg transition-shadow"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className="h-4 w-4 text-gray-500" />
      </div>

      <div className="p-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>

        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
