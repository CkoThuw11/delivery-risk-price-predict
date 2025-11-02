const ChartMenu = ({
  title,
  items,
  onButtonClick,
  activeChart,
  onDropdownClick,
}) => (
  <div className="mb-2">
    <div className="bg-primary-1 text-white text-center font-semibold py-1 border-b border-black">
      {title}
    </div>

    <div className="flex flex-col gap-4 p-3 items-center justify-center mt-2">
      {items.map((item) => (
        <div key={item.name} className="group relative w-full">
          {/* Main Button (Không liên quan dropdown) */}
          <button
            className={` text-white rounded-md py-2 px-3 w-full flex items-center justify-center shadow transition h-14
            ${
              activeChart?.name === item.name
                ? "bg-primary-1"
                : "bg-secondary-1 hover:bg-[#40613f] "
            }`}
            onClick={() => onButtonClick(item)}
          >
            <span className="mx-auto">{item.name}</span>
          </button>

          {/* Icon + Dropdown group */}
          {item.icon && item.dropdown && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 group cursor-pointer z-100">
              <item.icon
                className="w-5 h-5 transition-transform duration-200 
                group-hover:rotate-180 group-hover:scale-150"
              />

              {/* Dropdown: only on hover icon */}
              <div className="absolute right-0 top-full mt-1 w-44 bg-white shadow-lg border border-gray-200 rounded-md z-30 hidden group-hover:block">
                {item.dropdown.map((market, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation(); // ⚠️ ngăn lan sự kiện click
                      onDropdownClick(item, market);
                    }}
                    className="text-left px-3 py-2 w-full hover:bg-gray-100 text-gray-800 "
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default ChartMenu;
