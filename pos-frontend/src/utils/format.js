export const formatCurrency = (amount = 0) =>
  `Rs. ${Number(amount).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const stockStatusMeta = {
  in_stock: { label: "In Stock", variant: "brand" },
  low_stock: { label: "Low Stock", variant: "gold" },
  out_of_stock: { label: "Out of Stock", variant: "brick" },
};
