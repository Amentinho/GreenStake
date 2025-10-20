import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Energy forecast data model
export const energyForecasts = pgTable("energy_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  historicalData: text("historical_data").notNull(), // JSON string of kWh values
  predictedConsumption: integer("predicted_consumption").notNull(), // kWh
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ZKP stake records
export const stakes = pgTable("stakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  amount: numeric("amount").notNull(), // ETK amount
  energyNeed: integer("energy_need").notNull(), // kWh
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Cross-chain trade records
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  fromChain: text("from_chain").notNull(),
  toChain: text("to_chain").notNull(),
  etkAmount: numeric("etk_amount").notNull(),
  pyusdAmount: numeric("pyusd_amount").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, bridging, executed, failed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertEnergyForecastSchema = createInsertSchema(energyForecasts).omit({
  id: true,
  timestamp: true,
});

export const insertStakeSchema = createInsertSchema(stakes).omit({
  id: true,
  timestamp: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

// TypeScript types
export type InsertEnergyForecast = z.infer<typeof insertEnergyForecastSchema>;
export type EnergyForecast = typeof energyForecasts.$inferSelect;

export type InsertStake = z.infer<typeof insertStakeSchema>;
export type Stake = typeof stakes.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
