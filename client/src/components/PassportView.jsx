import StatusBadge from './StatusBadge.jsx';
import { formatDate, formatDateTime } from '../utils/format.js';

// Shows a Digital Product Passport exactly as customers see it.
// Used by the public page AND by the admin preview, so the preview can't drift
// from the real thing. `passport` is { product, stages, certifications } from the API.
export default function PassportView({ passport, publishedAt }) {
  const { product, stages, certifications } = passport;

  return (
    <article className="passport">
      {/* 1. Hero: who/what this passport is about */}
      <header className="passport-hero">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="passport-image" />
        )}
        <div>
          <p className="passport-label">Digital Product Passport</p>
          <h1 className="passport-title">{product.name}</h1>
          <p className="passport-meta">
            SKU {product.sku} · {product.category}
          </p>
        </div>
      </header>

      {/* 2. Product overview */}
      <section className="passport-section" aria-labelledby="passport-overview">
        <h2 id="passport-overview">Product overview</h2>
        <dl className="detail-list">
          <div>
            <dt>Material</dt>
            <dd>{product.primary_material}</dd>
          </div>
          <div>
            <dt>Made in</dt>
            <dd>{product.manufacture_country}</dd>
          </div>
        </dl>
        <p className="description">{product.description}</p>
      </section>

      {/* 3. Supply chain, in its saved order */}
      <section className="passport-section" aria-labelledby="passport-supply-chain">
        <h2 id="passport-supply-chain">Supply chain</h2>
        {stages.length === 0 ? (
          <p>No supply-chain stages have been recorded.</p>
        ) : (
          <ol className="timeline" role="list">
            {stages.map((stage) => (
              <li key={stage.stage_order} className="timeline-item">
                <span className="timeline-number" aria-hidden="true">
                  {stage.stage_order}
                </span>
                <div className="timeline-content">
                  <h3>{stage.stage_name}</h3>
                  <p>
                    {stage.supplier_name} · {stage.location ? `${stage.location}, ` : ''}
                    {stage.country}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 4. Certifications with today's status */}
      <section className="passport-section" aria-labelledby="passport-certifications">
        <h2 id="passport-certifications">Certifications</h2>
        {certifications.length === 0 ? (
          <p>No certifications have been recorded.</p>
        ) : (
          <ul className="passport-certificates" role="list">
            {/* The snapshot has no ids; the list is read-only and never reordered, so the position is a safe key */}
            {certifications.map((certificate, index) => (
              <li key={index} className="passport-certificate">
                <div>
                  <h3>{certificate.name}</h3>
                  <p>
                    Issued by {certificate.issuer} · No. {certificate.certificate_number}
                  </p>
                  <p>
                    {formatDate(certificate.issued_at)} –{' '}
                    {certificate.expires_at ? formatDate(certificate.expires_at) : 'no expiry date'}
                  </p>
                  {certificate.evidence_url && (
                    <a href={certificate.evidence_url} target="_blank" rel="noopener noreferrer">
                      View evidence<span className="visually-hidden"> for {certificate.name}</span>
                    </a>
                  )}
                </div>
                <StatusBadge status={certificate.status} />
              </li>
            ))}
          </ul>
        )}
        <p className="notice" role="note">
          <strong>Self-reported:</strong> these certificates are declared by the company and have not been
          independently verified.
        </p>
      </section>

      {/* 5. When this version was approved */}
      <footer className="passport-footer">
        {publishedAt ? (
          <p>
            Last published: <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
          </p>
        ) : (
          <p>Preview only: this version has not been published.</p>
        )}
      </footer>
    </article>
  );
}