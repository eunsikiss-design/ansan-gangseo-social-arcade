CREATE TABLE `activity_snapshots` (
	`student_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`class_name` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`login_count` integer DEFAULT 0 NOT NULL,
	`save_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
