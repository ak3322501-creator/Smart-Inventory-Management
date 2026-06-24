import { useState, useRef } from 'react';
import { apiPost, apiPut, apiDelete, apiUpload } from '../api';

function ProductTable({ products, onRefresh, suppliers }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'upload'
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const emptyForm = { name: '', sku: '', description: '', quantity: 0, reorder_level: 10, price: 0, supplier_id: '', imageUrl: '' };
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview
    setPreviewUrl(URL.createObjectURL(file));
    setUploadError('');
    setUploading(true);

    try {
      const result = await apiUpload(file);
      if (result.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: result.imageUrl }));
        setPreviewUrl(result.imageUrl);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPreviewUrl('');
    setUploadError('');
    setImageMode('url');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      quantity: product.quantity,
      reorder_level: product.reorder_level,
      price: product.price,
      supplier_id: product.supplier_id || '',
      imageUrl: product.imageUrl || ''
    });
    setEditingId(product.id);
    setPreviewUrl(product.imageUrl || '');
    setUploadError('');
    setImageMode('url');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (uploading) return;

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      reorder_level: Number(form.reorder_level),
      price: Number(form.price),
      supplier_id: form.supplier_id || null,
      imageUrl: form.imageUrl
    };

    if (editingId) {
      await apiPut(`/products/${editingId}`, payload);
    } else {
      await apiPost('/products', payload);
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setPreviewUrl('');
    setUploadError('');
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await apiDelete(`/products/${id}`);
      onRefresh();
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreviewUrl('');
    setUploadError('');
  };

  const displayImage = form.imageUrl || previewUrl;

  return (
    <div className="wp-products">
      {/* WordPress style top bar */}
      <div className="wp-top-bar">
        <div className="wp-top-bar-left">
          <h2 className="wp-page-title">All Products</h2>
          <span className="wp-count-badge">{products.length} items</span>
        </div>
        <button className="wp-btn-primary" onClick={openAddForm}>
          + Add New Product
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="wp-form-overlay" onClick={(e) => e.target === e.currentTarget && cancelForm()}>
          <div className="wp-form-modal">
            <div className="wp-modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="wp-modal-close" onClick={cancelForm}>✕</button>
            </div>

            <div className="wp-modal-body">
              <div className="wp-form-grid">
                {/* Left column: fields */}
                <div className="wp-form-fields">
                  <div className="wp-field-group">
                    <label>Product Name *</label>
                    <input name="name" placeholder="Enter product name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="wp-field-row">
                    <div className="wp-field-group">
                      <label>SKU</label>
                      <input name="sku" placeholder="e.g. PRD-001" value={form.sku} onChange={handleChange} />
                    </div>
                    <div className="wp-field-group">
                      <label>Price (Rs)</label>
                      <input name="price" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="wp-field-group">
                    <label>Description</label>
                    <textarea name="description" placeholder="Product description..." rows="3" value={form.description} onChange={handleChange}></textarea>
                  </div>
                  <div className="wp-field-row">
                    <div className="wp-field-group">
                      <label>Quantity</label>
                      <input name="quantity" type="number" placeholder="0" value={form.quantity} onChange={handleChange} />
                    </div>
                    <div className="wp-field-group">
                      <label>Reorder Level</label>
                      <input name="reorder_level" type="number" placeholder="10" value={form.reorder_level} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="wp-field-group">
                    <label>Supplier</label>
                    <select name="supplier_id" value={form.supplier_id} onChange={handleChange}>
                      <option value="">— Select Supplier —</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right column: image */}
                <div className="wp-form-image-section">
                  <label>Product Image</label>
                  <div className="wp-image-preview">
                    {displayImage ? (
                      <img src={displayImage} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="wp-image-placeholder">
                        <span>📷</span>
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="wp-image-mode-toggle">
                    <button
                      className={`wp-toggle-btn ${imageMode === 'upload' ? 'active' : ''}`}
                      onClick={() => setImageMode('upload')}
                      type="button"
                    >
                      Upload File
                    </button>
                    <button
                      className={`wp-toggle-btn ${imageMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageMode('url')}
                      type="button"
                    >
                      Image URL
                    </button>
                  </div>

                  {imageMode === 'upload' ? (
                    <div className="wp-upload-area">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <button
                        className="wp-btn-upload"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        type="button"
                      >
                        {uploading ? 'Uploading...' : 'Choose Image'}
                      </button>
                      {uploadError && <p className="wp-upload-error">{uploadError}</p>}
                    </div>
                  ) : (
                    <div className="wp-field-group">
                      <input
                        name="imageUrl"
                        placeholder="https://example.com/image.png"
                        value={form.imageUrl}
                        onChange={(e) => {
                          handleChange(e);
                          setPreviewUrl(e.target.value);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="wp-modal-footer">
              <button className="wp-btn-secondary" onClick={cancelForm}>Cancel</button>
              <button className="wp-btn-primary" onClick={handleSave} disabled={uploading}>
                {editingId ? 'Update Product' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WordPress style data table */}
      <div className="wp-table-wrapper">
        <table className="wp-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Reorder</th>
              <th>Supplier</th>
              <th>Price</th>
              <th style={{ width: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="8" className="wp-empty-row">No products found. Click "Add New Product" to get started.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="wp-table-row">
                <td>
                  <div className="wp-thumb">
                    {product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/120x120.png?text=No+Image' ? (
                      <img src={product.imageUrl} alt={product.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="wp-thumb-fallback" style={product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/120x120.png?text=No+Image' ? { display: 'none' } : {}}>
                      {product.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </td>
                <td>
                  <strong className="wp-product-name">{product.name}</strong>
                  {product.description && <p className="wp-product-desc">{product.description}</p>}
                </td>
                <td><code className="wp-sku">{product.sku}</code></td>
                <td>
                  <span className={`wp-stock-badge ${product.quantity <= product.reorder_level ? 'low' : 'ok'}`}>
                    {product.quantity}
                  </span>
                </td>
                <td>{product.reorder_level}</td>
                <td>{product.supplier_name || <span className="wp-muted">—</span>}</td>
                <td className="wp-price">Rs {product.price.toFixed(2)}</td>
                <td>
                  <div className="wp-actions">
                    <button className="wp-btn-edit" onClick={() => openEditForm(product)}>Edit</button>
                    <button className="wp-btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
