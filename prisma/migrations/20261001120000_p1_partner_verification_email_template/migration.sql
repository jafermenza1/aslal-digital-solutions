INSERT INTO email_templates
(id,template_key,name,subject_template,html_template,text_template,transactional,active,updated_by,created_at,updated_at)
VALUES
(
 '9e2f1b10-6d9d-4f4e-9d55-2d0c4a2f7c11',
 'partner.account.verify',
 'Partner account email verification',
 'Verify your Aslal Partner account',
 '<p>Hello {{name}},</p><p>Verify your Aslal Partner account to activate access.</p><p><a href="{{verificationUrl}}">Verify email</a></p><p>This link expires in 24 hours.</p>',
 'Hello {{name}}, verify your Aslal Partner account: {{verificationUrl}} This link expires in 24 hours.',
 1,1,'p1-r',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
name=VALUES(name),
subject_template=VALUES(subject_template),
html_template=VALUES(html_template),
text_template=VALUES(text_template),
transactional=VALUES(transactional),
active=VALUES(active),
updated_by=VALUES(updated_by),
updated_at=CURRENT_TIMESTAMP;