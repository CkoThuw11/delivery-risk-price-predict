import React from "react";
import { PacmanLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <PacmanLoader size={40} color="#79AC78" />;
    </div>
  );
};

export default Loading;
