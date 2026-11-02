
import { useState } from "react";

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  disabled = false
}) {
  const [customOptions, setCustomOptions] = useState([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const allOptions = [
  ...new Set([
    ...options,
    ...customOptions,
    ...(value && value !== "__custom__" ? [value] : [])
  ])
];

  const handleAdd = () => {
    const newValue = customValue.trim();

    if (!newValue) return;

    const existing = allOptions.find(
      (option) => option.toLowerCase() === newValue.toLowerCase()
    );

    const finalValue = existing || newValue;

    if (!existing) {
      setCustomOptions((previous) => [...previous, newValue]);
    }

    onChange(finalValue);
    setCustomValue("");
    setAddingCustom(false);
  };

  return (
    <div className="edit-modal-field">
      <label>{label}</label>

      <select
        required
        value={addingCustom ? "__custom__" : value}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setAddingCustom(true);
          } else {
            setAddingCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Choose {label.toLowerCase()}</option>

        {allOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

        <option value="__custom__">
          + Add custom {label.toLowerCase()}
        </option>
      </select>

      {addingCustom && (
        <div className="custom-option-input">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Enter custom ${label.toLowerCase()}`}
            maxLength={50}
            disabled={disabled}
          />

          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !customValue.trim()}
          >
            Add
          </button>

          <button
            type="button"
            onClick={() => {
              setAddingCustom(false);
              setCustomValue("");
            }}
            disabled={disabled}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
