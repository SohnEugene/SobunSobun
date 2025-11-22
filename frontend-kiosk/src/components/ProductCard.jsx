// src/components/ProductCard.jsx
export default function ProductCard({ product, isSelected, onSelect }) {
  const cardClassName = [
    "productCard",
    isSelected ? "productCardSelected" : "",
  ]
    .join(" ")
    .trim();

  return (
    <div className={cardClassName} onClick={() => onSelect(product.pid)}>
      <img
        src={product.image_url || product.image || "/default-product.png"}
        alt={product.name}
        className="productCardImage"
      />
      <div className="productCardInfo">
        <div className="productCardHeader">
          <div className="productCardName">{product.name}</div>
          <div className="productCardPrice">₩{product.price} /g</div>
        </div>
        <div className="productCardDetail">{product.description}</div>
        <div className="productCardCompare"></div>
      </div>
    </div>
  );
}
