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
