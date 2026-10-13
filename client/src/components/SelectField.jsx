// A labelled dropdown, built the same way as TextField (label, error and hint linked by id).
// options: [{ value: 3, label: 'SafeHands Manufacturing (Sri Lanka)' }, ...]
export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  hint,
  required = false,
  placeholder = 'Select…',
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className="field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
      >
        {/* The empty first option means "nothing chosen yet" */}
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}