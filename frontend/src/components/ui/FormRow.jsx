function FormRow({ label, select = false }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium w-[35%]">{label}</label>
      {select ? (
        <select className="w-[55%] border border-gray-400 rounded-sm p-[2px]">
          <option></option>
        </select>
      ) : (
        <input
          type="text"
          className="w-[55%] border border-gray-400 rounded-sm p-[2px]"
        />
      )}
    </div>
  );
}

export default FormRow;