// src/components/TabButton.jsx
import React from "react";

export const TabButton = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-2 w-44 h-12 rounded-4xl text-lg font-semibold shadow 
        ${isActive
          ? "bg-primary-2 text-black border border-black-500"
          : "bg-primary-2 text-black border border-black-500 opacity-30"
        }`}
    >
      {label}
    </button>
  );
};

export const TabStatistics = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={` w-30 h-8 rounded-[8px] text-lg font-semibold shadow m-2
        ${isActive
          ? "bg-primary-1 text-white border border-black-500"
          : "bg-primary-1 text-white border border-black-500 opacity-30"
        }`}
    >
      {label}
    </button>
  );
};

