import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: priorityEnum("priority").notNull().default('medium'),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const taskCategories = pgTable("task_categories", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  emailNotifications: boolean("email_notifications").default(false),
  pushNotifications: boolean("push_notifications").default(false),
  theme: text("theme").default('light'),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  completed: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  description: true,
  userId: true,
});

export const insertTaskCategorySchema = createInsertSchema(taskCategories).pick({
  taskId: true,
  categoryId: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  emailNotifications: true,
  pushNotifications: true,
  theme: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertTaskCategory = z.infer<typeof insertTaskCategorySchema>;
export type TaskCategory = typeof taskCategories.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
