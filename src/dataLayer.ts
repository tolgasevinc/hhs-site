declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushFormSubmitToDataLayer(payload: {
  form_name: string;
  product_category: string;
  product_name: string;
}): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit',
    form_name: payload.form_name,
    product_category: payload.product_category,
    product_name: payload.product_name,
  });
}
