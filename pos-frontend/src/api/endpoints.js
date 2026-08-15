import api from "./client";

// ---------- Auth ----------
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// ---------- Users ----------
export const userApi = {
  list: () => api.get("/users"),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// ---------- Categories ----------
export const categoryApi = {
  list: (params) => api.get("/categories", { params }),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

// ---------- Products ----------
export const productApi = {
  list: (params) => api.get("/products", { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/products/${id}`),
  adjustStock: (id, data) => api.put(`/products/${id}/adjust-stock`, data),
  stockHistory: (id) => api.get(`/products/${id}/stock-history`),
  lowStock: () => api.get("/products/alerts/low-stock"),
};

// ---------- Customers ----------
export const customerApi = {
  list: (params) => api.get("/customers", { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
};

// ---------- Sales ----------
export const saleApi = {
  list: (params) => api.get("/sales", { params }),
  get: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post("/sales", data),
  invoiceUrl: (id) => `${api.defaults.baseURL}/sales/${id}/invoice`,
};

// ---------- Dashboard ----------
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  recentSales: (limit = 8) => api.get("/dashboard/recent-sales", { params: { limit } }),
  salesChart: (days = 7) => api.get("/dashboard/sales-chart", { params: { days } }),
};

// ---------- Reports ----------
export const reportApi = {
  sales: (params) => api.get("/reports/sales", { params }),
  products: (params) => api.get("/reports/products", { params }),
  revenue: (params) => api.get("/reports/revenue", { params }),
  lowStock: () => api.get("/reports/low-stock"),
};
