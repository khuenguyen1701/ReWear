
import { useState } from "react";

export default function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  disabled = false,
  className = "form-field"
}) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customOptions, setCustomOptions] = useState([]);

  const selected = Array.isArray(value)
    ? value
    : value ? [value] : [];

  const allOptions = [
    ...new Set([
      ...options,
      ...customOptions,
      ...selected
    ])
  ];

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustomOption = () => {
    const newValue = customValue.trim();
    if (!newValue) return;

    const existing = allOptions.find(
      (option) =>
        option.toLowerCase() === newValue.toLowerCase()
    );

    const finalValue = existing || newValue;

    if (!existing) {
      setCustomOptions((prev) => [...prev, newValue]);
    }

    if (!selected.includes(finalValue)) {
      onChange([...selected, finalValue]);
    }

    setCustomValue("");
  };

  return (
    <div className={className}>
      <label>{label}</label>

      <div className="multi-select-container">
        <button
          type="button"
          className="multi-select-trigger"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span>
            {selected.length
              ? selected.join(", ")
              : `Choose ${label.toLowerCase()}`}
          </span>
          <span>{open ? "▲" : "▼"}</span>
        </button>

        {open && !disabled && (
          <div className="multi-select-menu">
            {allOptions.map((option) => (
              <label
                className="multi-select-option"
                key={option}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}

            <div className="multi-select-custom">
              <input
                type="text"
                value={customValue}
                onChange={(e) =>
                  setCustomValue(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomOption();
                  }
                }}
                placeholder={`Add custom ${label.toLowerCase()}`}
                maxLength={50}
              />

              <button
                type="button"
                onClick={addCustomOption}
                disabled={!customValue.trim()}
              >
                Add
              </button>
            </div>

            <button
              type="button"
              className="multi-select-done"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
