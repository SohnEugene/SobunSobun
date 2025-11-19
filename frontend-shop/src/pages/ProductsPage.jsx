import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { formatPrice } from '../utils/formatters';
import Button from '../components/Button';
import styles from './ProductsPage.module.css';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image_url: formData.image_url || '',
      };

      if (editingProduct) {
        await updateProduct(editingProduct.pid, productData);
      } else {
        await createProduct(productData);
      }

      handleCloseModal();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Product Management</h1>
        <Button onClick={() => handleOpenModal()}>Add Product</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p className={styles.emptyMessage}>No products registered</p>
        ) : (
          products.map((product) => (
            <div key={product.pid} className={styles.productCard}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    {formatPrice(product.price)}/g
                  </span>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenModal(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(product.pid)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Price per gram (won) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
