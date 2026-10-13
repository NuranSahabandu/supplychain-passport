import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import TextField from '../components/TextField.jsx';

// One page for both URLs:
//   /admin/products/new       → create a product
//   /admin/products/:id/edit  → edit an existing product
export default function ProductFormPage() {
  const { id } = useParams();
  return id ? <EditProduct id={id} /> : <ProductForm />;
}

// Edit mode: load the product first, then show the form filled in
function EditProduct({ id }) {
  const { data: product, loading, error, reload } = useFetch(`/products/${id}`);

  if (loading) return <LoadingState label="Loading product…" />;
  // Retrying makes sense for a network problem, not for a product that doesn't exist
  if (error) return <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />;
  return <ProductForm product={product} />;
}

const EMPTY_PRODUCT = {
  name: '',
  sku: '',
  category: '',
  description: '',
  primary_material: '',
  manufacture_country: '',
  image_url: '',
};

// Copies only the editable fields (inputs need '' instead of null)
function toFormValues(product) {
  const values = {};
  for (const field of Object.keys(EMPTY_PRODUCT)) {
    values[field] = product[field] ?? '';
  }
  return values;
}

function ProductForm({ product }) {
  const isEditing = Boolean(product);
  const navigate = useNavigate();

  const [values, setValues] = useState(isEditing ? toFormValues(product) : EMPTY_PRODUCT);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

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
        ? await api.put(`/products/${product.id}`, values)
        : await api.post('/products', values);

      // After creating: back to the list (the new product is visible there).
      // After editing: back to that product's page.
      if (isEditing) {
        navigate(`/admin/products/${saved.id}`, { state: { message: `“${saved.name}” was updated.` } });
      } else {
        navigate('/admin/products', { state: { message: `“${saved.name}” was created.` } });
      }
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
    <>
      <div className="page-header">
        <h1>{isEditing ? `Edit ${product.name}` : 'Add product'}</h1>
      </div>

      <form className="card" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="alert alert-error" role="alert">
            <strong>Not saved:</strong> {formError}
          </p>
        )}

        <div className="form-grid">
          <TextField label="Name" name="name" value={values.name} onChange={handleChange} error={errorFor('name')} required />
          <TextField
            label="SKU"
            name="sku"
            value={values.sku}
            onChange={handleChange}
            error={errorFor('sku')}
            hint="Letters, numbers and dashes, e.g. EGP-1001. Used in the public passport link."
            required
          />
          <TextField label="Category" name="category" value={values.category} onChange={handleChange} error={errorFor('category')} required />
          <TextField
            label="Primary material"
            name="primary_material"
            value={values.primary_material}
            onChange={handleChange}
            error={errorFor('primary_material')}
            required
          />
          <TextField
            label="Country of manufacture"
            name="manufacture_country"
            value={values.manufacture_country}
            onChange={handleChange}
            error={errorFor('manufacture_country')}
            required
          />
          <TextField
            label="Image URL"
            name="image_url"
            type="url"
            value={values.image_url}
            onChange={handleChange}
            error={errorFor('image_url')}
            hint="Optional. A link to a product photo (https://…)."
          />
        </div>

        <TextField
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          error={errorFor('description')}
          multiline
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
          </button>
          <Link to={isEditing ? `/admin/products/${product.id}` : '/admin/products'} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}