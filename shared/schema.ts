import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  deathCurrency: integer("death_currency").notNull().default(0),
  skillTree: jsonb("skill_tree").notNull(),
  permanentBonuses: jsonb("permanent_bonuses").notNull(),
  totalWavesReached: integer("total_waves_reached").notNull().default(0),
  totalEnemiesKilled: integer("total_enemies_killed").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  playerColor: text("player_color").notNull().default('#00ff88'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGameProgressSchema = createInsertSchema(gameProgress);
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
