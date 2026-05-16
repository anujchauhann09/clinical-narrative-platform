export const Input = ({ error, id, label, ...props }) => (
  <label className="field" htmlFor={id}>
    <span className="field__label">{label}</span>
    <input aria-invalid={Boolean(error)} className="field__input" id={id} {...props} />
    {error ? <span className="field__error">{error}</span> : null}
  </label>
);
