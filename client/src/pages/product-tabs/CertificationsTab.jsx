import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';
import EmptyState from '../../components/EmptyState.jsx';
import TextField from '../../components/TextField.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

// A product's compliance certificates: add, edit and delete them.
// Each save answers with that ONE certificate (status included), so we update
// product.certifications ourselves instead of loading the whole product again.
// The status always comes from the server; we never work it out here.
export default function CertificationsTab({ product, onProductChange }) {
  const [editing, setEditing] = useState(null); // null | 'new' | the certificate being edited
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false); // true while a delete request is running

  const certifications = product.certifications;

  function clearAlerts() {
    setSuccessMessage(null);
    setActionError(null);
  }

  function showCertifications(newList, message) {
    onProductChange({ ...product, certifications: newList });
    setSuccessMessage(message);
  }

  function openForm(target) {
    clearAlerts();
    setEditing(target);
  }

  // Add and edit work the same way: drop the old copy (if any), add the saved one, re-sort
  function handleSaved(saved, wasEditing) {
    setEditing(null);
    const others = certifications.filter((cert) => cert.id !== saved.id);
    showCertifications(
      sortByIssueDate([...others, saved]),
      `“${saved.name}” was ${wasEditing ? 'updated' : 'added'}.`
    );
  }

  async function deleteCertification(certificate) {
    clearAlerts();
    if (!window.confirm(`Delete the certificate "${certificate.name}"?`)) return;

    setBusy(true);
    try {
      await api.delete(`/certifications/${certificate.id}`); // 204: nothing comes back
      if (editing?.id === certificate.id) setEditing(null);
      showCertifications(
        certifications.filter((cert) => cert.id !== certificate.id),
        `“${certificate.name}” was deleted.`
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Certifications</h2>
        <button type="button" className="btn btn-primary" onClick={() => openForm('new')}>
          Add certificate
        </button>
      </div>

      <p className="notice" role="note">
        <strong>Note:</strong> Certificates are self-reported and not independently verified. Status is
        calculated from the dates using today's date (UTC).
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
        <CertificationForm
          key={editing === 'new' ? 'new' : editing.id}
          productId={product.id}
          certificate={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {certifications.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          message="Add the certificates this product holds, e.g. ISO 9001 or OEKO-TEX."
        />
      ) : (
        <CertificationTable
          certifications={certifications}
          busy={busy}
          onEdit={openForm}
          onDelete={deleteCertification}
        />
      )}
    </>
  );
}

// Same order as the server: oldest issue date first.
// 'YYYY-MM-DD' dates sort correctly as plain text. Equal dates fall back to id,
// so certificates with the same date don't swap places between renders.
function sortByIssueDate(list) {
  return [...list].sort((a, b) => {
    if (a.issued_at !== b.issued_at) return a.issued_at < b.issued_at ? -1 : 1;
    return a.id - b.id;
  });
}

const EMPTY_CERTIFICATE = {
  name: '',
  issuer: '',
  certificate_number: '',
  issued_at: '',
  expires_at: '',
  evidence_url: '',
};

// Copies only the editable fields (inputs need '' instead of null).
// Dates already arrive as 'YYYY-MM-DD', which is exactly what <input type="date"> uses.
function toFormValues(certificate) {
  const values = {};
  for (const field of Object.keys(EMPTY_CERTIFICATE)) {
    values[field] = certificate[field] ?? '';
  }
  return values;
}

// Add or edit one certificate.
function CertificationForm({ productId, certificate, onSaved, onCancel }) {
  const isEditing = Boolean(certificate);
  const formRef = useRef(null);

  const [values, setValues] = useState(isEditing ? toFormValues(certificate) : EMPTY_CERTIFICATE);
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
      const saved = isEditing
        ? await api.put(`/certifications/${certificate.id}`, values)
        : await api.post(`/products/${productId}/certifications`, values);
      onSaved(saved, isEditing);
    } catch (err) {
      // 422 → messages under each field (an expiry before the issue date arrives on expires_at)
      setFieldErrors(err.fieldErrors);
      setFormError(err.status === 422 ? 'Please fix the highlighted fields.' : err.message);
      setSaving(false);
    }
  }

  const errorFor = (field) => fieldErrors[field]?.[0];

  return (
    <form ref={formRef} className="card cert-form" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Edit “${certificate.name}”` : 'Add a certificate'}</h3>

      {formError && (
        <p className="alert alert-error" role="alert">
          <strong>Not saved:</strong> {formError}
        </p>
      )}

      <div className="form-grid">
        <TextField
          label="Certification name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errorFor('name')}
          required
        />
        <TextField label="Issuer" name="issuer" value={values.issuer} onChange={handleChange} error={errorFor('issuer')} required />
        <TextField
          label="Certificate number"
          name="certificate_number"
          value={values.certificate_number}
          onChange={handleChange}
          error={errorFor('certificate_number')}
          required
        />
        <TextField
          label="Issue date"
          name="issued_at"
          type="date"
          value={values.issued_at}
          onChange={handleChange}
          error={errorFor('issued_at')}
          required
        />
        <TextField
          label="Expiry date"
          name="expires_at"
          type="date"
          value={values.expires_at}
          onChange={handleChange}
          error={errorFor('expires_at')}
          hint="Leave empty if the certificate has no expiry date"
        />
        <TextField
          label="Evidence URL"
          name="evidence_url"
          type="url"
          value={values.evidence_url}
          onChange={handleChange}
          error={errorFor('evidence_url')}
          hint="Optional link to the certificate document"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add certificate'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CertificationTable({ certifications, busy, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Certificate</th>
            <th scope="col">Issuer</th>
            <th scope="col">Issued</th>
            <th scope="col">Expires</th>
            <th scope="col">Status</th>
            <th scope="col">Evidence</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certifications.map((cert) => (
            <tr key={cert.id}>
              <td>
                {cert.name}
                <div className="muted">{cert.certificate_number}</div>
              </td>
              <td>{cert.issuer}</td>
              <td>{formatDate(cert.issued_at)}</td>
              <td>{cert.expires_at ? formatDate(cert.expires_at) : 'No expiry'}</td>
              <td>
                {/* Status is worked out by the server from the dates (UTC); we only display it */}
                <StatusBadge status={cert.status} />
              </td>
              <td>
                {cert.evidence_url ? (
                  // noopener: the new tab can't control this page; noreferrer: our URL isn't sent along
                  <a
                    href={cert.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View evidence for ${cert.name}`}
                  >
                    View
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => onEdit(cert)}
                    aria-label={`Edit ${cert.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => onDelete(cert)}
                    disabled={busy}
                    aria-label={`Delete ${cert.name}`}
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
