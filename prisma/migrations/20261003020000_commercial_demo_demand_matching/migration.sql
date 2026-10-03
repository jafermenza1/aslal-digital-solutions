-- CE-7 demo seed: five commercial demand scenarios, five supply listings, and persisted matching examples.
-- This is intentionally a migration so a fresh/deployed environment receives demo data with the schema.
-- Data is scoped to the first active workspace; no cross-workspace records are created.

SET @demo_workspace_id = (
  SELECT id
  FROM workspaces
  WHERE active = 1
  ORDER BY created_at ASC
  LIMIT 1
);

-- If the database has no workspace yet, the migration safely inserts no demo records.
INSERT INTO commercial_parties
  (id, workspace_id, name, type, status, contact_name, description, created_at, updated_at)
SELECT
  'd1000000-0000-4000-8000-000000000001', @demo_workspace_id, 'Demo Addis Electronics Supplier',
  'SUPPLIER', 'ACTIVE', 'Demo Supply Desk', 'Demo supplier for electronics and office equipment.',
  NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM commercial_parties WHERE id = 'd1000000-0000-4000-8000-000000000001'
  );

INSERT INTO commercial_parties
  (id, workspace_id, name, type, status, contact_name, description, created_at, updated_at)
SELECT
  'd1000000-0000-4000-8000-000000000002', @demo_workspace_id, 'Demo Shashemene Furniture Supplier',
  'SUPPLIER', 'ACTIVE', 'Demo Furniture Desk', 'Demo supplier for furniture and workspace fit-out.',
  NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM commercial_parties WHERE id = 'd1000000-0000-4000-8000-000000000002'
  );

INSERT INTO commercial_parties
  (id, workspace_id, name, type, status, contact_name, description, created_at, updated_at)
SELECT
  'd1000000-0000-4000-8000-000000000003', @demo_workspace_id, 'Demo Hawassa Property Owner',
  'ASSET_OWNER', 'ACTIVE', 'Demo Property Desk', 'Demo commercial property owner.',
  NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM commercial_parties WHERE id = 'd1000000-0000-4000-8000-000000000003'
  );

INSERT INTO commercial_parties
  (id, workspace_id, name, type, status, contact_name, description, created_at, updated_at)
SELECT
  'd1000000-0000-4000-8000-000000000004', @demo_workspace_id, 'Demo Ethiopia Digital Studio',
  'SERVICE_PROVIDER', 'ACTIVE', 'Demo Studio Desk', 'Demo provider for digital marketing and content services.',
  NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM commercial_parties WHERE id = 'd1000000-0000-4000-8000-000000000004'
  );

INSERT INTO commercial_parties
  (id, workspace_id, name, type, status, contact_name, description, created_at, updated_at)
SELECT
  'd1000000-0000-4000-8000-000000000005', @demo_workspace_id, 'Demo Hawassa Logistics Provider',
  'SERVICE_PROVIDER', 'ACTIVE', 'Demo Logistics Desk', 'Demo provider for local delivery and logistics services.',
  NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM commercial_parties WHERE id = 'd1000000-0000-4000-8000-000000000005'
  );

-- Supply listings
INSERT INTO commercial_listings
  (id, workspace_id, owner_party_id, supplier_party_id, title, slug, listing_type, status,
   description, category, `condition`, location, asking_price, currency, price_label,
   request_quote, public_visible, featured, metadata, published_at, expires_at, created_at, updated_at)
SELECT
  'd2000000-0000-4000-8000-000000000001', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001',
  'Business Laptops — Core i5 Office Package', 'demo-business-laptops-core-i5',
  'PRODUCT', 'PUBLISHED',
  'Demo supply of reliable business laptops for SMEs, NGOs and office teams.',
  'Computers & Electronics', 'NEW', 'Addis Ababa', 52000, 'ETB', 'From ETB 52,000',
  true, true, true,
  JSON_OBJECT('demo', true, 'tags', JSON_ARRAY('laptop','office','SME','NGO')),
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_listings
  (id, workspace_id, owner_party_id, supplier_party_id, title, slug, listing_type, status,
   description, category, `condition`, location, asking_price, currency, price_label,
   request_quote, public_visible, featured, metadata, published_at, expires_at, created_at, updated_at)
SELECT
  'd2000000-0000-4000-8000-000000000002', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000002',
  'Office Desks and Chairs — SME Workspace Package', 'demo-office-desks-chairs-sme',
  'PRODUCT', 'PUBLISHED',
  'Demo office furniture package for growing businesses and nonprofit offices.',
  'Office Furniture', 'NEW', 'Shashemene', 185000, 'ETB', 'Package from ETB 185,000',
  true, true, false,
  JSON_OBJECT('demo', true, 'tags', JSON_ARRAY('desk','chair','office','SME')),
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_listings
  (id, workspace_id, owner_party_id, supplier_party_id, title, slug, listing_type, status,
   description, category, `condition`, location, asking_price, currency, price_label,
   inspection_required, request_quote, public_visible, featured, metadata, published_at, expires_at, created_at, updated_at)
SELECT
  'd2000000-0000-4000-8000-000000000003', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000003',
  'Commercial Office Space — Hawassa Central Area', 'demo-hawassa-commercial-office',
  'PROPERTY', 'PUBLISHED',
  'Demo commercial office space suitable for an SME branch, training center or service business.',
  'Commercial Property', 'AVAILABLE', 'Hawassa', 65000, 'ETB', 'Monthly rent ETB 65,000',
  true, true, true, true,
  JSON_OBJECT('demo', true, 'tags', JSON_ARRAY('office','property','Hawassa','commercial')),
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_listings
  (id, workspace_id, owner_party_id, supplier_party_id, title, slug, listing_type, status,
   description, category, `condition`, location, asking_price, currency, price_label,
   request_quote, public_visible, featured, metadata, published_at, expires_at, created_at, updated_at)
SELECT
  'd2000000-0000-4000-8000-000000000004', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000004',
  'Social Media Marketing & Content Package', 'demo-social-media-marketing-package',
  'SERVICE', 'PUBLISHED',
  'Demo monthly service package covering social media management, content creation and campaign reporting.',
  'Digital Marketing', 'PROFESSIONAL', 'Addis Ababa', 35000, 'ETB', 'Monthly from ETB 35,000',
  true, true, true,
  JSON_OBJECT('demo', true, 'tags', JSON_ARRAY('digital marketing','social media','content','analytics')),
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_listings
  (id, workspace_id, owner_party_id, supplier_party_id, title, slug, listing_type, status,
   description, category, `condition`, location, asking_price, currency, price_label,
   request_quote, public_visible, featured, metadata, published_at, expires_at, created_at, updated_at)
SELECT
  'd2000000-0000-4000-8000-000000000005', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000005',
  'Same-Day Local Delivery & SME Logistics Service', 'demo-local-delivery-logistics-service',
  'SERVICE', 'PUBLISHED',
  'Demo delivery service for business documents, products and local customer orders.',
  'Logistics & Delivery', 'PROFESSIONAL', 'Addis Ababa', 1800, 'ETB', 'From ETB 1,800 per delivery',
  true, true, false,
  JSON_OBJECT('demo', true, 'tags', JSON_ARRAY('delivery','logistics','SME','Addis Ababa')),
  NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

-- Wanted requests / demand
INSERT INTO commercial_requests
  (id, workspace_id, request_type, status, title, category, requested_item, description,
   quantity, condition_preference, budget_min, budget_max, currency, location, service_area,
   deadline, organization_name, contact_name, contact_email, contact_phone, contact_preference,
   privacy_visibility, source, specifications, published_at, qualified_at, created_at, updated_at)
SELECT
  'd3000000-0000-4000-8000-000000000001', @demo_workspace_id,
  'BUY_REQUEST', 'MATCHING',
  '20 business laptops for a growing SME team',
  'Computers & Electronics', 'Business laptops',
  'Looking for reliable business laptops for staff. Prefer new units with warranty and delivery in Addis Ababa.',
  20, 'NEW', 900000, 1150000, 'ETB', 'Addis Ababa', 'Addis Ababa',
  DATE_ADD(NOW(), INTERVAL 30 DAY), 'Demo SME Procurement',
  'Demo Procurement Officer', 'demo.procurement@example.test', '+251900000001', 'PHONE',
  'PUBLIC', 'DEMO',
  JSON_OBJECT('demo', true, 'requirements', JSON_ARRAY('Core i5 or equivalent','8GB+ RAM','256GB+ SSD','warranty')),
  NOW(), NOW(), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_requests
  (id, workspace_id, request_type, status, title, category, requested_item, description,
   quantity, condition_preference, budget_min, budget_max, currency, location, service_area,
   deadline, organization_name, contact_name, contact_email, contact_phone, contact_preference,
   privacy_visibility, source, specifications, published_at, qualified_at, created_at, updated_at)
SELECT
  'd3000000-0000-4000-8000-000000000002', @demo_workspace_id,
  'BUY_REQUEST', 'MATCHING',
  'Furniture package for a new nonprofit office',
  'Office Furniture', 'Office desks and chairs',
  'Need desks and ergonomic chairs for a new office in Shashemene. Delivery and installation are preferred.',
  30, 'NEW', 150000, 230000, 'ETB', 'Shashemene', 'Shashemene and nearby towns',
  DATE_ADD(NOW(), INTERVAL 45 DAY), 'Demo Nonprofit Organization',
  'Demo Operations Officer', 'demo.operations@example.test', '+251900000002', 'PHONE',
  'PUBLIC', 'DEMO',
  JSON_OBJECT('demo', true, 'requirements', JSON_ARRAY('30 workstations','durable','delivery','installation')),
  NOW(), NOW(), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_requests
  (id, workspace_id, request_type, status, title, category, requested_item, description,
   quantity, condition_preference, budget_min, budget_max, currency, location, service_area,
   deadline, organization_name, contact_name, contact_email, contact_phone, contact_preference,
   privacy_visibility, source, specifications, published_at, qualified_at, created_at, updated_at)
SELECT
  'd3000000-0000-4000-8000-000000000003', @demo_workspace_id,
  'ASSET_REQUEST', 'MATCHING',
  'Commercial office space needed in Hawassa',
  'Commercial Property', 'Office space',
  'Seeking a central office suitable for a small service company or training center in Hawassa.',
  1, 'AVAILABLE', 45000, 80000, 'ETB', 'Hawassa', 'Hawassa',
  DATE_ADD(NOW(), INTERVAL 60 DAY), 'Demo Service Business',
  'Demo Expansion Manager', 'demo.expansion@example.test', '+251900000003', 'PHONE',
  'PUBLIC', 'DEMO',
  JSON_OBJECT('demo', true, 'requirements', JSON_ARRAY('central location','office use','training room preferred')),
  NOW(), NOW(), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_requests
  (id, workspace_id, request_type, status, title, category, requested_item, description,
   quantity, condition_preference, budget_min, budget_max, currency, location, service_area,
   deadline, organization_name, contact_name, contact_email, contact_phone, contact_preference,
   privacy_visibility, source, specifications, published_at, qualified_at, created_at, updated_at)
SELECT
  'd3000000-0000-4000-8000-000000000004', @demo_workspace_id,
  'SERVICE_REQUEST', 'MATCHING',
  'Digital marketing and content support for an Ethiopian SME',
  'Digital Marketing', 'Social media marketing and content creation',
  'Need monthly social media management, content production and performance reporting for an Ethiopian SME.',
  1, 'PROFESSIONAL', 25000, 50000, 'ETB', 'Addis Ababa', 'Addis Ababa',
  DATE_ADD(NOW(), INTERVAL 21 DAY), 'Demo Retail SME',
  'Demo Marketing Manager', 'demo.marketing@example.test', '+251900000004', 'EMAIL',
  'PUBLIC', 'DEMO',
  JSON_OBJECT('demo', true, 'requirements', JSON_ARRAY('social media management','content creation','analytics','monthly reporting')),
  NOW(), NOW(), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_requests
  (id, workspace_id, request_type, status, title, category, requested_item, description,
   quantity, condition_preference, budget_min, budget_max, currency, location, service_area,
   deadline, organization_name, contact_name, contact_email, contact_phone, contact_preference,
   privacy_visibility, source, specifications, published_at, qualified_at, created_at, updated_at)
SELECT
  'd3000000-0000-4000-8000-000000000005', @demo_workspace_id,
  'RFP', 'MATCHING',
  'Local delivery partner for online SME orders',
  'Logistics & Delivery', 'Last-mile delivery service',
  'Looking for a dependable local delivery provider for customer orders within Addis Ababa, with same-day capability.',
  100, 'PROFESSIONAL', 1000, 2500, 'ETB', 'Addis Ababa', 'Addis Ababa',
  DATE_ADD(NOW(), INTERVAL 28 DAY), 'Demo Online SME',
  'Demo Operations Manager', 'demo.logistics@example.test', '+251900000005', 'PHONE',
  'PUBLIC', 'DEMO',
  JSON_OBJECT('demo', true, 'requirements', JSON_ARRAY('same-day delivery','order tracking','proof of delivery','business rates')),
  NOW(), NOW(), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

-- Persisted CE-7 match examples. These are intentionally deterministic demo records,
-- allowing the dashboard to show matching immediately after migration without running the evaluator.
INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000001', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000001', 'd2000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001', 'SUGGESTED', 96,
  JSON_OBJECT('type',20,'category',18,'item',25,'location',12,'serviceArea',8,'condition',5,'budget',8,'deadline',0),
  JSON_ARRAY('Product type matches the buying request.','Category and requested item strongly overlap.','Listing is available in Addis Ababa.','Asking price is within the requested budget range.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000002', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000001', 'd2000000-0000-4000-8000-000000000002',
  'd1000000-0000-4000-8000-000000000002', 'SUGGESTED', 42,
  JSON_OBJECT('type',20,'category',12,'item',5,'location',2,'serviceArea',0,'condition',3,'budget',0,'deadline',0),
  JSON_ARRAY('Both are business procurement needs.','Office category is related but not the requested product.','Location differs from the request.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000003', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000002', 'd2000000-0000-4000-8000-000000000002',
  'd1000000-0000-4000-8000-000000000002', 'SHORTLISTED', 94,
  JSON_OBJECT('type',20,'category',18,'item',25,'location',12,'serviceArea',8,'condition',5,'budget',6,'deadline',0),
  JSON_ARRAY('Product type and office-furniture category match.','Requested desks and chairs match the listing.','Supplier is located in Shashemene.','Package price overlaps the requested budget.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000004', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000003', 'd2000000-0000-4000-8000-000000000003',
  'd1000000-0000-4000-8000-000000000003', 'SUGGESTED', 98,
  JSON_OBJECT('type',20,'category',18,'item',25,'location',12,'serviceArea',8,'condition',5,'budget',10,'deadline',0),
  JSON_ARRAY('Property type and commercial-property category match.','Office-space requirement matches the listing.','Both are in Hawassa.','Monthly asking price is within budget.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000005', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000004', 'd2000000-0000-4000-8000-000000000004',
  'd1000000-0000-4000-8000-000000000004', 'CONTACTED', 97,
  JSON_OBJECT('type',20,'category',18,'item',25,'location',12,'serviceArea',8,'condition',5,'budget',9,'deadline',0),
  JSON_ARRAY('Service type and digital-marketing category match.','Requested social media and content services match the package.','Provider serves Addis Ababa.','Monthly price fits the requested budget.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000006', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000004', 'd2000000-0000-4000-8000-000000000005',
  'd1000000-0000-4000-8000-000000000005', 'SUGGESTED', 34,
  JSON_OBJECT('type',20,'category',5,'item',3,'location',4,'serviceArea',2,'condition',0,'budget',0,'deadline',0),
  JSON_ARRAY('Both are service listings.','Location matches but the service category differs.','Candidate is logistics rather than digital marketing.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000007', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000005', 'd2000000-0000-4000-8000-000000000005',
  'd1000000-0000-4000-8000-000000000005', 'SHORTLISTED', 95,
  JSON_OBJECT('type',20,'category',18,'item',25,'location',12,'serviceArea',8,'condition',5,'budget',7,'deadline',0),
  JSON_ARRAY('Service listing matches the RFP.','Logistics and delivery category matches.','Same-day delivery requirement is reflected in the listing.','Provider serves Addis Ababa and price is compatible with the budget.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;

INSERT INTO commercial_matches
  (id, workspace_id, request_id, listing_id, supplier_party_id, status, score,
   score_breakdown, reasons, evaluated_at, expires_at, created_at, updated_at)
SELECT
  'd4000000-0000-4000-8000-000000000008', @demo_workspace_id,
  'd3000000-0000-4000-8000-000000000005', 'd2000000-0000-4000-8000-000000000004',
  'd1000000-0000-4000-8000-000000000004', 'SUGGESTED', 31,
  JSON_OBJECT('type',20,'category',4,'item',3,'location',4,'serviceArea',0,'condition',0,'budget',0,'deadline',0),
  JSON_ARRAY('Both are service offerings.','Location matches but the candidate is digital marketing rather than delivery.'),
  NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL;
