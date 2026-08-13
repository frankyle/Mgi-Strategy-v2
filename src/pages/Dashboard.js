// src/pages/Dashboard.js
import React from "react";


import { TrendingUp, DollarSign, Package, Beaker } from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickStats from "../components/dashboard/QuickStats";
import { MetricCard } from "../components/dashboard/MetricCard";

const Dashboard = () => {
  return (
      <div className="space-y-8">
        <DashboardHeader />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value="TZS 2,450,000"
            icon={TrendingUp}
            trend={{ value: 12.5, isPositive: true }}
            delay={0.1}
            color="green"
          />

          <MetricCard
            title="Total Expenses"
            value="TZS 1,850,000"
            icon={DollarSign}
            trend={{ value: 5.2, isPositive: false }}
            delay={0.2}
            color="orange"
          />

          <MetricCard
            title="Inventory Items"
            value="156"
            icon={Package}
            trend={{ value: 8.3, isPositive: true }}
            delay={0.3}
            color="blue"
          />

          <MetricCard
            title="Active Batches"
            value="12"
            icon={Beaker}
            delay={0.4}
            color="purple"
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <QuickStats />
        </div>
      </div>
  );
};

export default Dashboard;
