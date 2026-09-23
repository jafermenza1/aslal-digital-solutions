-- Ensure the canonical public Aslal catalog includes the five commercial offerings.
-- This is additive and idempotent: existing catalog rows with these slugs retain their IDs.
INSERT INTO products (
  id, slug, name, kind, provider_name, relationship_type, tagline,
  short_description, description, starting_price, cta_label, cta_note,
  sort_order, featured, active
) VALUES
(
  UUID(), 'web-development', 'Web Development', 'SERVICE',
  'Aslal Digital Solutions', 'OWNED', 'Websites that work as growth systems.',
  'Website development, e-commerce, landing pages, web applications and customer portals.',
  'Website development, e-commerce, landing pages, web applications and customer portals.',
  'Request a quote', 'Explore',
  'Tell us what you need and the request will enter the normal Aslal sales workflow.',
  10, 1, 1
),
(
  UUID(), 'software-marketplace', 'Software Marketplace', 'PRODUCT',
  'Aslal Digital Solutions', 'AFFILIATE', 'Proven software, locally implemented.',
  'Sell existing or affiliated software products, then customize, integrate and implement them for clients.',
  'Sell existing or affiliated software products, then customize, integrate and implement them for clients.',
  'Request a quote', 'Explore',
  'Tell us what you need and the request will enter the normal Aslal sales workflow.',
  20, 1, 1
),
(
  UUID(), 'content-creation', 'Content Creation', 'SERVICE',
  'Aslal Digital Solutions', 'OWNED', 'Content built to move attention toward action.',
  'Campaign creative, social content, video direction, copy and conversion-focused storytelling.',
  'Campaign creative, social content, video direction, copy and conversion-focused storytelling.',
  'Request a quote', 'Explore',
  'Tell us what you need and the request will enter the normal Aslal sales workflow.',
  30, 1, 1
),
(
  UUID(), 'ecommerce-payments', 'E-commerce & Payments', 'SERVICE',
  'Aslal Digital Solutions', 'CUSTOM', 'Commerce journeys designed for local reality.',
  'Commerce journeys and localized payment integration designed for the Ethiopian market.',
  'Commerce journeys and localized payment integration designed for the Ethiopian market.',
  'Request a quote', 'Explore',
  'Tell us what you need and the request will enter the normal Aslal sales workflow.',
  40, 1, 1
),
(
  UUID(), 'crm-lead-systems', 'CRM & Lead Systems', 'SERVICE',
  'Aslal Digital Solutions', 'OWNED', 'Capture demand and keep sales moving.',
  'Lead capture, sales pipelines, qualification, follow-up and reporting.',
  'Lead capture, sales pipelines, qualification, follow-up and reporting.',
  'Request a quote', 'Explore',
  'Tell us what you need and the request will enter the normal Aslal sales workflow.',
  50, 1, 1
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  kind = VALUES(kind),
  provider_name = VALUES(provider_name),
  relationship_type = VALUES(relationship_type),
  tagline = VALUES(tagline),
  short_description = VALUES(short_description),
  description = VALUES(description),
  cta_label = VALUES(cta_label),
  cta_note = VALUES(cta_note),
  sort_order = VALUES(sort_order),
  featured = VALUES(featured),
  active = VALUES(active);
