import React from "react";
import { motion } from "framer-motion";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="mb-4 relative flex overflow-hidden bg-[#151515] rounded-xl border border-zinc-800">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className="relative flex-1 px-3 py-2 text-sm"
        >
          {/* Background */}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#262626] rounded-xl z-0"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}

          {/* Text (always on top) */}
          <span
            className={`relative z-20 transition-colors ${
              activeTab === tab ? "text-white" : "text-gray-300 hover:text-gray-100"
            }`}
          >
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
