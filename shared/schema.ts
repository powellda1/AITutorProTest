import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Phase 1: Multi-Subject Foundation Tables
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Mathematics", "Science", "English"
  code: text("code").notNull().unique(), // "MATH", "SCI", "ENG"
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const curriculumFrameworks = pgTable("curriculum_frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Virginia DOE", "Common Core", "Next Generation Science Standards"
  code: text("code").notNull().unique(), // "VA_DOE", "CCSS", "NGSS"
  description: text("description"),
  state: text("state"), // "Virginia", "National", etc.
  active: boolean("active").notNull().default(true),
});

export const contentAreas = pgTable("content_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Number and Number Sense", "Solar System"
  code: text("code").notNull(), // "6.NS", "6.2"
  description: text("description"),
  grade: text("grade").notNull(), // "6", "7", "8"
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  frameworkId: integer("framework_id").references(() => curriculumFrameworks.id).notNull(),
  metadata: json("metadata"), // Subject-specific data like hierarchy patterns
  active: boolean("active").notNull().default(true),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Curriculum structure: content_areas → standards → sub_lessons
// Option A: Treat 6.NS.1.a as main standard level
export const standards = pgTable("standards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g., "6.NS.1.a", "6.NS.1.b"
  description: text("description").notNull(),
  contentAreaId: integer("content_area_id").references(() => contentAreas.id).notNull(),
  order: integer("order").notNull().default(0),
});

// Keep sub_standards table for future subjects like Science (not used for Math)
export const subStandards = pgTable("sub_standards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g., "6.NS.1.a"
  description: text("description").notNull(),
  examples: json("examples").notNull(), // array of example strings
  standardId: integer("standard_id").references(() => standards.id).notNull(),
  order: integer("order").notNull().default(0),
});

// Sub-lessons now reference standards directly (Option A)
export const subLessons = pgTable("sub_lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code"), // e.g., "6-U.1"
  explanation: text("explanation").notNull(),
  examples: json("examples").notNull(), // array of example strings
  standardId: integer("standard_id").references(() => standards.id).notNull(), // Direct reference to standards
  order: integer("order").notNull().default(0),
});

// Keep old lessons table for backward compatibility
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: json("content"), // Make optional for new curriculum structure
  category: text("category"), // Make optional for new curriculum structure
  order: integer("order").notNull().default(0),
  
  // New curriculum structure fields
  strandCode: text("strand_code"),
  strandName: text("strand_name"),
  standard: text("standard"),
  standardText: text("standard_text"),
  subStandard: text("sub_standard"), // e.g., "6.NS.1.a"
  subStandardText: text("sub_standard_text"),
  examples: json("examples"), // array of example strings
  
  // Metadata
  grade: text("grade"),
  subject: text("subject"),
  state: text("state"),
  
  // Direct foreign key to content areas (simplified structure)
  contentAreaId: integer("content_area_id").references(() => contentAreas.id),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sessionId: text("session_id").notNull(),
});

export const aiResponses = pgTable("ai_responses", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sessionId: text("session_id").notNull(),
});

// Official Virginia DOE Standards Enhancement
export const officialStandards = pgTable("official_standards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g., "6.NS.1"
  title: text("title").notNull(),
  description: text("description").notNull(),
  understandingTheStandard: text("understanding_the_standard"),
  skillsInPractice: json("skills_in_practice"), // Array of skills
  conceptsAndConnections: json("concepts_and_connections"), // Related concepts
  assessmentNotes: text("assessment_notes"),
  grade: text("grade").notNull(),
  subject: text("subject").notNull(),
  state: text("state").notNull().default("Virginia"),
});

// Teaching Strategies from the guide
export const teachingStrategies = pgTable("teaching_strategies", {
  id: serial("id").primaryKey(),
  standardCode: text("standard_code").notNull(),
  strategyType: text("strategy_type").notNull(), // e.g., "Mathematical Connections", "Mathematical Reasoning"
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  materials: json("materials"), // Array of required materials
  misconceptions: json("misconceptions"), // Common student misconceptions
  guidingQuestions: json("guiding_questions"), // Array of questions
  officialStandardId: integer("official_standard_id").references(() => officialStandards.id),
});

// Benchmark activities from the guide
export const benchmarkActivities = pgTable("benchmark_activities", {
  id: serial("id").primaryKey(),
  standardCode: text("standard_code").notNull(),
  activityType: text("activity_type").notNull(), // e.g., "Human Number Line", "Card Game"
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: json("instructions"), // Step-by-step instructions
  benchmarks: json("benchmarks"), // e.g., ["0%", "25%", "50%", "75%", "100%"]
  materials: json("materials"),
  variations: json("variations"), // Activity variations
  officialStandardId: integer("official_standard_id").references(() => officialStandards.id),
});

// Common misconceptions from the guide
export const commonMisconceptions = pgTable("common_misconceptions", {
  id: serial("id").primaryKey(),
  standardCode: text("standard_code").notNull(),
  misconceptionType: text("misconception_type").notNull(),
  description: text("description").notNull(),
  incorrectAnswer: text("incorrect_answer"),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation").notNull(),
  teachingStrategy: text("teaching_strategy"),
  officialStandardId: integer("official_standard_id").references(() => officialStandards.id),
});

// Phase 1: Insert schemas for new tables
export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export const insertCurriculumFrameworkSchema = createInsertSchema(curriculumFrameworks).omit({
  id: true,
});

export const insertContentAreaSchema = createInsertSchema(contentAreas).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});



export const insertStandardSchema = createInsertSchema(standards).omit({
  id: true,
});

export const insertSubStandardSchema = createInsertSchema(subStandards).omit({
  id: true,
});

export const insertSubLessonSchema = createInsertSchema(subLessons).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAiResponseSchema = createInsertSchema(aiResponses).omit({
  id: true,
  timestamp: true,
});

// Phase 1: Types for new tables
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertCurriculumFramework = z.infer<typeof insertCurriculumFrameworkSchema>;
export type CurriculumFramework = typeof curriculumFrameworks.$inferSelect;
export type InsertContentArea = z.infer<typeof insertContentAreaSchema>;
export type ContentArea = typeof contentAreas.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStandard = z.infer<typeof insertStandardSchema>;
export type Standard = typeof standards.$inferSelect;
export type InsertSubStandard = z.infer<typeof insertSubStandardSchema>;
export type SubStandard = typeof subStandards.$inferSelect;
export type InsertSubLesson = z.infer<typeof insertSubLessonSchema>;
export type SubLesson = typeof subLessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertAiResponse = z.infer<typeof insertAiResponseSchema>;
export type AiResponse = typeof aiResponses.$inferSelect;
