// @ts-ignore
declare const Multisynq: any;

import { GameModel } from './GameModel';
import { GameView } from './GameView';

export class MultiSynqManager {
  private session: any;
  private gameModel?: GameModel;
  private gameView?: GameView;
  private isInitialized = false;

  async initialize(apiKey: string, appId: string = 'com.monadhunter.game') {
    try {
      console.log('Initializing MultiSynq...');
      
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

  // Helper method to get API key from environment or prompt user
  static async getApiKey(): Promise<string> {
    // First check if API key is stored in localStorage
    const storedKey = localStorage.getItem('multisynq_api_key');
    if (storedKey) {
      return storedKey;
    }

    // Prompt user for API key
    const apiKey = prompt(
      'Please enter your MultiSynq API key.\n\n' +
      'If you don\'t have one, visit https://multisynq.io/coder to sign up (free, no credit card required).'
    );

    if (!apiKey) {
      throw new Error('MultiSynq API key is required');
    }

    // Store for future use
    localStorage.setItem('multisynq_api_key', apiKey);
    return apiKey;
  }
}