import { users, type User, type InsertUser, gameProgress, type GameProgress, type InsertGameProgress } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameProgress(sessionId: string): Promise<GameProgress | undefined>;
  createGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  updateGameProgress(sessionId: string, progress: Partial<GameProgress>): Promise<GameProgress | undefined>;
}

export class DBStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getGameProgress(sessionId: string): Promise<GameProgress | undefined> {
    const result = await db.select().from(gameProgress).where(eq(gameProgress.sessionId, sessionId));
    return result[0];
  }

  async createGameProgress(progress: InsertGameProgress): Promise<GameProgress> {
    const result = await db.insert(gameProgress).values(progress).returning();
    return result[0];
  }

  async updateGameProgress(sessionId: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined> {
    const result = await db
      .update(gameProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameProgress.sessionId, sessionId))
      .returning();
    return result[0];
  }
}

export const storage = new DBStorage();
