import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learners = sqliteTable("learners", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  className: text("class_name").notNull(),
  role: text("role").notNull().default("student"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const progress = sqliteTable("progress", {
  id: text("id").primaryKey(),
  learnerId: text("learner_id").notNull().references(() => learners.id),
  unitId: integer("unit_id").notNull(),
  missionId: text("mission_id").notNull(),
  score: integer("score").notNull().default(0),
  completion: integer("completion").notNull().default(0),
  achievementLevel: text("achievement_level"),
  scaffoldStage: integer("scaffold_stage").notNull().default(1),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  title: text("title").notNull(),
  unitId: integer("unit_id").notNull(),
  className: text("class_name").notNull(),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const activitySnapshots = sqliteTable("activity_snapshots", {
  studentId: text("student_id").primaryKey(),
  displayName: text("display_name").notNull(),
  className: text("class_name").notNull(),
  score: integer("score").notNull().default(0),
  loginCount: integer("login_count").notNull().default(0),
  saveJson: text("save_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
