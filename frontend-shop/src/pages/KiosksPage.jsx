import { useState, useEffect } from 'react';
import { getKiosks, getKioskProducts, createKiosk, deleteKiosk, getProducts, addProductToKiosk, removeProductFromKiosk } from '../services/api';
import Button from '../components/Button';
import styles from './KiosksPage.module.css';

function KiosksPage() {
  const [kiosks, setKiosks] = useState([]);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [kioskProducts, setKioskProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newKiosk, setNewKiosk] = useState({ name: '', location: '' });

  useEffect(() => {
    loadKiosks();
    loadAllProducts();
  }, []);

  const loadKiosks = async () => {
    try {
      setLoading(true);
      const data = await getKiosks();
      setKiosks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const data = await getProducts();
      setAllProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadKioskProducts = async (kioskId) => {
    try {
      const data = await getKioskProducts(kioskId);
      // Backend returns { products: [{ product: {...}, available: bool }] }
      const products = data.products?.map(p => ({
        ...p.product,
        available: p.available
      })) || [];
      setKioskProducts(products);
    } catch (err) {
      console.error('Failed to load kiosk products:', err);
      setKioskProducts([]);
    }
  };

  const handleSelectKiosk = async (kiosk) => {
    setSelectedKiosk(kiosk);
    await loadKioskProducts(kiosk.kiosk_id);
  };

  const handleAddKiosk = async (e) => {
    e.preventDefault();
    try {
      await createKiosk(newKiosk);
      setNewKiosk({ name: '', location: '' });
      setShowAddModal(false);
      loadKiosks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteKiosk = async (kioskId) => {
    if (!confirm('Are you sure you want to delete this kiosk?')) return;
    try {
      await deleteKiosk(kioskId);
      if (selectedKiosk?.kiosk_id === kioskId) {
        setSelectedKiosk(null);
        setKioskProducts([]);
      }
      loadKiosks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProduct = async (productId) => {
    if (!selectedKiosk) return;
    try {
      await addProductToKiosk(selectedKiosk.kiosk_id, productId);
      loadKioskProducts(selectedKiosk.kiosk_id);
      setShowProductModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!selectedKiosk) return;
    try {
      await removeProductFromKiosk(selectedKiosk.kiosk_id, productId);
      loadKioskProducts(selectedKiosk.kiosk_id);
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
        <h1>Kiosk Management</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Kiosk</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.kioskList}>
          <h2>Kiosks</h2>
          {kiosks.length === 0 ? (
            <p className={styles.emptyMessage}>No kiosks registered</p>
          ) : (
            <ul className={styles.list}>
              {kiosks.map((kiosk) => (
                <li
                  key={kiosk.kiosk_id}
                  className={`${styles.listItem} ${selectedKiosk?.kiosk_id === kiosk.kiosk_id ? styles.selected : ''}`}
                  onClick={() => handleSelectKiosk(kiosk)}
                >
                  <div className={styles.kioskInfo}>
                    <span className={styles.kioskName}>{kiosk.name}</span>
                    <span className={styles.kioskLocation}>{kiosk.location}</span>
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteKiosk(kiosk.kiosk_id);
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.kioskDetail}>
          {selectedKiosk ? (
            <>
              <div className={styles.detailHeader}>
                <h2>{selectedKiosk.name}</h2>
                <Button size="small" onClick={() => setShowProductModal(true)}>
                  Add Product
                </Button>
              </div>
              <p className={styles.location}>Location: {selectedKiosk.location}</p>

              <h3>Products in this Kiosk</h3>
              {kioskProducts.length === 0 ? (
                <p className={styles.emptyMessage}>No products assigned to this kiosk</p>
              ) : (
                <ul className={styles.productList}>
                  {kioskProducts.map((product) => (
                    <li key={product.pid} className={styles.productItem}>
                      <span>{product.name}</span>
                      <span>{product.price}won/g</span>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRemoveProduct(product.pid)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className={styles.emptyMessage}>Select a kiosk to view details</p>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add New Kiosk</h2>
            <form onSubmit={handleAddKiosk}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={newKiosk.name}
                  onChange={(e) => setNewKiosk({ ...newKiosk, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={newKiosk.location}
                  onChange={(e) => setNewKiosk({ ...newKiosk, location: e.target.value })}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Product to Kiosk</h2>
            <ul className={styles.productSelectList}>
              {allProducts
                .filter((p) => !kioskProducts.some((kp) => kp.pid === p.pid))
                .map((product) => (
                  <li key={product.pid} className={styles.productSelectItem}>
                    <span>{product.name}</span>
                    <Button size="small" onClick={() => handleAddProduct(product.pid)}>
                      Add
                    </Button>
                  </li>
                ))}
            </ul>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowProductModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KiosksPage;
