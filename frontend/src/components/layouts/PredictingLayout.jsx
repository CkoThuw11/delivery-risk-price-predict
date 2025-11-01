import React from "react";
import { Outlet } from "react-router-dom";

const PredictingLayout = () => {
  return (
    <>
      {/* Title */}
      <h3 className="bg-secondary-1 text-white text-center p-[10.5px] font-semibold text-[18px] mt-2">
        Delivery Delay Predictor
      </h3>{" "}
      <Outlet />
    </>
  );
};

export default PredictingLayout;
