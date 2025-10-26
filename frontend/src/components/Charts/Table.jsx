import React from "react";

export default function Table({chartData}) {

  // 🧮 Tính tổng
  const total = chartData.data.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md w-full border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-accent-1 text-gray-800 font-semibold border-b">
          <tr>
            <th className="text-left p-2">Category Name</th>
            <th className="text-right p-2">Sum of Sales</th>
          </tr>
        </thead>
        <tbody>
          {chartData.data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-neutral-1" : ""}>
              <td className="p-2">{row.product}</td>
              <td className="p-2 text-right">
                {row.sales.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
          <tr className="font-bold border-t">
            <td className="p-2 text-blue-700">Total</td>
            <td className="p-2 text-right text-blue-700">
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
