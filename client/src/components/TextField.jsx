// One labelled form field: label + input (or textarea) + error/hint text.
// Linking them with ids lets screen readers read the label and the error
// when the field gets focus.
export default function TextField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required = false,
  multiline = false,
  type = 'text',
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  // Which helper texts describe this input (only the ones that are shown)
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  const inputProps = {
    id: inputId,
    name,
    value,
    onChange,
    required,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
  };

  return (
    <div className="field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {multiline ? <textarea rows={4} {...inputProps} /> : <input type={type} {...inputProps} />}

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