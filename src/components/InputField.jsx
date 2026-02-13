import "../styles/components.css";

export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
}) {
  return (
    <div className="field">
      <input
        id={id}
        className={`input ${error ? "input--error" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
      />
      <label className="label" htmlFor={id}>
        {label}
      </label>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
