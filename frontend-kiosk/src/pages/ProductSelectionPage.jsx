// src/pages/ProductSelectionPage.jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { getKioskProducts } from "../services/api";
import { getKioskId } from "../services/kioskStorage";
import { useSession } from "../contexts/SessionContext";
import styles from "../styles/pages.module.css";
import { PRODUCT_IMAGES } from "../constants/products";

export default function ProductSelectionPage({ onNext, onHome }) {
  const { session, selectProduct } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 키오스크에 등록된 제품 불러오기
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // localStorage에서 키오스크 ID 가져오기
        const kioskId = getKioskId();

        if (!kioskId) {
          throw new Error(
            "키오스크가 등록되지 않았습니다. /manage 페이지에서 기기를 등록해주세요."
          );
        }

        // 백엔드에서 이 키오스크의 제품 목록 가져오기
        const response = await getKioskProducts(kioskId);

        // 판매 가능한 제품만 필터링
        const availableProducts = response.products.filter(
          (item) => item.available
        ).map(item => item.product);

        setProducts(availableProducts);
      } catch (err) {
        console.error('제품 목록 로드 실패:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const formatDescription = (text) => {
    if (typeof text !== "string") return [];
    return text
      .split(/(?<=\.)\s*/)
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const resolveProductImage = (product) => {
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;

    const lookupKey = product.pid ?? product.id;
    return lookupKey ? PRODUCT_IMAGES[lookupKey] : undefined;
  };

  const handleHomeClick = () => {
    if (onHome) onHome();
  };

  const renderHeader = () => (
    <div className="kiosk-header">
      <button
        type="button"
        className="kiosk-home-button"
        onClick={handleHomeClick}
      >
        처음 화면으로
      </button>
    </div>
  );

  const renderStateMessage = (icon, title, description, variant = "default") => {
    const isStringDescription = typeof description === "string";
    const descriptionLines = isStringDescription
      ? formatDescription(description)
      : [];
    const hasDescriptionLines = descriptionLines.length > 0;

    return (
      <div className="kiosk-page">
        {renderHeader()}
        <div className="kiosk-content">
          <div className="kiosk-content-center">
            <div
              className={`kiosk-state-card ${
                variant === "loading" ? "kiosk-state-card-loading" : ""
              }`}
            >
              {icon && <div className="kiosk-state-icon">{icon}</div>}
              <div className="kiosk-state-title">{title}</div>
              {hasDescriptionLines ? (
                <div className="kiosk-state-description">
                  {descriptionLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < descriptionLines.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              ) : (
                !isStringDescription &&
                description && (
                  <div className="kiosk-state-description">{description}</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 로딩 중
  if (isLoading) {
    return renderStateMessage(
      "제품을 불러오는 중입니다",
    );
  }

  // 에러 발생
  if (error) {
    return renderStateMessage(
      "제품을 불러올 수 없습니다. 관리자에게 문의해주세요."
    );
  }

  // 제품이 없는 경우
  if (products.length === 0) {
    return renderStateMessage(
      "등록된 제품이 없습니다. 관리자에게 문의해주세요.",
    );
  }

  return (
    <div className="kiosk-page">
      {renderHeader()}
      <div className="kiosk-content">
        <div className="kiosk-content-header">
          <h1 className="kiosk-title">리필할 제품을 선택해주세요.</h1>
        </div>
        <div className={styles.productSelectionProducts}>
          {products.map((product) => {
            const resolvedImage = resolveProductImage(product);
            const normalizedProduct = resolvedImage
              ? {
                  ...product,
                  image: resolvedImage,
                  image_url: resolvedImage,
                }
              : product;

            return (
              <ProductCard
                key={product.pid}
                product={normalizedProduct}
                isSelected={session.selectedProduct?.pid === product.pid}
                onSelect={() => selectProduct(product)}
              />
            );
          })}
        </div>

        <div className="kiosk-footer">
          <Button onClick={onNext} disabled={!session.selectedProduct}>
            상품 선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
