CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" text NOT NULL,
	"user_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beta_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar,
	"rating" integer NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"screen_context" text,
	"app_version" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beta_invites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"referral_code" text DEFAULT 'BETA25' NOT NULL,
	"invited_by" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"joined_at" timestamp,
	"member_id" varchar,
	CONSTRAINT "uq_beta_invite_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "business_claims" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"member_id" varchar NOT NULL,
	"verification_method" text NOT NULL,
	"verification_code" text,
	"code_expires_at" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "business_photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"photo_url" text NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"cuisine" text,
	"city" text NOT NULL,
	"neighborhood" text,
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"phone" text,
	"website" text,
	"instagram_handle" text,
	"description" text,
	"price_range" text DEFAULT '$$',
	"google_place_id" text,
	"google_rating" numeric(3, 1),
	"google_maps_url" text,
	"opening_hours" jsonb,
	"is_open_now" boolean DEFAULT false NOT NULL,
	"hours_last_updated" timestamp,
	"data_source" text DEFAULT 'google_import',
	"photo_url" text,
	"weighted_score" numeric(6, 3) DEFAULT '0' NOT NULL,
	"raw_avg_score" numeric(4, 2) DEFAULT '0' NOT NULL,
	"rank_position" integer,
	"rank_delta" integer DEFAULT 0 NOT NULL,
	"prev_rank_position" integer,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"dine_in_count" integer DEFAULT 0 NOT NULL,
	"credibility_weighted_sum" numeric(8, 4) DEFAULT '0' NOT NULL,
	"leaderboard_eligible" boolean DEFAULT false NOT NULL,
	"owner_id" varchar,
	"is_claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text DEFAULT 'none',
	"subscription_period_end" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"in_challenger" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug"),
	CONSTRAINT "businesses_google_place_id_unique" UNIQUE("google_place_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"emoji" text NOT NULL,
	"vertical" text NOT NULL,
	"at_a_glance_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scoring_hints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_suggestions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"vertical" text NOT NULL,
	"suggested_by" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vote_count" integer DEFAULT 1 NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenger_id" varchar NOT NULL,
	"defender_id" varchar NOT NULL,
	"category" text NOT NULL,
	"city" text NOT NULL,
	"entry_fee_paid" boolean DEFAULT false NOT NULL,
	"stripe_payment_intent_id" text,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"challenger_weighted_votes" numeric(10, 3) DEFAULT '0' NOT NULL,
	"defender_weighted_votes" numeric(10, 3) DEFAULT '0' NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"winner_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credibility_penalties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"rating_flag_id" varchar,
	"base_penalty" integer NOT NULL,
	"history_mult" numeric(3, 1) NOT NULL,
	"pattern_mult" numeric(3, 1) NOT NULL,
	"final_penalty" integer NOT NULL,
	"severity" text NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deletion_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_deletion_at" timestamp NOT NULL,
	"cancelled_at" timestamp,
	"completed_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish_leaderboard_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leaderboard_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"dish_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"dish_rating_count" integer DEFAULT 0 NOT NULL,
	"rank_position" integer DEFAULT 0 NOT NULL,
	"previous_rank" integer,
	"photo_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_entry_lb_biz" UNIQUE("leaderboard_id","business_id")
);
--> statement-breakpoint
CREATE TABLE "dish_leaderboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" text NOT NULL,
	"dish_name" text NOT NULL,
	"dish_slug" text NOT NULL,
	"dish_emoji" text,
	"status" text DEFAULT 'active' NOT NULL,
	"min_rating_count" integer DEFAULT 5 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dish_city" UNIQUE("city","dish_slug")
);
--> statement-breakpoint
CREATE TABLE "dish_suggestion_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestion_id" varchar NOT NULL,
	"member_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish_suggestions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" text NOT NULL,
	"dish_name" text NOT NULL,
	"suggested_by" varchar NOT NULL,
	"vote_count" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"activation_threshold" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rating_id" varchar NOT NULL,
	"dish_id" varchar,
	"member_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"no_notable_dish" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"suggested_by" text DEFAULT 'community' NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dish_per_business" UNIQUE("business_id","name_normalized")
);
--> statement-breakpoint
CREATE TABLE "featured_placements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"payment_id" varchar,
	"city" text NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"badge_id" text NOT NULL,
	"badge_family" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_badge_per_member" UNIQUE("member_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" varchar,
	"display_name" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"avatar_url" text,
	"city" text DEFAULT 'Dallas' NOT NULL,
	"push_token" text,
	"credibility_score" integer DEFAULT 10 NOT NULL,
	"credibility_tier" text DEFAULT 'community' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"total_categories" integer DEFAULT 0 NOT NULL,
	"distinct_businesses" integer DEFAULT 0 NOT NULL,
	"rating_variance" numeric(4, 3) DEFAULT '0' NOT NULL,
	"active_flag_count" integer DEFAULT 0 NOT NULL,
	"probation_until" timestamp,
	"is_founding_member" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" text,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_active" timestamp,
	"notification_prefs" jsonb,
	CONSTRAINT "members_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "members_username_unique" UNIQUE("username"),
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" jsonb,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"business_id" varchar,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "qr_scans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"member_id" varchar,
	"converted" boolean DEFAULT false NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rank_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"rank_position" integer NOT NULL,
	"weighted_score" numeric(6, 3) NOT NULL,
	"snapshot_date" date DEFAULT current_date NOT NULL,
	CONSTRAINT "unique_business_snapshot" UNIQUE("business_id","snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "rating_flags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rating_id" varchar NOT NULL,
	"flagger_id" varchar NOT NULL,
	"q1_no_specific_experience" boolean NOT NULL,
	"q2_score_mismatch_note" boolean NOT NULL,
	"q3_insider_suspected" boolean NOT NULL,
	"q4_coordinated_pattern" boolean NOT NULL,
	"q5_competitor_bombing" boolean,
	"explanation" text,
	"ai_fraud_probability" integer,
	"ai_reasoning" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_flag_per_member" UNIQUE("rating_id","flagger_id")
);
--> statement-breakpoint
CREATE TABLE "rating_photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rating_id" varchar NOT NULL,
	"photo_url" text NOT NULL,
	"cdn_key" text NOT NULL,
	"is_verified_receipt" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rating_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"response_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"q1_score" integer NOT NULL,
	"q2_score" integer NOT NULL,
	"q3_score" integer NOT NULL,
	"would_return" boolean NOT NULL,
	"note" text,
	"visit_type" text DEFAULT 'dine_in',
	"food_score" numeric(3, 1),
	"service_score" numeric(3, 1),
	"vibe_score" numeric(3, 1),
	"packaging_score" numeric(3, 1),
	"wait_time_score" numeric(3, 1),
	"value_score" numeric(3, 1),
	"composite_score" numeric(4, 2),
	"has_photo" boolean DEFAULT false NOT NULL,
	"has_receipt" boolean DEFAULT false NOT NULL,
	"dish_field_completed" boolean DEFAULT false NOT NULL,
	"verification_boost" numeric(4, 3) DEFAULT '0' NOT NULL,
	"effective_weight" numeric(6, 4),
	"gaming_multiplier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"gaming_reason" text,
	"time_on_page_ms" integer,
	"raw_score" numeric(4, 2) NOT NULL,
	"weight" numeric(5, 4) NOT NULL,
	"weighted_score" numeric(6, 4) NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"auto_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"flag_probability" integer,
	"source" text DEFAULT 'app',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referred_id" varchar NOT NULL,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'signed_up' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp,
	CONSTRAINT "uq_referral_referred" UNIQUE("referred_id")
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_members_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD CONSTRAINT "beta_feedback_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_invites" ADD CONSTRAINT "beta_invites_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_claims" ADD CONSTRAINT "business_claims_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_claims" ADD CONSTRAINT "business_claims_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_photos" ADD CONSTRAINT "business_photos_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_photos" ADD CONSTRAINT "business_photos_uploaded_by_members_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_suggestions" ADD CONSTRAINT "category_suggestions_suggested_by_members_id_fk" FOREIGN KEY ("suggested_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_suggestions" ADD CONSTRAINT "category_suggestions_reviewed_by_members_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengers" ADD CONSTRAINT "challengers_challenger_id_businesses_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengers" ADD CONSTRAINT "challengers_defender_id_businesses_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengers" ADD CONSTRAINT "challengers_winner_id_businesses_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credibility_penalties" ADD CONSTRAINT "credibility_penalties_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credibility_penalties" ADD CONSTRAINT "credibility_penalties_rating_flag_id_rating_flags_id_fk" FOREIGN KEY ("rating_flag_id") REFERENCES "public"."rating_flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_leaderboard_entries" ADD CONSTRAINT "dish_leaderboard_entries_leaderboard_id_dish_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."dish_leaderboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_leaderboard_entries" ADD CONSTRAINT "dish_leaderboard_entries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_suggestion_votes" ADD CONSTRAINT "dish_suggestion_votes_suggestion_id_dish_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."dish_suggestions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_suggestion_votes" ADD CONSTRAINT "dish_suggestion_votes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_suggestions" ADD CONSTRAINT "dish_suggestions_suggested_by_members_id_fk" FOREIGN KEY ("suggested_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_votes" ADD CONSTRAINT "dish_votes_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_votes" ADD CONSTRAINT "dish_votes_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_votes" ADD CONSTRAINT "dish_votes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_votes" ADD CONSTRAINT "dish_votes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_placements" ADD CONSTRAINT "featured_placements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_placements" ADD CONSTRAINT "featured_placements_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_history" ADD CONSTRAINT "rank_history_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_flags" ADD CONSTRAINT "rating_flags_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_flags" ADD CONSTRAINT "rating_flags_flagger_id_members_id_fk" FOREIGN KEY ("flagger_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_flags" ADD CONSTRAINT "rating_flags_reviewed_by_members_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_photos" ADD CONSTRAINT "rating_photos_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_responses" ADD CONSTRAINT "rating_responses_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_responses" ADD CONSTRAINT "rating_responses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_responses" ADD CONSTRAINT "rating_responses_owner_id_members_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_members_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_members_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_members_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_event" ON "analytics_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_analytics_user" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_created" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_beta_feedback_member" ON "beta_feedback" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_beta_feedback_created" ON "beta_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_beta_invite_email" ON "beta_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_biz_photos_business" ON "business_photos" USING btree ("business_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_biz_city_cat" ON "businesses" USING btree ("city","category");--> statement-breakpoint
CREATE INDEX "idx_biz_cuisine" ON "businesses" USING btree ("city","cuisine");--> statement-breakpoint
CREATE INDEX "idx_biz_score" ON "businesses" USING btree ("weighted_score");--> statement-breakpoint
CREATE INDEX "idx_biz_rank" ON "businesses" USING btree ("city","category","rank_position");--> statement-breakpoint
CREATE INDEX "idx_biz_slug" ON "businesses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_biz_google_place" ON "businesses" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "idx_challenger_active" ON "challengers" USING btree ("city","category","status");--> statement-breakpoint
CREATE INDEX "idx_penalties_member" ON "credibility_penalties" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_deletion_member" ON "deletion_requests" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_deletion_status" ON "deletion_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dish_entry_lb_rank" ON "dish_leaderboard_entries" USING btree ("leaderboard_id","rank_position");--> statement-breakpoint
CREATE INDEX "idx_dish_lb_city" ON "dish_leaderboards" USING btree ("city","status");--> statement-breakpoint
CREATE INDEX "idx_dish_sugg_city" ON "dish_suggestions" USING btree ("city","vote_count");--> statement-breakpoint
CREATE INDEX "idx_dish_biz_votes" ON "dishes" USING btree ("business_id","vote_count");--> statement-breakpoint
CREATE INDEX "idx_featured_business" ON "featured_placements" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_featured_city_status" ON "featured_placements" USING btree ("city","status");--> statement-breakpoint
CREATE INDEX "idx_featured_expires" ON "featured_placements" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_badges_member" ON "member_badges" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_notif_member" ON "notifications" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_notif_member_read" ON "notifications" USING btree ("member_id","read");--> statement-breakpoint
CREATE INDEX "idx_payments_member" ON "payments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_payments_business" ON "payments" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_qr_biz" ON "qr_scans" USING btree ("business_id","scanned_at");--> statement-breakpoint
CREATE INDEX "idx_rank_hist" ON "rank_history" USING btree ("business_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_flags_rating" ON "rating_flags" USING btree ("rating_id");--> statement-breakpoint
CREATE INDEX "idx_flags_pending" ON "rating_flags" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_rating_photos_rating" ON "rating_photos" USING btree ("rating_id");--> statement-breakpoint
CREATE INDEX "idx_resp_rating" ON "rating_responses" USING btree ("rating_id");--> statement-breakpoint
CREATE INDEX "idx_resp_business" ON "rating_responses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_rat_business" ON "ratings" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_rat_member" ON "ratings" USING btree ("member_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_referral_referrer" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_referred" ON "referrals" USING btree ("referred_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_last_seen" ON "user_activity" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_source" ON "webhook_events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_event_id" ON "webhook_events" USING btree ("event_id");