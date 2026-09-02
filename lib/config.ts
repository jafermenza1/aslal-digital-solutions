export const siteConfig = {
  name: "Aslal Digital Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com",
  email: "info@aslaldigital.com",
  phone: "+251 911-276682",
  location: "Addis Ababa, Ethiopia",
  colors: {
    blue: "#0F3E8A",
    gold: "#E2B02A",
    slate: "#1E293B",
    ice: "#F8FAFC",
  },
};

export const navItems = [
  { href: "/services", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/work", label: "Work" },
  { href: "/demo", label: "Automation Lab" },
  { href: "/contact", label: "Contact" },
];
