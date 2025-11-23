import { useState, useEffect } from "react";
import { getTransactions, getKiosks } from "../services/api";
import { formatPrice, formatDateTime, formatWeight } from "../utils/formatters";
import Button from "../components/Button";
import styles from "./TransactionsPage.module.css";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    kioskId: "",
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    loadKiosks();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadKiosks = async () => {
    try {
      const data = await getKiosks();
      setKiosks(data);
    } catch (err) {
      console.error("Failed to load kiosks:", err);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.kioskId) params.kioskId = filters.kioskId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await getTransactions(params);
      setTransactions(data);

      // Calculate stats
      const totalRevenue = data.reduce(
        (sum, t) => sum + (t.total_price || 0),
        0,
      );
      const totalWeight = data.reduce(
        (sum, t) => sum + (t.amount_grams || 0),
        0,
      );
      setStats({
        totalRevenue,
        totalTransactions: data.length,
        totalWeight,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      kioskId: "",
      startDate: "",
      endDate: "",
    });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Kiosk",
      "Product",
      "Weight (g)",
      "Price",
      "Payment Method",
    ];
    const rows = transactions.map((t) => [
      t.transaction_id,
      new Date(t.created_at).toISOString(),
      t.kid,
      t.pid,
      t.amount_grams || 0,
      t.total_price || 0,
      t.payment_method || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Transaction History</h1>
        <Button onClick={exportToCSV} disabled={transactions.length === 0}>
          Export CSV
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            {formatPrice(stats.totalRevenue)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Transactions</span>
          <span className={styles.statValue}>{stats.totalTransactions}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Weight</span>
          <span className={styles.statValue}>
            {formatWeight(stats.totalWeight)}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Kiosk</label>
          <select
            value={filters.kioskId}
            onChange={(e) => handleFilterChange("kioskId", e.target.value)}
          >
            <option value="">All Kiosks</option>
            {kiosks.map((kiosk) => (
              <option key={kiosk.kiosk_id} value={kiosk.kiosk_id}>
                {kiosk.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
        <Button variant="secondary" size="small" onClick={handleClearFilters}>
          Clear
        </Button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : transactions.length === 0 ? (
          <p className={styles.emptyMessage}>No transactions found</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Kiosk</th>
                <th>Product</th>
                <th>Weight</th>
                <th>Price</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_id}</td>
                  <td>{formatDateTime(t.created_at)}</td>
                  <td>{t.kid}</td>
                  <td>{t.pid}</td>
                  <td>{formatWeight(t.amount_grams || 0)}</td>
                  <td>{formatPrice(t.total_price || 0)}</td>
                  <td>
                    <span
                      className={`${styles.paymentBadge} ${styles[t.payment_method] || ""}`}
                    >
                      {t.payment_method || "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;
