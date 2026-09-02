import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const products = [
  ["crm-pro", "CRM Pro", "Aslal Digital Solutions", "AFFILIATE", "A practical customer and sales management system for growing teams.", "Connect leads, sales activity and follow-up into one workflow.", "Request quote", 1],
  ["commerce-stack", "Commerce Stack", "Aslal Digital Solutions", "CUSTOM", "E-commerce, payments and customer journeys designed around your business.", "Build a localized commerce experience with integrations and automation.", "Request quote", 1],
  ["sales-automation", "Sales Automation", "Aslal Digital Solutions", "CUSTOM", "WhatsApp, Telegram and website automation for faster lead response.", "Qualify, route and follow up with prospects across digital channels.", "Request quote", 1]
];

for (const [slug, name, provider, relationship, shortDescription, description, price, featured] of products) {
  await pool.execute(
    `INSERT INTO products (id, slug, name, provider_name, relationship_type, short_description, description, starting_price, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name), short_description=VALUES(short_description), description=VALUES(description), provider_name=VALUES(provider_name), relationship_type=VALUES(relationship_type), featured=VALUES(featured)`,
    [randomUUID(), slug, name, provider, relationship, shortDescription, description, price, featured]
  );
}

console.log("Seed complete.");
await pool.end();
