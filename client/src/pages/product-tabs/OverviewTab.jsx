// The product's own details, read-only. Editing happens on the Edit page.
export default function OverviewTab({ product }) {
  return (
    <div className="card">
      <div className="overview">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="overview-image" />
        )}

        <dl className="detail-list">
          <div>
            <dt>Name</dt>
            <dd>{product.name}</dd>
          </div>
          <div>
            <dt>SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{product.category}</dd>
          </div>
          <div>
            <dt>Primary material</dt>
            <dd>{product.primary_material}</dd>
          </div>
          <div>
            <dt>Country of manufacture</dt>
            <dd>{product.manufacture_country}</dd>
          </div>
          <div>
            <dt>Supply-chain stages</dt>
            <dd>{product.stages.length}</dd>
          </div>
          <div>
            <dt>Certificates</dt>
            <dd>{product.certifications.length}</dd>
          </div>
        </dl>
      </div>

      <h2>Description</h2>
      <p className="description">{product.description}</p>
    </div>
  );
}