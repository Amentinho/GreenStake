import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { HfInference } from "@huggingface/inference";
import { insertEnergyForecastSchema, insertStakeSchema, insertTradeSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const hf = new HfInference(process.env.HF_TOKEN);

// Default historical data for demo
const DEFAULT_HISTORICAL_DATA = [1000, 1200, 1100, 1350, 1250];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Energy Forecast Endpoint
  app.post("/api/forecast", async (req, res) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: "walletAddress is required" });
      }

      // Use historical data from request or defaults
      const historicalData = req.body.historicalData || DEFAULT_HISTORICAL_DATA;

      // Call Hugging Face AI for prediction
      let predictedConsumption = 1300; // Fallback

      try {
        const prompt = `Given the historical energy consumption data in kWh: ${JSON.stringify(historicalData)}, predict the next month's energy consumption. Return only a number between 1000 and 2000.`;
        
        const response = await hf.textGeneration({
          model: 'gpt2',
          inputs: prompt,
          parameters: {
            max_new_tokens: 10,
            temperature: 0.7,
            return_full_text: false,
          },
        });

        // Extract number from AI response
        const match = response.generated_text.match(/\d+/);
        if (match) {
          const predicted = parseInt(match[0]);
          // Validate range
          if (predicted >= 1000 && predicted <= 2000) {
            predictedConsumption = predicted;
          }
        }
      } catch (aiError) {
        console.error("AI Forecast Error:", aiError);
        // Use simple average + variance as fallback
        const avg = historicalData.reduce((a: number, b: number) => a + b, 0) / historicalData.length;
        predictedConsumption = Math.round(avg * (1 + (Math.random() * 0.2 - 0.1)));
      }

      // Store forecast in database
      const forecast = await storage.createForecast({
        walletAddress,
        historicalData: JSON.stringify(historicalData),
        predictedConsumption,
      });

      res.json(forecast);
    } catch (error) {
      console.error("Forecast endpoint error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate forecast" 
      });
    }
  });

  // Get forecasts for a wallet
  app.get("/api/forecast/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const forecasts = await storage.getForecastsByWallet(walletAddress);
      res.json(forecasts);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch forecasts" 
      });
    }
  });

  // Create stake record
  app.post("/api/stake", async (req, res) => {
    try {
      const validation = insertStakeSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).message;
        return res.status(400).json({ error: errorMessage });
      }

      const stake = await storage.createStake(validation.data);
      res.json(stake);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create stake" 
      });
    }
  });

  // Update stake record
  app.patch("/api/stake/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const stake = await storage.updateStake(id, req.body);
      res.json(stake);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update stake" 
      });
    }
  });

  // Get stakes for a wallet
  app.get("/api/stake/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const stakes = await storage.getStakesByWallet(walletAddress);
      res.json(stakes);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch stakes" 
      });
    }
  });

  // Create trade record
  app.post("/api/trade", async (req, res) => {
    try {
      const validation = insertTradeSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).message;
        return res.status(400).json({ error: errorMessage });
      }

      const trade = await storage.createTrade(validation.data);
      res.json(trade);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create trade" 
      });
    }
  });

  // Update trade record
  app.patch("/api/trade/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const trade = await storage.updateTrade(id, req.body);
      res.json(trade);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update trade" 
      });
    }
  });

  // Get trades for a wallet
  app.get("/api/trade/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const trades = await storage.getTradesByWallet(walletAddress);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch trades" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      services: {
        ai: !!process.env.HF_TOKEN,
        storage: true,
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
