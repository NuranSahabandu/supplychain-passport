import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import TextField from '../../components/TextField.jsx';
import SelectField from '../../components/SelectField.jsx';

// The ordered journey of a product: add, edit, remove and reorder its stages.
// Every stage endpoint answers with the full, freshly ordered stage list, so after
// each change we simply put that list into the product (no extra request needed).
export default function SupplyChainTab({ product, onProductChange }) {
  const { data: suppliers, loading, error, reload } = useFetch('/suppliers');

  const [editing, setEditing] = useState(null); // null | 'new' | the stage being edited
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false); // true while a move/remove request is running

  const stages = product.stages;

  function clearAlerts() {
    setSuccessMessage(null);
    setActionError(null);
  }

  function showStages(newStages, message) {
    onProductChange({ ...product, stages: newStages });
    setSuccessMessage(message);
  }

  function openForm(target) {
    clearAlerts();
    setEditing(target);
  }

  function handleSaved(newStages, wasEditing) {
    setEditing(null);
    showStages(newStages, wasEditing ? 'Stage updated.' : 'Stage added at the end of the journey.');
  }

  // Swap a stage with its neighbour, then send the whole new order to the server
  async function moveStage(index, direction) {
    const newIndex = index + direction; // direction is -1 (up) or +1 (down)
    const ids = stages.map((stage) => stage.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];

    clearAlerts();
    setBusy(true);
    try {
      const newStages = await api.put(`/products/${product.id}/stages/order`, { stage_ids: ids });
      showStages(newStages, 'Order updated.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeStage(stage) {
    clearAlerts();
    if (!window.confirm(`Remove the stage "${stage.stage_name}"?`)) return;

    setBusy(true);
    try {
      const newStages = await api.delete(`/stages/${stage.id}`);
      if (editing?.id === stage.id) setEditing(null);
      showStages(newStages, `“${stage.stage_name}” was removed.`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Loading suppliers…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  // Stages need a supplier, so explain what to do first if there are none
  if (suppliers.length === 0) {
    return (
      <EmptyState
        title="Add a supplier first"
        message="Every supply-chain stage is carried out by a supplier."
        action={
          <Link to="/admin/suppliers" className="btn btn-primary">
            Go to suppliers
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Supply chain</h2>
        <button type="button" className="btn btn-primary" onClick={() => openForm('new')}>
          Add stage
        </button>
      </div>

      <p className="muted">
        Changes here are saved as a draft. The public passport only changes when you republish it.
      </p>

      {successMessage && (
        <p className="alert alert-success" role="status">
          <strong>Done:</strong> {successMessage}
        </p>
      )}
      {actionError && (
        <p className="alert alert-error" role="alert">
          <strong>Not saved:</strong> {actionError}
        </p>
      )}

      {editing && (
        <StageForm
          key={editing === 'new' ? 'new' : editing.id}
          productId={product.id}
          stage={editing === 'new' ? null : editing}
          suppliers={suppliers}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {stages.length === 0 ? (
        <EmptyState
          title="No stages yet"
          message="Add the steps of this product's journey in order, from raw material to distribution."
        />
      ) : (
        <ol className="timeline" role="list">
          {stages.map((stage, index) => (
            <li key={stage.id} className="timeline-item">
              <span className="timeline-number" aria-hidden="true">
                {stage.stage_order}
              </span>

              <div className="timeline-content">
                <h3>{stage.stage_name}</h3>
                <p className="muted">
                  {stage.supplier_name} · {stage.location ? `${stage.location}, ` : ''}
                  {stage.country}
                </p>
              </div>

              <div className="table-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => moveStage(index, -1)}
                  disabled={busy || index === 0}
                  aria-label={`Move ${stage.stage_name} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => moveStage(index, +1)}
                  disabled={busy || index === stages.length - 1}
                  aria-label={`Move ${stage.stage_name} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => openForm(stage)}
                  aria-label={`Edit ${stage.stage_name}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => removeStage(stage)}
                  disabled={busy}
                  aria-label={`Remove ${stage.stage_name}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

// Add or edit one stage: its name and which supplier does it.
function StageForm({ productId, stage, suppliers, onSaved, onCancel }) {
  const isEditing = Boolean(stage);
  const formRef = useRef(null);

  const [values, setValues] = useState({
    stage_name: stage?.stage_name ?? '',
    supplier_id: stage ? String(stage.supplier_id) : '', // <select> values are always text
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Put the cursor in the first field when the form opens
  useEffect(() => {
    formRef.current.querySelector('input').focus();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const newStages = isEditing
        ? await api.put(`/stages/${stage.id}`, values)
        : await api.post(`/products/${productId}/stages`, values);
      onSaved(newStages, isEditing);
    } catch (err) {
      setFieldErrors(err.fieldErrors);
      setFormError(err.status === 422 ? 'Please fix the highlighted fields.' : err.message);
      setSaving(false);
    }
  }

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: `${supplier.name} (${supplier.country})`,
  }));

  return (
    <form ref={formRef} className="card stage-form" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Edit “${stage.stage_name}”` : 'Add a stage'}</h3>

      {formError && (
        <p className="alert alert-error" role="alert">
          <strong>Not saved:</strong> {formError}
        </p>
      )}

      <div className="form-grid">
        <TextField
          label="Stage name"
          name="stage_name"
          value={values.stage_name}
          onChange={handleChange}
          error={fieldErrors.stage_name?.[0]}
          hint="e.g. Fabric production"
          required
        />
        <SelectField
          label="Supplier"
          name="supplier_id"
          value={values.supplier_id}
          onChange={handleChange}
          options={supplierOptions}
          error={fieldErrors.supplier_id?.[0]}
          hint="The stage's country comes from the supplier."
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add stage'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}