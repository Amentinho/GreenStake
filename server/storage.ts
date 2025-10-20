import type { EnergyForecast, InsertEnergyForecast, Stake, InsertStake, Trade, InsertTrade } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Energy forecasts
  createForecast(forecast: InsertEnergyForecast): Promise<EnergyForecast>;
  getForecastsByWallet(walletAddress: string): Promise<EnergyForecast[]>;
  
  // Stakes
  createStake(stake: InsertStake): Promise<Stake>;
  updateStake(id: string, updates: Partial<InsertStake>): Promise<Stake>;
  getStakesByWallet(walletAddress: string): Promise<Stake[]>;
  
  // Trades
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade>;
  getTradesByWallet(walletAddress: string): Promise<Trade[]>;
}

export class MemStorage implements IStorage {
  private forecasts: Map<string, EnergyForecast>;
  private stakes: Map<string, Stake>;
  private trades: Map<string, Trade>;

  constructor() {
    this.forecasts = new Map();
    this.stakes = new Map();
    this.trades = new Map();
  }

  // Energy forecasts
  async createForecast(insertForecast: InsertEnergyForecast): Promise<EnergyForecast> {
    const id = randomUUID();
    const forecast: EnergyForecast = {
      ...insertForecast,
      id,
      timestamp: new Date(),
    };
    this.forecasts.set(id, forecast);
    return forecast;
  }

  async getForecastsByWallet(walletAddress: string): Promise<EnergyForecast[]> {
    return Array.from(this.forecasts.values())
      .filter((f) => f.walletAddress === walletAddress)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Stakes
  async createStake(insertStake: InsertStake): Promise<Stake> {
    const id = randomUUID();
    const stake: Stake = {
      ...insertStake,
      id,
      timestamp: new Date(),
    };
    this.stakes.set(id, stake);
    return stake;
  }

  async updateStake(id: string, updates: Partial<InsertStake>): Promise<Stake> {
    const existing = this.stakes.get(id);
    if (!existing) {
      throw new Error(`Stake ${id} not found`);
    }
    const updated: Stake = {
      ...existing,
      ...updates,
    };
    this.stakes.set(id, updated);
    return updated;
  }

  async getStakesByWallet(walletAddress: string): Promise<Stake[]> {
    return Array.from(this.stakes.values())
      .filter((s) => s.walletAddress === walletAddress)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Trades
  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = {
      ...insertTrade,
      id,
      timestamp: new Date(),
    };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade> {
    const existing = this.trades.get(id);
    if (!existing) {
      throw new Error(`Trade ${id} not found`);
    }
    const updated: Trade = {
      ...existing,
      ...updates,
    };
    this.trades.set(id, updated);
    return updated;
  }

  async getTradesByWallet(walletAddress: string): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter((t) => t.walletAddress === walletAddress)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
