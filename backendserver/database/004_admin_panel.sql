-- Admin panel content (member notices and scroll news) and site settings. Additive only.
CREATE TABLE IF NOT EXISTS lo_notices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('NOTICE','SCROLL') NOT NULL,
  title VARCHAR(190) NULL,
  content TEXT NOT NULL,
  show_from DATE NULL,
  show_to DATE NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  updated_by VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY (kind, is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO lo_settings (k, v) VALUES
 ('site_name','Life OS'),('site_slogan',''),('site_url',''),('site_email',''),
 ('login_status','1'),('signup_status','1'),('withdrawal_status','1'),('profile_edit_status','1'),
 ('withdraw_max','25000');
