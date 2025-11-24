import { request } from './client';

export async function getKiosks() {
  return request('/kiosks/');
}

export async function getKioskById(kioskId) {
  return request(`/kiosks/${kioskId}`);
}

export async function createKiosk(kioskData) {
  return request('/kiosks/', {
    method: 'POST',
    body: JSON.stringify(kioskData),
  });
}

export async function updateKiosk(kioskId, kioskData) {
  return request(`/kiosks/${kioskId}`, {
    method: 'PUT',
    body: JSON.stringify(kioskData),
  });
}

export async function deleteKiosk(kioskId) {
  return request(`/kiosks/${kioskId}`, {
    method: 'DELETE',
  });
}

export async function getKioskProducts(kioskId) {
  return request(`/kiosks/${kioskId}/products`);
}

export async function addProductToKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeProductFromKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products/${productId}`, {
    method: 'DELETE',
  });
}
