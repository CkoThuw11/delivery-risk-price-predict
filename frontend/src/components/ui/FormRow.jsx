function FormRow({
  label,
  name,
  value,
  onChange,
  select = false,
  options = [],
}) {
  return (
    <div className="flex items-center justify-between text-black">
      <label htmlFor={name} className="text-ml font-medium w-[35%]">
        {label}
      </label>

      {select ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-[55%] border border-gray-400 rounded-sm p-[2px]"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type="text"
          className="w-[55%] border border-gray-400 rounded-sm p-[2px]"
        />
      )}
    </div>
  );
}

export default FormRow;
