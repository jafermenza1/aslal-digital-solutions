-- CE-8 demo provider profiles for the CE-7 demo service listings.
SET @demo_workspace_id = (
  SELECT id FROM workspaces WHERE active = 1 ORDER BY created_at ASC LIMIT 1
);

INSERT INTO professional_profiles
  (id,workspace_id,party_id,status,verification_level,display_name,headline,profession,
   specialties,service_categories,qualifications,service_areas,languages,portfolio,
   availability,pricing_model,starting_price,currency,response_time,bio,visibility,created_at,updated_at)
SELECT
  'd5000000-0000-4000-8000-000000000001', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000004', 'PUBLISHED', 'AUTHORIZED_PROVIDER',
  'Demo Ethiopia Digital Studio', 'Practical digital marketing for growing Ethiopian businesses',
  'Digital Marketing & Content Provider',
  JSON_ARRAY('social media management','content creation','analytics','campaign management'),
  JSON_ARRAY('Digital Marketing','Social Media','Content Creation'),
  JSON_ARRAY('Portfolio-based service experience','Campaign reporting workflow'),
  JSON_ARRAY('Addis Ababa','Remote Ethiopia'),
  JSON_ARRAY('English','Amharic','Afaan Oromoo'),
  JSON_ARRAY('SME social campaigns','Content calendars','Performance reporting'),
  JSON_OBJECT('mode','WEEKDAYS','hours','09:00-17:00','timezone','Africa/Addis_Ababa'),
  'MONTHLY', 35000, 'ETB', '1 business day',
  'Demo provider profile for the Aslal commercial-engine demonstration. Verification state is synthetic demo evidence.',
  'PUBLIC', NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM professional_profiles WHERE id='d5000000-0000-4000-8000-000000000001');

INSERT INTO professional_profiles
  (id,workspace_id,party_id,status,verification_level,display_name,headline,profession,
   specialties,service_categories,qualifications,service_areas,languages,portfolio,
   availability,pricing_model,starting_price,currency,response_time,bio,visibility,created_at,updated_at)
SELECT
  'd5000000-0000-4000-8000-000000000002', @demo_workspace_id,
  'd1000000-0000-4000-8000-000000000005', 'PUBLISHED', 'BUSINESS_VERIFIED',
  'Demo Hawassa Logistics Provider', 'Local delivery support for SME commerce',
  'Logistics & Delivery Provider',
  JSON_ARRAY('same-day delivery','last-mile logistics','proof of delivery'),
  JSON_ARRAY('Logistics & Delivery','Local Commerce'),
  JSON_ARRAY('Business delivery operations','Proof-of-delivery workflow'),
  JSON_ARRAY('Addis Ababa'),
  JSON_ARRAY('English','Amharic'),
  JSON_ARRAY('SME order delivery','Document delivery','Local dispatch'),
  JSON_OBJECT('mode','DAILY','hours','08:00-18:00','timezone','Africa/Addis_Ababa'),
  'PER_DELIVERY', 1800, 'ETB', 'Same day for confirmed orders',
  'Demo provider profile for the Aslal commercial-engine demonstration.',
  'PUBLIC', NOW(), NOW()
WHERE @demo_workspace_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM professional_profiles WHERE id='d5000000-0000-4000-8000-000000000002');

UPDATE commercial_listings
SET professional_profile_id='d5000000-0000-4000-8000-000000000001'
WHERE id='d2000000-0000-4000-8000-000000000004'
  AND professional_profile_id IS NULL;

UPDATE commercial_listings
SET professional_profile_id='d5000000-0000-4000-8000-000000000002'
WHERE id='d2000000-0000-4000-8000-000000000005'
  AND professional_profile_id IS NULL;
