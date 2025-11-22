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
        <div className="productCardBrand">{product.brand || ""}</div>
        <div className="productCardName">{product.name}</div>
        <div className="productCardBrand">{product.detail}</div>
      </div>
      <div className="productCardPriceContainer">
        {product.originalPrice && (
          <span className="productCardOriginalPrice">
            {product.originalPrice}
          </span>
        )}
        <span className="productCardPrice">₩{product.price} /g</span>
      </div>
    </div>
  );
}
