// @ts-ignore
declare const Multisynq: any;

import { GameModel } from './GameModel';
import { GameView } from './GameView';

export class MultiSynqManager {
  private session: any;
  private gameModel?: GameModel;
  private gameView?: GameView;
  private isInitialized = false;

  async initialize(appId: string = 'com.monadhunter.game') {
    try {
      console.log('Initializing MultiSynq...');
      
      // Get API key from environment variables
      const apiKey = this.getApiKeyFromEnv();
      if (!apiKey) {
        throw new Error('MultiSynq API key not found in environment variables');
      }
      
      // Create session
      this.session = new Multisynq.Session(appId, apiKey);
      
      // Join session
      await this.session.join();
      console.log('Joined MultiSynq session');

      // Create and register GameModel
      this.gameModel = GameModel.create();
      this.session.addModel(this.gameModel);
      
      // Create GameView
      this.gameView = new GameView(this.gameModel);
      
      this.isInitialized = true;
      console.log('MultiSynq initialized successfully');
      
      return {
        model: this.gameModel,
        view: this.gameView
      };
    } catch (error) {
      console.error('Failed to initialize MultiSynq:', error);
      throw error;
    }
  }

  getGameView(): GameView | undefined {
    return this.gameView;
  }

  getGameModel(): GameModel | undefined {
    return this.gameModel;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.gameView && !!this.gameModel;
  }

  async disconnect() {
    if (this.session) {
      await this.session.leave();
      this.isInitialized = false;
      console.log('Disconnected from MultiSynq');
    }
  }

  // Get API key from environment variables
  private getApiKeyFromEnv(): string | null {
    return import.meta.env.VITE_MULTISYNQ_API_KEY || null;
  }

  // Check if MultiSynq is available (has API key)
  static isAvailable(): boolean {
    return !!(import.meta.env.VITE_MULTISYNQ_API_KEY);
  }
}