export default function KPICard({ label, data }) {
  const formattedData = (data / 1_000_000).toFixed(2) + "M";

  return (
    <div
      style={{
        border: "2px solid var(--secondary-color-1)",
        borderRadius: "8px",
        padding: "10px 20px",
        textAlign: "center",
        color: "#000",
        boxShadow: "0 0 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "14px", color: "#555" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold" }}>
        {formattedData}
      </div>
    </div>
  );
}
