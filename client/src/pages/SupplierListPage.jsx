import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TextField from '../components/TextField.jsx';

// Suppliers are simple, so list, add, edit and delete all live on this one page.
export default function SupplierListPage() {
  const { data: suppliers, loading, error, reload } = useFetch('/suppliers');

  // Which form is open: null (none), 'new' (add) or the supplier being edited
  const [editing, setEditing] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Old messages would be confusing next to the result of a new action
  function clearAlerts() {
    setSuccessMessage(null);
    setDeleteError(null);
  }

  function openForm(target) {
    clearAlerts();
    setEditing(target);
  }

  function handleSaved(saved, wasEditing) {
    setEditing(null);
    setSuccessMessage(`“${saved.name}” was ${wasEditing ? 'updated' : 'added'}.`);
    reload();
  }

  async function handleDelete(supplier) {
    clearAlerts();
    if (!window.confirm(`Delete “${supplier.name}”? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/suppliers/${supplier.id}`);

      // Don't leave an edit form open for a supplier that no longer exists
      if (editing?.id === supplier.id) {
        setEditing(null);
      }
      setSuccessMessage(`“${supplier.name}” was deleted.`);
      reload();
    } catch (err) {
      // The server explains why (e.g. the 409 "used in 1 supply-chain stage(s)..."), so show its words
      setDeleteError(err.message);
    }
  }

  const addButton = (
    <button type="button" className="btn btn-primary" onClick={() => openForm('new')}>
      Add supplier
    </button>
  );

  return (
    <>
      <div className="page-header">
        <h1>Suppliers</h1>
        {addButton}
      </div>

      {successMessage && (
        <p className="alert alert-success" role="status">
          <strong>Done:</strong> {successMessage}
        </p>
      )}

      {deleteError && (
        <p className="alert alert-error" role="alert">
          <strong>Not deleted:</strong> {deleteError}
        </p>
      )}

      {/* The key makes React start a fresh form when switching between add / edit A / edit B */}
      {editing && (
        <SupplierForm
          key={editing === 'new' ? 'new' : editing.id}
          supplier={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <LoadingState label="Loading suppliers…" />}

      {error && <ErrorState error={error} onRetry={reload} />}

      {suppliers && suppliers.length === 0 && (
        <EmptyState
          title="No suppliers yet"
          message="Add the companies that take part in your products' supply chains."
          action={addButton}
        />
      )}

      {suppliers && suppliers.length > 0 && (
        <SupplierTable suppliers={suppliers} onEdit={openForm} onDelete={handleDelete} />
      )}
    </>
  );
}

const EMPTY_SUPPLIER = {
  name: '',
  country: '',
  location: '',
  contact: '',
};

// Copies only the editable fields (inputs need '' instead of null)
function toFormValues(supplier) {
  const values = {};
  for (const field of Object.keys(EMPTY_SUPPLIER)) {
    values[field] = supplier[field] ?? '';
  }
  return values;
}

function SupplierForm({ supplier, onSaved, onCancel }) {
  const isEditing = Boolean(supplier);

  const [values, setValues] = useState(isEditing ? toFormValues(supplier) : EMPTY_SUPPLIER);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Put the cursor in the first field when the form opens, so keyboard users can type straight away.
  // TextField doesn't accept a ref, so we find its input inside the form instead.
  const formRef = useRef(null);
  useEffect(() => {
    formRef.current.querySelector('input').focus();
  }, []);

  // One change handler for every input: the input's name says which value to update
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's own full-page form submit
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const saved = isEditing
        ? await api.put(`/suppliers/${supplier.id}`, values)
        : await api.post('/suppliers', values);

      onSaved(saved, isEditing);
    } catch (err) {
      // 422 → messages under each field; anything else → one message at the top
      setFieldErrors(err.fieldErrors);
      setFormError(err.status === 422 ? 'Please fix the highlighted fields.' : err.message);
      setSaving(false);
    }
  }

  // The server sends a list of messages per field; we show the first one
  const errorFor = (field) => fieldErrors[field]?.[0];

  return (
    <form ref={formRef} className="card supplier-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEditing ? `Edit ${supplier.name}` : 'Add supplier'}</h2>

      {formError && (
        <p className="alert alert-error" role="alert">
          <strong>Not saved:</strong> {formError}
        </p>
      )}

      <div className="form-grid">
        <TextField label="Name" name="name" value={values.name} onChange={handleChange} error={errorFor('name')} required />
        <TextField
          label="Country"
          name="country"
          value={values.country}
          onChange={handleChange}
          error={errorFor('country')}
          required
        />
        <TextField
          label="Location"
          name="location"
          value={values.location}
          onChange={handleChange}
          error={errorFor('location')}
          hint="e.g. city or region"
        />
        <TextField
          label="Contact"
          name="contact"
          value={values.contact}
          onChange={handleChange}
          error={errorFor('contact')}
          hint="Internal only; never shown on public passports"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add supplier'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// "Not used" reads better than "0 stages" and makes safe-to-delete suppliers easy to spot
function usedInText(stageCount) {
  const count = Number(stageCount); // safety: MySQL COUNT can arrive as a string with some driver settings
  if (count === 0) return 'Not used';
  return count === 1 ? '1 stage' : `${count} stages`;
}

function SupplierTable({ suppliers, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Country</th>
            <th scope="col">Location</th>
            <th scope="col">Contact</th>
            <th scope="col">Used in</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.country}</td>
              <td>{supplier.location || '—'}</td>
              <td>{supplier.contact || '—'}</td>
              <td>{usedInText(supplier.stage_count)}</td>
              <td>
                {/* aria-label says WHICH supplier, since every row has the same button text */}
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    aria-label={`Edit ${supplier.name}`}
                    onClick={() => onEdit(supplier)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    aria-label={`Delete ${supplier.name}`}
                    onClick={() => onDelete(supplier)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
