import type { EnergyForecast, Stake, Trade } from "@shared/schema";

export interface ForecastRequest {
  walletAddress: string;
  historicalData?: number[];
}

export interface StakeRequest {
  walletAddress: string;
  amount: string;
  energyNeed: number;
  transactionHash?: string;
  status: string;
}

export interface TradeRequest {
  walletAddress: string;
  fromChain: string;
  toChain: string;
  etkAmount: string;
  pyusdAmount: string;
  transactionHash?: string;
  status: string;
}

export const api = {
  // Forecast endpoints
  async createForecast(data: ForecastRequest): Promise<EnergyForecast> {
    const response = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create forecast');
    }
    return response.json();
  },

  async getForecasts(walletAddress: string): Promise<EnergyForecast[]> {
    const response = await fetch(`/api/forecast/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch forecasts');
    return response.json();
  },

  // Stake endpoints
  async createStake(data: StakeRequest): Promise<Stake> {
    const response = await fetch('/api/stake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create stake');
    }
    return response.json();
  },

  async updateStake(id: string, updates: Partial<StakeRequest>): Promise<Stake> {
    const response = await fetch(`/api/stake/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update stake');
    }
    return response.json();
  },

  async getStakes(walletAddress: string): Promise<Stake[]> {
    const response = await fetch(`/api/stake/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch stakes');
    return response.json();
  },

  // Trade endpoints
  async createTrade(data: TradeRequest): Promise<Trade> {
    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create trade');
    }
    return response.json();
  },

  async updateTrade(id: string, updates: Partial<TradeRequest>): Promise<Trade> {
    const response = await fetch(`/api/trade/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update trade');
    }
    return response.json();
  },

  async getTrades(walletAddress: string): Promise<Trade[]> {
    const response = await fetch(`/api/trade/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch trades');
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
};
