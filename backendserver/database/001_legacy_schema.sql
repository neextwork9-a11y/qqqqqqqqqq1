-- ============================================================
-- Life OS Bangladesh - Complete Database Schema
-- Generated: 2026-10-07
-- Database Engine: MySQL 8.0+ / MariaDB 10.4+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


-- --------------------------------------------------------
-- Table structure for `activation_point_transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `activation_point_transactions`;
CREATE TABLE `activation_point_transactions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `amount` int(11) NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'credit',
  `note` varchar(255) DEFAULT NULL,
  `admin_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `activation_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `activation_requests`;
CREATE TABLE `activation_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT 1000.00,
  `method` varchar(50) NOT NULL,
  `sender_number` varchar(50) DEFAULT NULL,
  `trx_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `admin_messages`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `admin_messages`;
CREATE TABLE `admin_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receiver_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `admin_roles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `admin_roles`;
CREATE TABLE `admin_roles` (
  `id` int(10) unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  `color` varchar(20) DEFAULT '#050f3d',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `admin_users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(10) unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` int(10) unsigned NOT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `ai_suggestions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ai_suggestions`;
CREATE TABLE `ai_suggestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(60) NOT NULL,
  `prompt_text` varchar(255) NOT NULL,
  `icon_class` varchar(50) DEFAULT 'fa-lightbulb',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `api_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `api_logs`;
CREATE TABLE `api_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `endpoint` varchar(255) NOT NULL,
  `request_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_payload`)),
  `response_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_payload`)),
  `status_code` int(11) NOT NULL,
  `latency_ms` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `audit_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `audit_user_bonus_summary`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `audit_user_bonus_summary`;
CREATE TABLE `audit_user_bonus_summary` (
  `user_id` int(10) unsigned NOT NULL,
  `matching_bonus` decimal(14,2) DEFAULT 0.00,
  `generation_bonus` decimal(14,2) DEFAULT 0.00,
  `refer_bonus` decimal(14,2) DEFAULT 0.00,
  `cashback_bonus` decimal(14,2) DEFAULT 0.00,
  `admin_bonus` decimal(14,2) DEFAULT 0.00,
  `total_bonus` decimal(14,2) DEFAULT 0.00,
  `binary_pairs` int(11) DEFAULT 0,
  `enrollment_pairs` int(11) DEFAULT 0,
  `best_tree_pairs` int(11) DEFAULT 0,
  `best_tree_type` varchar(30) DEFAULT 'Binary',
  `exp_daily_cap_matching` decimal(14,2) DEFAULT 0.00,
  `matching_diff` decimal(14,2) DEFAULT 0.00,
  `exp_generation` decimal(14,2) DEFAULT 0.00,
  `exp_refer` decimal(14,2) DEFAULT 0.00,
  `exp_cashback` decimal(14,2) DEFAULT 0.00,
  `total_expected_daily_cap` decimal(14,2) DEFAULT 0.00,
  `extra_daily_cap` decimal(14,2) DEFAULT 0.00,
  `daily_matching_excess` decimal(14,2) DEFAULT 0.00,
  `daily_over_days_cnt` int(11) DEFAULT 0,
  `p2p_sent` decimal(14,2) DEFAULT 0.00,
  `p2p_received` decimal(14,2) DEFAULT 0.00,
  `tx_count` int(11) DEFAULT 0,
  PRIMARY KEY (`user_id`),
  KEY `idx_tot` (`total_bonus`),
  KEY `idx_extra_daily` (`extra_daily_cap`),
  KEY `idx_match_ex` (`daily_matching_excess`),
  KEY `idx_match_diff` (`matching_diff`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------
-- Table structure for `b2b_api_keys`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `b2b_api_keys`;
CREATE TABLE `b2b_api_keys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) NOT NULL,
  `partner_name` varchar(120) NOT NULL,
  `api_key` varchar(100) NOT NULL,
  `secret_key` varchar(100) NOT NULL,
  `environment` enum('sandbox','production') DEFAULT 'sandbox',
  `status` enum('active','revoked') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `bank_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `bank_requests`;
CREATE TABLE `bank_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `type` enum('account_open','loan','card','deposit') DEFAULT 'account_open',
  `bank_name` varchar(80) DEFAULT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `status` enum('pending','processing','approved','rejected') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `banners`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `badge_text` varchar(100) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `subtitle` varchar(100) DEFAULT NULL,
  `button_text` varchar(50) DEFAULT 'Explore Now',
  `button_link` varchar(255) DEFAULT '#',
  `banner_type` enum('gradient','invite') DEFAULT 'gradient',
  `icon_class` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `commission_settlements`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `commission_settlements`;
CREATE TABLE `commission_settlements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `commission_type` enum('Partner Commission','Service Fee','Referral Commission') DEFAULT 'Partner Commission',
  `status` enum('pending','settled','failed') DEFAULT 'pending',
  `settlement_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `consent_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `consent_history`;
CREATE TABLE `consent_history` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `partner_name` varchar(255) NOT NULL,
  `data_shared` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data_shared`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `education_enrollments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `education_enrollments`;
CREATE TABLE `education_enrollments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `course_name` varchar(120) DEFAULT NULL,
  `institution` varchar(100) DEFAULT NULL,
  `type` varchar(40) DEFAULT 'online',
  `status` enum('pending','active','completed','cancelled') DEFAULT 'pending',
  `fee` decimal(10,2) DEFAULT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `external_partners`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `external_partners`;
CREATE TABLE `external_partners` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `api_endpoint` varchar(255) NOT NULL,
  `auth_type` enum('OAuth2','JWT','API Key') DEFAULT 'API Key',
  `api_key` varchar(255) DEFAULT NULL,
  `secret_key` varchar(255) DEFAULT NULL,
  `webhook_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','testing') DEFAULT 'testing',
  `priority` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `flushed_matching_bonuses`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `flushed_matching_bonuses`;
CREATE TABLE `flushed_matching_bonuses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `health_appointments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `health_appointments`;
CREATE TABLE `health_appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `doctor_name` varchar(80) DEFAULT NULL,
  `hospital` varchar(100) DEFAULT NULL,
  `appointment_date` datetime DEFAULT NULL,
  `type` varchar(40) DEFAULT 'consultation',
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `fee` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `income_types`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `income_types`;
CREATE TABLE `income_types` (
  `id` tinyint(3) unsigned NOT NULL,
  `title_en` varchar(80) NOT NULL,
  `title_bn` varchar(80) DEFAULT NULL,
  `description_bn` text DEFAULT NULL,
  `sort_order` tinyint(3) unsigned NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `insurance_policies`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `insurance_policies`;
CREATE TABLE `insurance_policies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `policy_no` varchar(40) DEFAULT NULL,
  `provider` varchar(80) DEFAULT NULL,
  `type` varchar(40) DEFAULT 'life',
  `premium` decimal(10,2) DEFAULT NULL,
  `sum_assured` decimal(14,2) DEFAULT NULL,
  `status` enum('pending','active','lapsed','cancelled') DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `live_chat`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `live_chat`;
CREATE TABLE `live_chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `sender_type` enum('user','admin') NOT NULL,
  `message` text DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `loan_refund_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `loan_refund_logs`;
CREATE TABLE `loan_refund_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(50) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) NOT NULL,
  `refund_amount` decimal(14,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'frozen',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=975 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `loan_reset_backup`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `loan_reset_backup`;
CREATE TABLE `loan_reset_backup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(50) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) NOT NULL,
  `old_loan_recovery_active` tinyint(4) NOT NULL DEFAULT 0,
  `old_loan_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `old_loan_paid` decimal(14,2) NOT NULL DEFAULT 0.00,
  `old_wallet_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'reset',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_batch` (`batch_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `matching_adjustments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_adjustments`;
CREATE TABLE `matching_adjustments` (
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) NOT NULL,
  `old_flat_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `new_level_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `already_paid` decimal(14,2) NOT NULL DEFAULT 0.00,
  `old_pending` decimal(14,2) NOT NULL DEFAULT 0.00,
  `new_pending` decimal(14,2) NOT NULL DEFAULT 0.00,
  `excess_deducted` decimal(14,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'adjusted',
  `adjusted_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `matching_carry_forward`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_carry_forward`;
CREATE TABLE `matching_carry_forward` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL COMMENT 'αª»αª╛αª░ carry forward BV',
  `leg` enum('left','right') NOT NULL,
  `bv_carried` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Carried forward BV amount',
  `bv_used` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αª¬αª░αª¼αª░αºìαªñαºÇ matching-αªÅ αª¼αºìαª»αª¼αª╣αª╛αª░ αª╣αª»αª╝αºçαª¢αºç',
  `bv_remaining` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αªÅαªûαª¿αºï unused',
  `source_event_id` bigint(20) unsigned DEFAULT NULL COMMENT 'αªòαºïαª¿ event-αªÅαª░ αª¬αª░ carry αª╣αª»αª╝αºçαª¢αºç',
  `status` enum('active','used','expired') NOT NULL DEFAULT 'active',
  `carry_date` date NOT NULL,
  `used_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Carry forward BV after pair matching. Strong/Weak excess BV stored here.';

-- --------------------------------------------------------
-- Table structure for `matching_daily_caps`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_daily_caps`;
CREATE TABLE `matching_daily_caps` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `cap_date` date NOT NULL COMMENT 'αªòαºïαª¿ αªªαª┐αª¿αºçαª░ cap',
  `cap_limit` decimal(14,2) NOT NULL DEFAULT 5000.00 COMMENT 'Maximum for this day',
  `used_amount` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αªåαª£αªòαºç αªòαªñαªƒαºüαªòαºü αª¼αºìαª»αª¼αª╣αª╛αª░ αª╣αª»αª╝αºçαª¢αºç',
  `remaining` decimal(14,2) NOT NULL DEFAULT 5000.00 COMMENT 'αªòαªñαªƒαºüαªòαºü αª¼αª╛αªòαª┐ αªåαª¢αºç',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1883 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily matching income cap per member. Resets at midnight.';

-- --------------------------------------------------------
-- Table structure for `matching_events`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_events`;
CREATE TABLE `matching_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `upline_user_id` int(10) unsigned NOT NULL COMMENT 'αª»αºç upline commission αª¬αª╛αª¼αºçαª¿',
  `upline_level` tinyint(3) unsigned NOT NULL DEFAULT 1 COMMENT 'Upline level (1-5)',
  `reservoir_id` bigint(20) unsigned NOT NULL COMMENT 'αªòαºïαª¿ reservoir αªÑαºçαªòαºç payout αª╣αª¼αºç',
  `activation_user_id` int(10) unsigned NOT NULL COMMENT 'αª»αª╛αª░ activation trigger αªòαª░αºçαª¢αºç',
  `strong_leg_user_id` int(10) unsigned DEFAULT NULL COMMENT 'Strong leg network member',
  `weak_leg_user_id` int(10) unsigned DEFAULT NULL COMMENT 'Weak leg network member',
  `strong_leg_bv` decimal(14,2) NOT NULL COMMENT 'Strong leg total BV',
  `weak_leg_bv` decimal(14,2) NOT NULL COMMENT 'Weak leg total BV',
  `matched_bv` decimal(14,2) NOT NULL COMMENT 'MIN(strong_leg_bv, weak_leg_bv)',
  `matching_rate_pct` decimal(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Applied rate (%)',
  `calculated_commission` decimal(14,2) NOT NULL COMMENT 'matched_bv ├ù rate/100',
  `available_reserve` decimal(14,2) NOT NULL COMMENT 'Reserve available at event time',
  `daily_cap_remaining` decimal(14,2) NOT NULL COMMENT 'Daily cap remaining at event time',
  `final_payout` decimal(14,2) NOT NULL COMMENT 'MIN(calculated, reserve, cap)',
  `status` enum('pending','approved','paid','rejected','skipped') NOT NULL DEFAULT 'pending',
  `rejection_reason` varchar(255) DEFAULT NULL,
  `event_date` date NOT NULL COMMENT 'Matching date',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5594 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Every pair formation event. Final payout = MIN(calculated, reserve, daily_cap).';

-- --------------------------------------------------------
-- Table structure for `matching_forgiven_excess`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_forgiven_excess`;
CREATE TABLE `matching_forgiven_excess` (
  `user_id` int(10) unsigned NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `matching_payouts`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_payouts`;
CREATE TABLE `matching_payouts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_id` bigint(20) unsigned NOT NULL,
  `reservoir_id` bigint(20) unsigned DEFAULT NULL,
  `recipient_id` bigint(20) unsigned NOT NULL,
  `amount_approved` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reserve_before` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reserve_after` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reserve_status` varchar(20) DEFAULT NULL,
  `wallet_txn_id` bigint(20) unsigned DEFAULT NULL,
  `note` text DEFAULT NULL,
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `matching_reservoirs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `matching_reservoirs`;
CREATE TABLE `matching_reservoirs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `activation_user_id` int(10) unsigned NOT NULL COMMENT 'αª»αºç user activate αªòαª░αºçαª¢αºç',
  `package_amount` decimal(14,2) NOT NULL DEFAULT 1000.00 COMMENT 'Package price (αº│1,000)',
  `reserve_pct` decimal(5,2) NOT NULL DEFAULT 30.00 COMMENT 'Reserve percentage (30%)',
  `reserve_total` decimal(14,2) NOT NULL COMMENT 'Total reserve = package ├ù reserve_pct/100',
  `reserve_used` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αªòαªñαªƒαºüαªòαºü αª¼αºìαª»αª¼αª╣αª╛αª░ αª╣αª»αª╝αºçαª¢αºç',
  `reserve_remaining` decimal(14,2) NOT NULL COMMENT 'αªòαªñαªƒαºüαªòαºü αª¼αª╛αªòαª┐ αªåαª¢αºç',
  `status` enum('open','exhausted','cancelled') NOT NULL DEFAULT 'open',
  `activated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `exhausted_at` timestamp NULL DEFAULT NULL COMMENT 'αªòαªûαª¿ reserve αª╢αºçαª╖ αª╣αª»αª╝αºçαª¢αºç',
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7463 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-activation matching reserve pool. Total paid can NEVER exceed reserve_total.';

-- --------------------------------------------------------
-- Table structure for `mfs_providers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `mfs_providers`;
CREATE TABLE `mfs_providers` (
  `id` smallint(5) unsigned NOT NULL,
  `name` varchar(40) NOT NULL,
  `slug` varchar(40) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `network_bv_ledger`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `network_bv_ledger`;
CREATE TABLE `network_bv_ledger` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL COMMENT 'αª»αª╛αª░ BV αª▓αºçαª£αª╛αª░',
  `leg` enum('left','right') NOT NULL COMMENT 'Left = Strong/Weak αª╣αª¼αºç comparison-αªÅ',
  `bv_added` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αªÅαªç entry-αªñαºç αª»αºïαªù αª╣αªôαª»αª╝αª╛ BV',
  `bv_cumulative` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'αªÅαªç leg-αªÅ total cumulative BV',
  `carry_forward_bv` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Carry forward BV (matched pair-αªÅαª░ αª¬αª░ αª¼αª╛αªòαª┐)',
  `source_user_id` int(10) unsigned DEFAULT NULL COMMENT 'αªòαºïαª¿ user-αªÅαª░ activation αªÑαºçαªòαºç αªÅαªç BV',
  `reservoir_id` bigint(20) unsigned DEFAULT NULL COMMENT 'αªòαºïαª¿ reservoir-αªÅαª░ αª╕αª╛αªÑαºç linked',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Strong/Weak leg BV accumulation ledger for each network member.';

-- --------------------------------------------------------
-- Table structure for `notifications_queue`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `notifications_queue`;
CREATE TABLE `notifications_queue` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `channel` enum('Push','SMS','Email','In-App') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `retry_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `offers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `discount_badge` varchar(20) NOT NULL,
  `icon_class` varchar(50) DEFAULT 'fa-tags text-gold',
  `bg_class` varchar(50) DEFAULT 'bg-dark',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `password_reset_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `password_reset_requests`;
CREATE TABLE `password_reset_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `life_id` varchar(20) NOT NULL,
  `email` varchar(120) NOT NULL,
  `status` enum('pending','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------
-- Table structure for `payment_gateways`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `payment_gateways`;
CREATE TABLE `payment_gateways` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(30) NOT NULL,
  `name` varchar(80) NOT NULL,
  `type` enum('MFS','Bank','Aggregator','Card') NOT NULL,
  `fee_pct` decimal(5,2) DEFAULT 0.00,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `priority` tinyint(3) unsigned DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `point_activated_ids`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `point_activated_ids`;
CREATE TABLE `point_activated_ids` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `operator_user_id` int(10) unsigned NOT NULL,
  `target_user_id` int(10) unsigned NOT NULL,
  `target_life_id` varchar(50) NOT NULL,
  `points_used` int(10) unsigned NOT NULL DEFAULT 1000,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_operator` (`operator_user_id`),
  KEY `idx_target` (`target_user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `quick_access_items`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `quick_access_items`;
CREATE TABLE `quick_access_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `icon_class` varchar(50) NOT NULL,
  `color_class` varchar(30) NOT NULL,
  `link_url` varchar(255) DEFAULT '#',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `rank_reward_funds`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `rank_reward_funds`;
CREATE TABLE `rank_reward_funds` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `activation_user_id` int(10) unsigned NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT 200.00,
  `status` enum('allocated','disbursed') NOT NULL DEFAULT 'allocated',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rrf_user` (`activation_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `ranks`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ranks`;
CREATE TABLE `ranks` (
  `id` tinyint(3) unsigned NOT NULL,
  `name_en` varchar(60) NOT NULL,
  `name_bn` varchar(80) DEFAULT NULL,
  `criteria_bn` text DEFAULT NULL,
  `reward_en` text DEFAULT NULL,
  `color_hex` varchar(10) DEFAULT '#050f3d',
  `sort_order` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `required_directs` int(11) NOT NULL DEFAULT 0,
  `required_pairs` int(11) NOT NULL DEFAULT 0,
  `reward_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `service_categories`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `service_categories`;
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `service_items`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `service_items`;
CREATE TABLE `service_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` smallint(5) unsigned NOT NULL,
  `label_en` varchar(120) NOT NULL,
  `label_bn` varchar(120) DEFAULT NULL,
  `sort_order` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `services`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` smallint(5) unsigned NOT NULL,
  `slug` varchar(60) NOT NULL,
  `title_en` varchar(80) NOT NULL,
  `title_bn` varchar(80) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(60) DEFAULT NULL,
  `sort_order` smallint(5) unsigned NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `category_slug` varchar(50) DEFAULT 'finance'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `shopping_orders`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `shopping_orders`;
CREATE TABLE `shopping_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `merchant_name` varchar(100) DEFAULT NULL,
  `items_count` int(10) unsigned DEFAULT 1,
  `total` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `system_settings`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` mediumtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `travel_bookings`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `travel_bookings`;
CREATE TABLE `travel_bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `type` enum('flight','bus','train','hotel','launch') DEFAULT 'bus',
  `from_location` varchar(80) DEFAULT NULL,
  `to_location` varchar(80) DEFAULT NULL,
  `travel_date` date DEFAULT NULL,
  `passengers` tinyint(3) unsigned DEFAULT 1,
  `fare` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `usage_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `usage_history`;
CREATE TABLE `usage_history` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_enrollment_watermarks`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_enrollment_watermarks`;
CREATE TABLE `user_enrollment_watermarks` (
  `user_id` int(11) NOT NULL,
  `consumed_pairs` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_notifications`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_notifications`;
CREATE TABLE `user_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'general',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_life_id` (`life_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB AUTO_INCREMENT=5250 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_profiles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `name_en` varchar(120) DEFAULT NULL,
  `name_bn` varchar(120) DEFAULT NULL,
  `father_name` varchar(120) DEFAULT NULL,
  `mother_name` varchar(120) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `marital_status` varchar(30) DEFAULT NULL,
  `occupation` varchar(80) DEFAULT NULL,
  `nationality` varchar(60) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `religion` varchar(40) DEFAULT NULL,
  `photo_base64` mediumtext DEFAULT NULL,
  `nid_number` varchar(30) DEFAULT NULL,
  `nid_front_base64` mediumtext DEFAULT NULL,
  `nid_back_base64` mediumtext DEFAULT NULL,
  `selfie_base64` mediumtext DEFAULT NULL,
  `kyc_status` enum('not-started','pending','verified') NOT NULL DEFAULT 'not-started',
  `address_current` text DEFAULT NULL,
  `address_permanent` text DEFAULT NULL,
  `phone_alt` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(120) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `bank_name` varchar(80) DEFAULT NULL,
  `bank_account` varchar(40) DEFAULT NULL,
  `mfs_provider` varchar(30) DEFAULT NULL,
  `mfs_number` varchar(20) DEFAULT NULL,
  `nominee_name` varchar(80) DEFAULT NULL,
  `nominee_relation` varchar(40) DEFAULT NULL,
  `spouse_name` varchar(80) DEFAULT NULL,
  `children_count` tinyint(3) unsigned DEFAULT 0,
  `education_level` varchar(60) DEFAULT NULL,
  `workplace` varchar(120) DEFAULT NULL,
  `designation` varchar(80) DEFAULT NULL,
  `business_name` varchar(120) DEFAULT NULL,
  `membership_type` enum('free','founder') NOT NULL DEFAULT 'free',
  `completion_pct` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fin_monthly_tx` varchar(60) DEFAULT NULL,
  `fin_annual_tx` varchar(60) DEFAULT NULL,
  `fin_source_funds` varchar(120) DEFAULT NULL,
  `fin_source_wealth` varchar(120) DEFAULT NULL,
  `fin_income_range` varchar(60) DEFAULT NULL,
  `fin_acc_purpose` varchar(120) DEFAULT NULL,
  `tax_tin` varchar(60) DEFAULT NULL,
  `tax_residency` varchar(80) DEFAULT NULL,
  `comp_is_pep` tinyint(1) DEFAULT 0,
  `comp_aml_consent` tinyint(1) DEFAULT 0,
  `comp_signature` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13766 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_rewards`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_rewards`;
CREATE TABLE `user_rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `points` int(11) DEFAULT 0,
  `cashback_balance` decimal(15,2) DEFAULT 0.00,
  `pending_bills` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_wallets`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_wallets`;
CREATE TABLE `user_wallets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `frozen_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `pending_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `service_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cashback_balance` decimal(14,2) DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'BDT',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=111659 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `life_id` varchar(20) NOT NULL,
  `membership_no` varchar(20) NOT NULL,
  `referral_code` varchar(20) NOT NULL,
  `referred_by` varchar(20) DEFAULT NULL,
  `placement_id` int(10) unsigned DEFAULT NULL,
  `position` enum('left','right') DEFAULT NULL,
  `left_count` int(11) DEFAULT 0,
  `right_count` int(11) DEFAULT 0,
  `total_pairs` int(11) DEFAULT 0,
  `consumed_rank_pairs` int(11) DEFAULT 0,
  `phone` varchar(20) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `pin_hash` varchar(255) NOT NULL,
  `transaction_password_hash` varchar(255) DEFAULT NULL,
  `rank_id` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `status` enum('active','suspended','pending') NOT NULL DEFAULT 'pending',
  `accepted_terms` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `points` int(10) unsigned DEFAULT 0,
  `activation_points` int(10) unsigned NOT NULL DEFAULT 0,
  `loan_recovery_active` tinyint(1) DEFAULT 0,
  `loan_amount` decimal(12,2) DEFAULT 0.00,
  `loan_paid` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23976 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `wallet_quick_actions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `wallet_quick_actions`;
CREATE TABLE `wallet_quick_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `icon_class` varchar(50) NOT NULL,
  `color_class` varchar(30) DEFAULT '',
  `link_url` varchar(255) DEFAULT '#',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `wallet_transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `type` enum('credit','debit','pending') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `ref_id` varchar(80) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `wallet_id` int(10) unsigned DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `status` varchar(50) NOT NULL DEFAULT 'completed',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_type` (`type`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=244297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `withdraw_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `withdraw_requests`;
CREATE TABLE `withdraw_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `life_id` varchar(50) NOT NULL,
  `method` varchar(50) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `charge` decimal(14,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(14,2) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_life_id` (`life_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Default Data Seed for `ranks`
-- --------------------------------------------------------

INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('1', 'Entrepreneur', 'উদ্যোক্তা', 'Active Account', 'Digital Certificate, Welcome Kit + ID Card', '#3186aa', '1', '0', '0', '0.00', '', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('2', 'Bronze Executive', 'ব্রোঞ্জ এক্সিকিউটিভ', '৫০টি একটিভ ইউজার পেয়ার', 'Cox’s Bazar Tour', '#cd7f32', '2', '0', '50', '0.00', '50 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('3', 'Silver Executive', 'সিলভার এক্সিকিউটিভ', '১০০টি একটিভ ইউজার পেয়ার', 'Brand New Smart Phone', '#a0a0a0', '3', '0', '100', '0.00', '100 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('4', 'Gold Executive', 'গোল্ড এক্সিকিউটিভ', '৩০০টি একটিভ ইউজার পেয়ার', 'Brand New Android Phone', '#d4af37', '4', '0', '300', '0.00', '300 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('5', 'Platinum Executive', 'প্লাটিনাম এক্সিকিউটিভ', '১,০০০টি একটিভ ইউজার পেয়ার', 'Brand New iPhone', '#7b99be', '5', '0', '1000', '0.00', '1,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('6', 'Diamond Executive', 'ডায়মন্ড এক্সিকিউটিভ', '৫,০০০টি একটিভ ইউজার পেয়ার', 'Brand New 150CC Motorcycle', '#45c0f0', '6', '0', '5000', '0.00', '5,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('7', 'Crown Executive', 'ক্রাউন এক্সিকিউটিভ', '২৫,০০০টি একটিভ ইউজার পেয়ার', 'Brand New Axio Car', '#9333ea', '7', '0', '25000', '0.00', '25,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('8', 'President', 'প্রেসিডেন্ট', '১,২৫,০০০টি একটিভ ইউজার পেয়ার', 'Luxury 1,250 SFT Flat', '#059669', '8', '0', '125000', '0.00', '125,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('9', 'Ambassador', 'অ্যাম্বাসেডর', '৫,০০,০০০টি একটিভ ইউজার পেয়ার', 'Dream Duplex Villa', '#e11d48', '9', '0', '500000', '0.00', '500,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `ranks` (`id`, `name_en`, `name_bn`, `criteria_bn`, `reward_en`, `color_hex`, `sort_order`, `required_directs`, `required_pairs`, `reward_amount`, `description`, `status`) VALUES ('10', 'Global Ambassador', 'গ্লোবাল অ্যাম্বাসেডর', '১৫,০০,০০০টি একটিভ ইউজার পেয়ার', 'Helicopter Fund', '#050f3d', '10', '0', '1500000', '0.00', '1,500,000 Active Matched Pairs', 'active') ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Default Data Seed for `income_types`
-- --------------------------------------------------------

INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('1', 'Referral Bonus', 'রেফারেল বোনাস', 'নতুন User-কে App Install, KYC, Profile Activation এবং First Login সম্পন্ন করানোর জন্য এককালীন Referral Bonus।', '1') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('2', 'Team Royalty Income', 'টিম রয়্যালটি ইনকাম', 'রেফার করা User Life OS-এর বিভিন্ন সেবা ব্যবহার করলে Team Royalty প্রদান করা হবে।', '2') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('3', 'Generation Leadership Bonus', 'জেনারেশন লিডারশিপ বোনাস', 'নিজের Referral Team-এর পরবর্তী ২০ Generation থেকে Generation Leadership Bonus।', '3') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('4', 'Rank & Reward', 'র‍্যাংক ও রিওয়ার্ড', 'পারফর্মেন্স অনুযায়ী বিভিন্ন Rank এবং আকর্ষণীয় পুরস্কার।', '4') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('5', 'Leadership Income', 'লিডারশিপ ইনকাম', 'Team তৈরি, Training, Service Adoption বাড়ানো ও Team Performance উন্নতের জন্য বোনাস।', '5') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('1', 'Referral Bonus', '├ô┬¬Γûæ├ô┬║├º├ô┬¬┬╜├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬║├º├ô┬¬Γûô ├ô┬¬┬╝├ô┬║├»├ô┬¬┬┐├ô┬¬┬Ñ├ô┬¬┬⌐', '├ô┬¬┬┐├ô┬¬├▒├ô┬║├╝├ô┬¬┬┐ User-├ô┬¬├▓├ô┬║├º App Install, KYC, Profile Activation ├ô┬¬├à├ô┬¬┬╝├ô┬¬├⌐ First Login ├ô┬¬┬⌐├ô┬¬┬½├ô┬║├¼├ô┬¬┬¼├ô┬¬┬┐├ô┬║├¼├ô┬¬┬┐ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬Ñ├ô┬¬┬┐├ô┬║├»├ô┬¬Γûæ ├ô┬¬┬ú├ô┬¬┬┐├ô┬║├¼├ô┬¬┬╗ ├ô┬¬├à├ô┬¬├▓├ô┬¬├▓├ô┬¬┬Ñ├ô┬¬Γûô├ô┬║├ç├ô┬¬┬┐ Referral Bonus├ô├æ├▒', '1') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('2', 'Team Royalty Income', '├ô┬¬╞Æ├ô┬¬ΓöÉ├ô┬¬┬½ ├ô┬¬Γûæ├ô┬¬┬╗├ô┬¬Γò¥├ô┬║├¼├ô┬¬┬╗├ô┬¬┬Ñ├ô┬¬Γûô├ô┬¬╞Æ├ô┬¬ΓöÉ ├', '├ô┬¬Γûæ├ô┬║├º├ô┬¬┬╜├ô┬¬┬Ñ├ô┬¬Γûæ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬Ñ User Life OS-├ô┬¬├à├ô┬¬Γûæ ├ô┬¬┬╝├ô┬¬ΓöÉ├ô┬¬┬í├ô┬¬ΓöÉ├ô┬¬┬┐├ô┬║├¼├ô┬¬┬┐ ├ô┬¬┬⌐├ô┬║├º├ô┬¬┬╝├ô┬¬┬Ñ ├ô┬¬┬╝├ô┬║├¼├ô┬¬┬╗├ô┬¬┬╝├ô┬¬Γòú├ô┬¬┬Ñ├ô┬¬Γûæ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬Γûô├ô┬║├º ├ô┬¬├à├ô┬¬┬╝├ô┬¬├⌐ Life OS ├ô┬¬┬⌐├ô┬║├º├ô┬¬├º ├ô┬¬┬⌐├ô┬║├º├ô┬¬┬╝├ô┬¬┬Ñ ├ô┬¬├æ├ô┬║├º├ô┬¬├▓├ô┬║├º ├ô┬¬Γûæ├ô┬¬┬Ñ├ô┬¬┬ú├ô┬¬┬⌐├ô┬║├¼├ô┬¬┬╝ ├ô┬¬├á├ô┬¬Γûæ├ô┬║├¼├ô┬¬┬ú├ô┬¬┬┐ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬Γûô├ô┬║├º, ├ô┬¬├▓├ô┬║├»├ô┬¬┬½├ô┬║├¼├ô┬¬┬¼├ô┬¬┬Ñ├ô┬¬┬┐├ô┬¬ΓöÉ├ô┬¬Γûæ ├ô┬¬┬┐├ô┬║├ç├ô┬¬├▒├ô┬¬ΓöÉ├ô┬¬┬½├ô┬¬┬Ñ├ô┬¬Γûô├ô┬¬┬Ñ ├ô┬¬├á├ô┬¬┬┐├ô┬║├╝├ô┬¬┬╗├ô┬¬┬Ñ├ô┬¬┬╗├ô┬¬Γò¥├ô┬║├ç Team Royalty ├ô┬¬┬¼├ô┬║├¼├ô┬¬Γûæ├ô┬¬┬¬├ô┬¬┬Ñ├ô┬¬┬┐ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬Ñ ├ô┬¬Γòú├ô┬¬┬╝├ô┬║├º├ô├æ├▒', '2') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('3', 'Generation Leadership Bonus', '├ô┬¬┬ú├ô┬║├º├ô┬¬┬┐├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬║├º├ô┬¬├é├ô┬¬┬┐ ├ô┬¬Γûô├ô┬¬ΓöÉ├ô┬¬├¡├ô┬¬┬Ñ├ô┬¬', '├ô┬¬┬┐├ô┬¬ΓöÉ├ô┬¬┬ú├ô┬║├º├ô┬¬Γûæ Referral Team-├ô┬¬├à├ô┬¬Γûæ ├ô┬¬┬½├ô┬¬┬Ñ├ô┬¬┬║├ô┬║├¼├ô┬¬┬╗├ô┬¬┬½├ô┬║├º ├ô┬¬├▒├ô┬║├¬├ô┬¬Γûæ├ô┬¬ΓöÉ ├ô┬¬Γòú├ô┬¬├┤├ô┬¬┬╗├ô┬¬Γò¥├ô┬¬┬Ñ ├ô┬¬┬¼├ô┬¬Γûæ├ô┬¬┬╝├ô┬¬Γûæ├ô┬║├¼├ô┬¬├▒├ô┬║├ç ├ô┬║┬┐├ô┬║┬¬ Generation-├ô┬¬├╣├ô┬║├╝├ô┬¬Γûô├ô┬║├» ├ô┬¬┬╗├ô┬║├º ├ô┬¬┬⌐├ô┬║├º├ô┬¬┬╝├ô┬¬┬Ñ├ô┬¬├╣├ô┬║├╝├ô┬¬Γûô├ô┬║├» ├ô┬¬┬╝├ô┬║├¼├ô┬¬┬╗├ô┬¬┬╝├ô┬¬Γòú├ô┬¬┬Ñ├ô┬¬Γûæ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º ├ô┬¬├à├ô┬¬┬╝├ô┬¬├⌐ ├ô┬¬┬⌐├ô┬║├º├ô┬¬├╗├ô┬¬┬Ñ├ô┬¬┬┐ ├ô┬¬├æ├ô┬║├º├ô┬¬├▓├ô┬║├º ├ô┬¬├▓├ô┬║├»├ô┬¬┬½├ô┬║├¼├ô┬¬┬¼├ô┬¬┬Ñ├ô┬¬┬┐├ô┬¬ΓöÉ ├ô┬¬┬╗├ô┬¬┬Ñ ├ô┬¬├Ñ├ô┬¬┬╗├ô┬¬Γò¥ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º ├ô┬¬├▒├ô┬¬┬Ñ ├ô┬¬├æ├ô┬║├º├ô┬¬├▓├ô┬║├º Generation ├ô┬¬├æ├ô┬║├º├ô┬¬├▓├ô┬║├º Generation Leadership Bonus ├ô┬¬┬¼├ô┬║├¼├ô┬¬Γûæ├ô┬¬┬¬├ô┬¬┬Ñ├ô┬¬┬┐ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬Ñ ├ô┬¬Γòú├ô┬¬┬╝├ô┬║├º├ô├æ├▒', '3') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('4', 'Rank & Reward', '├ô┬¬Γûæ├ö├ç├¼├ô┬║├¼├ô┬¬┬╗├ô┬¬┬Ñ├ô┬¬├⌐├ô┬¬├▓ ├ô┬¬├┤ ├ô┬¬Γûæ├ô┬¬ΓöÉ├ô┬¬├┤├ô┬¬┬╗├ô┬', '├ô┬¬├Ñ├ô┬¬┬¼├ô┬¬┬┐├ô┬¬┬Ñ├ô┬¬Γûæ ├ô┬¬┬¼├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬¬┬╜├ô┬¬Γûæ├ô┬║├¼├ô┬¬┬½├ô┬║├º├ô┬¬┬┐├ô┬║├¼├ô┬¬┬⌐ ├ô┬¬├á├ô┬¬┬┐├ô┬║├╝├ô┬¬┬╗├ô┬¬┬Ñ├ô┬¬┬╗├ô┬¬Γò¥├ô┬║├ç ├ô┬¬├Ñ├ô┬¬┬¼├ô┬¬┬┐├ô┬¬ΓöÉ ├ô┬¬├á├ô┬¬Γûæ├ô┬║├¼├ô┬¬┬ú├ô┬¬┬┐ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º├ô┬¬┬┐ ├ô┬¬┬╝├ô┬¬ΓöÉ├ô┬¬┬í├ô┬¬ΓöÉ├ô┬¬┬┐├ô┬║├¼├ô┬¬┬┐ Rank ├ô┬¬├à├ô┬¬┬╝├ô┬¬├⌐ ├ô┬¬┬⌐├ô┬¬┬Ñ├ô┬¬├æ├ô┬║├º ├ô┬¬├æ├ô┬¬┬Ñ├ô┬¬├▓├ô┬¬├╕├ô┬║├º ├ô┬¬├Ñ├ô┬¬├▓├ô┬¬Γûæ├ô┬║├¼├ô┬¬├Ç├ô┬¬├║├ô┬║├ç├ô┬¬┬╗├ô┬¬Γò¥ ├ô┬¬┬¼├ô┬║├╝├ô┬¬Γûæ├ô┬¬┬⌐├ô┬║├¼├ô┬¬├▓├ô┬¬┬Ñ├ô┬¬Γûæ ├ô┬¬├┤ ├ô┬¬┬⌐├ô┬║├¼├ô┬¬┬╝├ô┬║├ç├ô┬¬├▓├ô┬║├ó├ô┬¬├▒├ô┬¬ΓöÉ├ô├æ├▒', '4') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `income_types` (`id`, `title_en`, `title_bn`, `description_bn`, `sort_order`) VALUES ('5', 'Leadership Income', '├ô┬¬Γûô├ô┬¬ΓöÉ├ô┬¬├¡├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬¬├é├ô┬¬ΓöÉ├ô┬¬┬¼ ├ô┬¬├º├ô┬¬┬┐├ô┬¬├▓├ô┬¬┬Ñ├ô┬', '├ô┬¬┬╗├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬¬┬Ñ Team ├ô┬¬├▒├ô┬║├¬├ô┬¬Γûæ├ô┬¬ΓöÉ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º, Training ├ô┬¬┬¬├ô┬║├º├ô┬¬┬╝├ô┬║├º, Service Adoption ├ô┬¬┬╝├ô┬¬┬Ñ├ô┬¬├¡├ô┬¬Γò¥├ô┬¬┬Ñ├ô┬¬┬╝├ô┬║├º, Customer Retention ├ô┬¬┬┐├ô┬¬ΓöÉ├ô┬¬├é├ô┬║├¼├ô┬¬├£├ô┬¬ΓöÉ├ô┬¬├▒ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º ├ô┬¬├à├ô┬¬┬╝├ô┬¬├⌐ Team Performance ├ô┬¬├½├ô┬¬┬┐├ô┬║├¼├ô┬¬┬┐├ô┬¬├▒ ├ô┬¬├▓├ô┬¬Γûæ├ô┬¬┬╝├ô┬║├º, ├ô┬¬├▒├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬¬┬Ñ Leadership Income ├ô┬¬Γòú├ô┬¬ΓöÉ├ô┬¬┬⌐├ô┬║├º├ô┬¬┬╝├ô┬║├º ├ô┬¬┬╝├ô┬║├»├ô┬¬┬┐├ô┬¬┬Ñ├ô┬¬┬⌐ ├ô┬¬┬¼├ô┬¬┬Ñ├ô┬¬┬╝├ô┬║├º (├ô┬¬┬┐├ô┬¬ΓöÉ├ô┬¬Γûæ├ô┬║├¼├ô┬¬┬¬├ô┬¬ΓöÉ├ô┬¬├Ç├ô┬║├¼├ô┬¬╞Æ ├ô┬¬╞Æ├ô┬¬┬Ñ├ô┬¬Γûæ├ô┬║├¼├ô┬¬├╣├ô┬║├º├ô┬¬╞Æ)-├ô┬¬├à├ô┬¬Γûæ ├ô┬¬┬ú├ô┬¬┬┐├ô┬║├¼├ô┬¬┬╗ ├ô┬¬┬╗├ô┬║├»├ô┬¬├╣├ô┬║├¼├ô┬¬┬╗ ├ô┬¬Γòú├ô┬¬┬╝├ô┬║├º├ô├æ├▒', '5') ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Default Data Seed for `payment_gateways`
-- --------------------------------------------------------

INSERT INTO `payment_gateways` (`id`, `slug`, `name`, `type`, `fee_pct`, `status`, `priority`, `created_at`) VALUES ('1', 'bkash', 'bKash Limited', 'MFS', '1.85', 'Active', '1', '2026-08-12 16:33:44') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `payment_gateways` (`id`, `slug`, `name`, `type`, `fee_pct`, `status`, `priority`, `created_at`) VALUES ('2', 'nagad', 'Nagad', 'MFS', '1.45', 'Active', '2', '2026-08-12 16:33:44') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `payment_gateways` (`id`, `slug`, `name`, `type`, `fee_pct`, `status`, `priority`, `created_at`) VALUES ('3', 'ssl', 'SSLCommerz', 'Aggregator', '2.00', 'Active', '3', '2026-08-12 16:33:44') ON DUPLICATE KEY UPDATE `id`=`id`;
INSERT INTO `payment_gateways` (`id`, `slug`, `name`, `type`, `fee_pct`, `status`, `priority`, `created_at`) VALUES ('4', 'dbbl', 'DBBL Nexus', 'Bank', '1.00', 'Inactive', '4', '2026-08-12 16:33:44') ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Default Data Seed for `system_settings`
-- --------------------------------------------------------

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('activation_package_amount', '1000', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('auto_kyc', '1', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('daily_transfer_limit', '100000', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('default_currency', 'BDT (৳)', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('default_language', 'Bengali (বাংলা)', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('maintenance_mode', '0', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_carry_policy', 'carry', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_daily_cap', '5000', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_daily_overflow', 'carry', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_max_levels', '5', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_rate_pct', '10', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_reserve_pct', '30', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('max_login_attempts', '5', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('max_wallet_balance', '500000', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('payment_gateway', 'SSLCommerz', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('platform_name', 'Life OS Bangladesh', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('referral_bonus_amount', '50', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('require_2fa', '0', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('session_timeout', '60', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('support_email', 'support@lifeos.com.bd', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('support_phone', '+880-1234-567890', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('tagline', 'One App · All Life Solutions', '2026-08-16 02:13:01') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('activation_package_amount', '1000', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('allowed_origins', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('auto_kyc', '1', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('bkash_api_key', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('daily_transfer_limit', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('default_commission', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('default_currency', 'BDT (αº│)', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('default_language', 'Bengali (αª¼αª╛αªéαª▓αª╛)', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('email_notif', '1', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('google_maps_api', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('jwt_secret', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('kyc_free_limit', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('logo_url', 'data:image/jpeg;base64,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f7zwwwwww1//AP8ADT//AA9//wD+9/8ADDT7999/3x9BQgAAQsQgsI86+7pG1iwwsYAQM8888888++O+88I4IAAAAQ80099949JRDTvBR9999vf9JDDDD/8A/wANOMMf/wD/AP8A+sMMOMNPv/30n1HEAAAAAjzDzCI3vUdFgwCjADzzywDT76ok0Xtb7qAAAAAAgBTyzz23H0EEHsM03H3/AP8A+UYwQw1//wAMf/8A7/8A/wD/APDDDDDDf39999999sAAAQ848sAO5DFOf38Acs888848edPBmCZsHH2qAAAAAAAsAU889BNMBBDLzFN//wD7zSww1/8APfsNf/8A/wD/AP8A/wDwwwwwx/8A/wD/APfcTfCAAAAAMAMGCTMpjYMPCPPOPPPPIh3ePQnamWjGmSgAAAAAPPLPPeQffbQQRf8A/n/P/sEMcMNcfesMM8PfPf8A/wCywwwwfffffffQQXeAAMAAAAAKBTNLzXqrCMPLGFOFWWf4csMBLJZH+HghAAAAANPPLAPPCMAAV/8A832/2m2kEMNf/wD/AAwyw39//wD/APDPLBJB919999N9gAAAAAAAQQ0XQtNyEp0gAM8M8k97xEod1PPszbiSa2CAAAAAc88wMwQ0IAAB/wCffffffcQww/8A/wD/AAww1/8A/wD/AP4wwwRTXfffffffffTBCAAACIPFHrAHfagHIHPPHDi9agx37335lOz6vi0SiAAAANPPHOBAOAAAAB/ff/fffQwx2/8AP/8ADDzD/wD/AP8A/LDDBBDx999t99999w84AAAwI0AfpFA17++gU804UEy/Hthts/OP4TUQtLobMIAAE8888tB9BAAT5RB/999tBDTDz/8A6www0/8A/wD/AP8A8MMMMMM/3333333zgAAAAACBQDqxQ3yBbsADiBDi442YRnUkU3GfdMvPPwbzwgTzzzxiwDyAAHX08H338+MPOsPf/wD/ADywww//AP8A/wD/AMsNsMtX3H3/AN99984AAAAAAUAgUIyvXY/AgINS2xK+gllP/wA81ZcfVQQQN0tLANPPNMAAfQQQQZTf/wD388sUsMPPf/8ADDX/AP8A/wD/AP8A/wD/AAwwwx//AP8A999t98IAAAAAAUEvs0CT6owsAwLM7n6olnnOCWmPTJxU51pcncMAA88IBJBBBJBRv9//APcw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APP/APv/AP8A/wD/AL//AP8Av/8A/wDz3/v/APIAwwQwwwwww/8A/wDz3/u+/wD/AP8A7zDDDDDTvLDDDDTLDDzz7z//AP8A/wD/AP8A/wDfjPDDD/DDDTDDDDDD/wD/AP8A/wA88888ww8889//AP8A/wD/AP8Af/rDnDDDDDDDLDDHvDDP/wD9/wD/AO//AKwwzwwww/73wwwwwwwww4w8w09+9/8A/wD/AP8A/wD/AD8wwwwwxzz338898z/TecccccccZTTTw088/wD/APvLfrDDDDDD3vD3/P8A/wD/AP8A+/8A/wD/ALwwwwww/wDLLrI474IIIYIII44I4I7657777LLJLI457LIIYoDzAM+OzPCNrwVS8wn8chDDiY45brb4445IIIL7LLb7777rbqJL7La44444oLJOJKMJLIK8POc88/vve99//wD/APz/AM9sMPOdv8/01GE010tJISk8BPT6va6rf3313kFHf/8APvDT/wA95yx//wD/AH/Pfvf/AP34x+w0ww0Qfew0wwwwwwwwwz//APP+/wD/AN//AP8A/wD/AP8AvPPPPPLHLzzzzPPPPPP/APcccfcZdZTzzyzz+8/48www3+4z1/3/AP8A/wD/AP8A/wD/APuMMPe8MMMMMP8AjDjDDDDDDDDD/DDD/wD/AP8AD/8A4/8A/wD/AP8A/wD/AP8A+P8A/DfCDDDDDDDDDD//AP8A+P8AjDDDDDDDCCDfD/D/AA4ww/8A/wDj/wD/AP8A/wD/AP8ADDDD/DDDDDD/AP/EAAL/2gAMAwEAAgADAAAAEAgvvvqkkktorskvrnoggggrfrABFdffbSRefcQTQRTQQUeXXXffXbUbYXffaUbYaXffRfaBEDrnsvggISHvvusstlvtvvmvkvqhvgvlrgggoghnqgnupijitvvuvtGIFNPOMPfTfbUbTQSaRbdfcddQZfacQQUfYTTXZQRNPOAAAFusIuoggELjvvigngtigtvvnvvomlvgvioghjokgvuolgnqglvrINCLEPBAQRYVfeRfcUdSQVYcQQffQVdfbVfefbQdcZfefCPhAFEmsuggggutrvsqtovvggvvvtvgllvvvvggpvvvvnutrohvinvnvvBCAPYRSUcVfaeRRbQSRXbfTcffaRffbfQcQfYQQYcdeQRIBDBvKODmAhPvvgkvgtvrghvvonogllutvqnglvvvvrgtsukggNvvuIPPPGTQQQTcQfefbecYRefQTXYRXTQVefcRQddQRVbVffPDMIBeJAvrOLGPgknsogtuggsgkvvossgggggjnvnigggvprgiggCOIEcfPPPMQbcbSQec0ghQZfXfffXfbffQReXfSQeRbUfUXfdQaQECHPuutgqhjvvikglovsggvvvrkvvigggjvvvrjjikvuntPvDIAAMfLPfbTTTdXR3shAvvfTRfUdfXcdTVfSRbbQTfQdfQcXfdfcABPvAAgsIIFOLPiggsvugjnvrhgtvgspgggvvivsgvvoBXLvuPIAQdfffSVXSTUfgCYNhjeccURXUffdfdUbRfbXUbWfeXfebfdQYAEMDIgkBGtouNCgnvvrghustgkhvvtugjnvvvrgjuggAAPOPPBCQeffYfaccQ/p3g4YkwQQcbQQVfUfcYbdfQdQScaaYcffVfbQQABAAfDAAAHDPPPIAGhlrgggljmsvhvignvvvvvgojigEnPBLDHPAAMdTQQRfUvmFAx5AXUfUQQRSYWQRSeQdUQQdQWfbUbeSfbBSRQRDPMfLAlvLPDnnvjrkrgjnrgjvvvqgvvnvrgvvvigkvPMPODKQXQffSYVRTkbRVZyYN8aSTccYVQQeQSQRTQcRefXbQSeQcfcYQRDNsAPKgktOFCksvvvogglmvivrggvinrrrnvtvrhgANPtsPAEYVebUbXUdRulUF63X8s0ZfbcQQYXaQSQ/8wzQdRdfTQQUfcSTCABQNLPsrgEPPPPGrgNPjjgvvovrnvuggktvqgnvnvrhluPCPEMARUVfdQTQTmJZNkTmjhFTXQZXeeSRzxUsAvBzx3ffdffSQVXbeQEDAPPOOojDMPIgkhLHsAglvqjugghgsjgvggstuloikIPPPPPLdffbQRQUfeheRlEMPs4USTeQTTZwlF2+iuzrz17QfffTQbQVeYQPMMbCAishDLogksNvolvsthoqgggggjnvgrlvvmggggiPMDPSQbfffTcTbTAeFNJJgnhSReaQQa0i/M6WBf+46KB2ddeeQffZSQAPAAEPLBPtuKjghvPujjlhttnvsvijilvuijilvAAABHDLAAHOQXTfdffYYeQpHcrNLiRVUZaCBxWe2sfA52sMSI+4xRVdbRbRXfbRRdTfeFsljPGgFEFPNolvvgvvtvoikpvvgjilNPACCBPPDJIQRUQdfbTeWUWnaPTTSpWccMdJzjrp6GTM9WI7thwKwwfQUaXeYTcTbSdffQPuPPPPAADPqgvvvgvvvqggvpvogjjOMIAHPPPPNHPDRSQQddXeaXEjmSFV4soz8oAjtlKpFmkAPGo7sMXEiMQRSQfbQQRefRQfYQRvPPsOAAPuhmvsugvvjvgglvvigvlPPjAAPLPKEPPMfeQUdTdZVTlpgtRyvNqgigdVzQ4l+GcEAtVjfp4uauDSdTRfeYQWPAPPSUuEAPgAAGHAkgsvolvvvrggtvvvgrnsgvsgEPOMPBPeQQQQUdXVVemHis2S+XvhnlqaZ7buqf2xSbU8kgDH5EffSRffcQZUfQXfTNPDgPLAsnjsqitpjjstvvvhvvvvvmpmntqADAHvPPPPeQQQQUbRVcUJ8GXXXUmihvSIaQ6bz/DAAN3eYK0c5OU9bSdbQTTffAMPCAJDPupAstuNqgstmgtvqggssjnvvvkqkuugggvPADPPSQRTQQTQWayIdW0ujrjshfMEK03uIt8514iE+W2OZY7nTQQdbdcNPONNAELvIgvDvigukggFvglvvqggslvuvjvogvvsjjvvAFOATYffefcURTC/MuvQpAjnj31yDlFv93cccVVxK5Je9SX8fdcRaRfecdfOADOMrggsvvnvgshsvllvvvgglusuvgsqhDvAIkPGDHPfSbdfbbQYUTFoTEPzBghpltraHFcZZUedeYTU7FTKTXSkfeQQQQRTeceYAEPGIDvigoHDqkgrulnvvvgovvrruhnjhnuENAAHPPffffUdfUQTWe99EsaIwgrrG2LJQgybWbXTTbTeZwFa7Cz/waQSUYRecbcPADHKhgjgjvvrktvvtlvvusggvvvvglghgvriANAAEIHLUcbQQcUaabQRmEc64vpjTpknK+xddfbfx1ZcZ+yGfD89UcceRRXecAMPEvuMvgggtPvvogkglmlrsgggsvvspkAPLPvrgHHKAHPHfYfYQYRaaa9kdz4Hgripec8gZGKSeQzuow34324CjbmCYcQXfTdPPTUbRHvijhihHPPIkgjjkwvvgggggjvugghMPPPOPAEICEOPAUfaQQVaa6cs2BZY8ut+XSgWctbglB3ZY+oF5JxBbHp0YQQXSQTXaQdeUYPgLBDCAOPAglvvjgvvvvrkprvuglvgsvIAMEAQXAAOAZaQTRWdac+KL8ElM/smel46lLP6viyU3Zsh3DCC0FjqfQQQQdfffdfQQHIMIAAEKABAAnvvslvvvvvhivvvisvsjvvvoAFPLBEIDMfYQQQXSme8ohANGgylQ/f8Ah9BjGhKb3QE2S3DwX9YMk01OEEXzTzHkEFzjDgggDTiwIJ7775b77L6oILb77444JKb7z4IHDygAyxTQEEEFV9IXEUwpauU2K0wKngu/A1dcszeyOG2MAnSvlWEG1EF31301EnSIBCr4xzz4oIKYL5b77L7qIIJLKooIITzwxxygBDbRzy30GFWnm2xslYxAuIncjW9t4Dscswch0gUjhglZSTP/AB9RvL999515RBB8AAAA+K+++CCW+e6+WOO+OS6CG/8A/jgstvPPPMELDPPYXTSQRXeWSqbI2VqZnYtTkXk6z8F6kZwtVoLrdXktExxcUdaxWYUffQRQEPKAkvvugsjgkvruqsvvvvgggvnstvjiiFPOABHIAEPdYedfTXaVXlABlnYXqyEe9yTnf20iFBtxbcvJ2bwFt/8A00EFFHlGHGEkFWzCwIB77III6oL645YrLb74IILb4IZrKMILpDzz647AQnHmH0321kc4VkcdkadCK3G9w1I9A2R/+TimTfhA9+3mf8EX03EkUlCgBjXwAYpa44IIJ6576MM5777444Y77774JIII4b4IhDEEEFHnX2EEGGVubwNvTy5+0321U+zuIIOy7NRnrOjZ9+evuMMe910X32EERzygAIAb4JYJb776JL5L77777rb7LLq44II44L45AjoS0EAD0UsFXGXNdZKj3/8A/wDfdffbf/8A/wD99sSvznrvbTjbDPD3D/t95xhDBV4kMWGCC+uO+Cy+qKCaCO+6+u+iCCm6++6CCOOC88O0Aw9iCTYkrdFNLEVTvenhzyuTy++62/8A/wDtQaMAmV/st2d4SAcNOPOF03E30gA8Lbj774ocb7LIJa777777776oJL6JKIZ57JrxigAAQygJYAhnXn3f9yhf9wwTtc1329/3HHXqM0YSWDJ+GiqYZzA8MNf/ANJBR8sAcse+ayiCC2q+e6S6+2+yS2eiCCCOKCKSw+++ymgAAF4NBaASbBBFrz/WTA2bVtBeS2pBNR19MGYBx4mhwZBuw1MxzBBRx8AF8sYAwkc++uOCCu+2+CCuW++++++iCCe+OCSACSyw84MMAAA5Uek0X59ZD0o24Ismz/8AwGNB/SUdYaI1M9tOD7U6p3uBOm/SVfbDXfIEIAHAPsshgnolvrhjtgukvvuvigvsvrvrDrjkrgvPOAAPACvhFH+ffWhBALwGqK+VJPDGHPfUagGVQRV2dOvfnVlZkbzzQdHPPPAAAFPmPAHIgpgjhqik3ghjvvvjkgsstsvrPvigtPPPPAHOOKAsOPvfeeqHLCMHLdnePX3WK1Zb2aqjQWQxnuBnIt5RLf8A+033wxzg5yhTzzyzQAIJ6pL6IL65b6777764oIIpL7jA45ApYDwDTzDQYQy70k2tJAiMBAztBSRBDiDV2OAT10UF0y+/cmCvDExjf/6xzzwxDzzjxygBII4roIIaoLqIK5777qIIIIJ474g75KKJLz7LDwy4ZAQCYBLeiDQdDjz8NwaPNSQH0tIsD/I722RrJ3eq5hCxvPHHBDARm5LxzzgL7774Y4IIIIqIII774KIIIopIL7774ILLKL4oLy5JLQHDyDiLjRbZihiLfixzxiSAy6xwoWlRSVuYz/8AjjbWmMAAAMoAQ+6++6gAW+++uOyCGKG6uCC+6+uCCeiCOyyG+++iCGK2+KyyqKhAww4Q6zg2C/cGacCAEAB81xz+8rmvz5IA24JyJfmpK2cwQBAAAmOcsCCW6y2+KCOOKOeGyKO+62++OCCC2OCKC2++G+iCkMIO6u8PP/8A4dleastPaugoIw2zql6VzkqKww36BinjNz39PlrwwTLKDDnsvIggksojnoigstvnkgiigggvrsriogkvvvstqksigggBPqg1upDBCNG8/ON5deoJrCCX5O8//otCgn9I73TIIDDGpvqADvPvrvOikgmggAgvvnoiwkstqqjgggjvurggjjionvvjjmrrhhiRksCj0YXrR/Pwx5HAgZCY0ycC8TARfk7SqR9vbQHPWI6WDcPrkokvvPOoggggsohvvvvgjsg066tggrnvvvggtsohmstvvrvvvrv7z4FnelWmVQ+o+gDv2afGv0ZNR+O4zt9AjLZbef3P5Io4Hx7Hc85BPqgoggtrnjnvPvsikjnvoqhjgvvnvogusogvvgvvvvvvvrspSghlvnkPhnivihNqogiArlrjwjinnvh9/mjPFlMvLrrsMOOjhnvusAgnvvvvsvussogogvvqlqhjghvviigjjgsvvivnvsssvsogBDjDksrhjkjnqnz/AI46Y7rI80ub6o5GHHHcv/K5JKpI4JqKoJ74LwIIIKLb7Kb7rLJaIqZr74LoLI77rL777LIII647YoL4474K4DBDDygAJLrLLbpwAAAAb6JLDGFUAwAQEFH2scIwoIALL566IIIKLIIYL447777744JKIYI7b6L7ILIJb77L4JIIIIL7LY7777rLIIL64IIKqY4oIJL/AOCOCCyCD++KGO/yCG/CSiCOKCSCBdy+8qGKCyiC+++y2+v/AAssghjvvvugkriggglrtnvjjhjgggggvvvvnojgggvgggnnvjjjvgiggtsvvvuvjDPPuhjrjjgggqglvmrhnvqkoigghrggjvvtvjjwglhvsvoggvrngggsvkvuvnvjvrihitgksvvsvjsgghvvussorMNOPXT/AMs888O8stfcMExzLK4IJbKJb64IJILa4Lb4777JLKYLYoJL7774oL7/AP3/AAw/+oghhvvssvsvsgnqgmvsssktgtrgkDCAdx/UllRjjorjvWWwQ5ZhWQz0QAGNpjvssmgggvsstvvsohihnojghnjisspg84wko0ognoz/APvPNMcdtPPPtvOMf/2nEJ7uUHFM9P8Ayz1bSOpsj1O1wk18OHJACyHLTFcwhBJhdxFVrHz/AH9w83638w4/61zw/wD9EH3oJIII45L7677III4JIIIr4IIL776444447rboQzzwAByAD01/POM/NcdckEwgACQ4JoL7KJ7qI5b577LL45L4IIZ774pL445aoL6IKIIIIJ774J4L774IIIL54J4L777777776L54J4P5774J7777xwAAB4B7777776J/8J4L574KIIL6L54KL4IIL4L7774L6IL4IKD/xABJEQABAwIACgYFCgYABAcAAAABAAIDBBEFEhMUITFSU5GSBhAgIkFRMmBhcaEVIzAzQlRic4GxJFByosHRFjRjgjVARHCAg5D/2gAIAQIBAT8A/wDzkosHTVb9Aswa3LCMLYKgxM1N0esWDsEvntJLdrP3UbGRMDGNAaFhf/nJf6j6wNaXGwFysG4HtaWce5q1BErC3/NSf1n1fhhkmeGMFyVg/BcdPZ8lnP8AgOoorCn/ADEn5jvV5rS5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Z0wxyFxneQ0MJvdUMT4aSKN+sDhc3sql7YppXwGZsxd9XikteVO/FriXvljvC0XY29zc+wqqEkslAYXuHp98t/D4hUcJljrGT3MjnFshI0EWsC1UbZpp8pM0jIsyY9rvFyyUpppHCNzsSsc8t8XAOUVbDO8NY2T2ktIA991RSBj+9NO05V3cxTi6Xe5VbmRTyvhdNHMfshpc15Uc13iNwIfiBx0aOKljdIABI5ntbZZrJ96m/t/0s1k+9Tf2/wClmsn3qb+3/SiYWNsXufp1u/m9vpLD/wAhb6O3/wA2bq6urq6urq6v1X/luVj2xxWVj228VlY9tvFZWPbCyse23isrHtt4rKx7beKysW23isrFtt4rKxbbeKyse23isrFtt4rKxbbeKysW23isrFtt4rKxbbeKyse23isrFtt4rKx7beKysW23isrFtt4rKxbbeKysW23isrFtt4rKxbbeKysW23isrFtt4rKxbbeKysW23istFtt4rKxbbeKyse23isrFtt4rKxbbeKysW8bxWVj228VlY9tvFZWPbbxWWi228VlYttvFZaPbbxWWj228Vlo9tvFZaPbbxWWj228Vl49tvFZxHtBZzHtBGshH2gjX04+2F8o028CFfAfthCqiP2ws4j2gsvHtDisvHtt4rLR7beKy0e23istHtt4rLR7beKy0e23istFvG8VlYttvFZWPbbxWVi3jeKysW23isrFvG8VlYttvFZWPbbxWVi228VlYttvFZWLbbxWVi228VlYttvFZWLbbxWVi228VlYttvFZaLbbxWVi228VlYt43isrFtt4rKxbbeKysW23isrFtt4rKxbbeKysW23isrFtt4rKx7beKyse23isrHthZWLbbxWVj228VlY9tvFZWPbbxWVj228VlY9scVlY9tvFZWPbHFZWPbCyse2OKzWm3LOULNabcR8oWa024j5Qs1ptzHyhZpTbiPlCzSm3EfKFmlLuI+ULNKXcR8oWaUu4j5Qs0pdxHyhZpTbiPlCzSl3EfKFmtNuI+ULNKXcR8oWaU24j5Qs0pdxHyhZpS7iPlCzSl3EfKFmlLuI+ULNKXcR8oWaUu4j5Qs0pdxHyhZpS7iPlCzSl3EfKFmlLuI+ULNKXcR8oWaUu4j5Qs0pdxHyhZpS7iPlCzSl3EfKFmlLuI+ULNKXcR8oWaUu4j5Qs0pdxH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wWHJ3C4LDk7hcFhydwuCw5O4XBYcncLgtaqMx1rdRmOtbqMx1rdRmutbqM11rdRmOtbqMx1rdTmutbqM11rdTmutbqc11rlTmutcqc0lrlTmktcqc0lrlTmktcqc0lrlTmktcqc0lrlTmktcqc0lrlTmktcqc0lrlVmktcqc0lrlTmktcqc0lrlTmktcqc0lrlVmktdqs0lrtVnEtdqs0lrtVmktdqs0lrtVmktcqs0lrlVmktcqc0lrtVmktcqs0lrtVmktdqs4lrtVnEtcqs0lrtVmktdqs4lrtVnEtdqs4lrlVmktdqs4lrtVnEtdqs4lrtVnEtdqs4lrtVnEtdqs4lrtVnEtdqs4lrtVnEtdqs4lrtVnEtdqs4lrtVnEtdqs4lrtXnEtdq84lr1XnEteq84lrtXnEtdq84lrtXnEtdq84lr1XnEteq84lr1XnEteq84lr1XnEteq84lr9XnktfrM8lr9Znktfq88lr1Xnkteq88lr9Znktfq88lr9ZnktfrM8lr9ZnktfrM8l4QrM8l4QrM8l4QrM8l4Rrc8l4RrM8l4SrM8l4TrM4l4UrM514VrM114WrM1eFqzNXhWszXXhStznXhOsznXhKtzyXhKszyXhGszyXhGszyXhCszyXhCszyWv1meS1+szyWv1meS1+szyWv1meS1+szyWv1meS1+szyWv1meS1+szyWv1meS16rzyWvVecS16rziWvVecS12rziWvVecS16rziWvVecS12rziWvVecS16rziWvVecS16rziWvVecS12rziWu1WcS12qziWu1ecS12qziWvVWcS12qziWu1WcS12qziWu1WcS12qziWvVWcS12qziWu1ecS12qziWu1WcS12qziWu1WcS12qziWu1WcS12qzSWu1WcS12qziWuVWaS1yqzSWuVWaS1yqzSWuVWaS1yqzSWuVOaS1ypzSWuVOaS1ypzSWt1OaS1upzSWuVOaS1upzSWt1OaS1upzSWuVOaS1upzSWt1OaS1uozXWt1OaS1ypzSWt1OaS1upzSWt1Ga61qozHWtVGa61uozXWt1Ga61uozXWtVGY61qozHWtVGY61qozHWtVGY61qozHWtT5jrWqjMda1UZjrWp8x1rU+Y/4ht5LVarVarVarVb/wC1v//EAC4QAAIBAgQEBgMBAQEBAQAAAAABESHxEDFB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', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('maintenance_mode', '0', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_carry_policy', 'carry', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_daily_cap', '5000', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_daily_overflow', 'carry', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_max_levels', '5', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_rate_pct', '10', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('matching_reserve_pct', '30', '2026-08-17 13:36:33') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('max_login_attempts', '5', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('max_wallet_balance', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('nagad_api_key', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('payment_gateway', 'SSLCommerz', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('platform_name', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('referral_bonus_amount', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('referral_bonus_notif', '1', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('require_2fa', '1', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('session_timeout', '60', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('sms_api_key', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('sms_notif', '1', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('smtp_host', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('smtp_port', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('smtp_username', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('support_email', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('support_phone', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('tagline', '', '2026-07-22 17:46:56') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('twilio_api', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ('webhook_url', '', '2026-07-22 17:46:57') ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
