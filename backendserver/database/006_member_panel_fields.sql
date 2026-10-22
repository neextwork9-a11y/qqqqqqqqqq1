-- Additive fields for controls already displayed in the member panel.
ALTER TABLE user_profiles ADD COLUMN ward_no VARCHAR(30) NULL;
ALTER TABLE user_profiles ADD COLUMN union_name VARCHAR(100) NULL;
ALTER TABLE user_profiles ADD COLUMN upazila VARCHAR(100) NULL;
ALTER TABLE lo_withdrawals ADD COLUMN member_note VARCHAR(1000) NULL;