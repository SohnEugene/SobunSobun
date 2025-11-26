import { request } from './client';

export async function getProducts() {
  return request('/products/');
}

export async function getProductById(productId) {
  return request(`/products/${productId}`);
}

export async function createProduct(productData) {
  return request('/products/', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(productId, productData) {
  return request(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(productId) {
  return request(`/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function uploadProductImage(productId, file) {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api';
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/products/${productId}/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getProductImageUrl(productId, expiresIn = 3600) {
  return request(`/products/${productId}/image-url?expires_in=${expiresIn}`);
}
