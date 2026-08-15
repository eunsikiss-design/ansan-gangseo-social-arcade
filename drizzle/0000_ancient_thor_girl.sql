CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_id` text NOT NULL,
	`title` text NOT NULL,
	`unit_id` integer NOT NULL,
	`class_name` text NOT NULL,
	`due_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learners` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`class_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`learner_id` text NOT NULL,
	`unit_id` integer NOT NULL,
	`mission_id` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`completion` integer DEFAULT 0 NOT NULL,
	`achievement_level` text,
	`scaffold_stage` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE no action
);
