export default function FormRow({
  label,
  name,
  select,
  value,
  onChange,
  options,
  className = "", 
  labelColor = "color-secondary-3", 
  borderColor = "border-secondary-color-3",
  bgColor = "bg-accent-4",
}) 
{
  return (
    <div className={`flex flex-col ${className}`}>
      <label
        htmlFor={name}
        className={`font-bold color-secondary-3 mb-2 ${labelColor}`}
      >
        {label}
      </label>

      {select ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`border-2 ${borderColor} rounded-lg p-2 focus:ring-2 focus:border-secondary-color-3 ${bgColor} ${labelColor}`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`border-2 ${borderColor} rounded-lg p-2 focus:ring-2 focus:border-secondary-color-3 ${bgColor} ${labelColor}`}
        />
      )}
    </div>
  );
}