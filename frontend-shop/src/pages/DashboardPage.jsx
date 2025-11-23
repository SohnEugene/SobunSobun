import { useState, useEffect } from "react";
import { getKiosks, getProducts, getTransactions } from "../services/api";
import { formatPrice, formatNumber } from "../utils/formatters";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalKiosks: 0,
    totalProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [kiosks, products, transactions] = await Promise.all([
          getKiosks(),
          getProducts(),
          getTransactions({ limit: 5 }),
        ]);

        const totalRevenue = transactions.reduce(
          (sum, t) => sum + (t.total_price || 0),
          0,
        );

        setStats({
          totalKiosks: kiosks.length,
          totalProducts: products.length,
          totalTransactions: transactions.length,
          totalRevenue,
        });

        setRecentTransactions(transactions.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Kiosks</span>
          <span className={styles.statValue}>
            {formatNumber(stats.totalKiosks)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Products</span>
          <span className={styles.statValue}>
            {formatNumber(stats.totalProducts)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Transactions</span>
          <span className={styles.statValue}>
            {formatNumber(stats.totalTransactions)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            {formatPrice(stats.totalRevenue)}
          </span>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2>Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p className={styles.emptyMessage}>No transactions yet</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kiosk</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_id}</td>
                  <td>{t.kid}</td>
                  <td>{t.pid}</td>
                  <td>{formatPrice(t.total_price || 0)}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
