export const siteConfig = {
  name: "Aslal Digital Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com",
  email: "info@aslaldigital.com",
  phone: "+251 911-276682",
  location: "Addis Ababa, Ethiopia",
  defaultLeadOwnerEmail: process.env.ASLAL_DEFAULT_LEAD_OWNER_EMAIL || "info@aslaldigital.com",
  colors: { blue: "#D97706", gold: "#F59E0B", slate: "#1E293B", ice: "#F8FAFC" },
};

export const navItems = [
  { href: "/services", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/work", label: "Work" },
  { href: "/demo", label: "Automation Lab" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];
