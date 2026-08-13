// src/components/dashboard/DashboardHeader.jsx
import React from "react";
import { motion } from "framer-motion";

const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="text-gray-600">
        Welcome back to MGI Flavour Crafters Management System
      </p>
    </motion.div>
  );
};

export default DashboardHeader;
