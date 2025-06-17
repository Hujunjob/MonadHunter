// @ts-ignore
declare const Multisynq: any;

import type { GameState, PlayerInput } from './GameModel';

export class GameView extends Multisynq.View {
  private onStateUpdate?: (state: GameState) => void;
  private onGameOver?: (stats: any) => void;

  constructor(_gameModel: any) {
    super();
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    // Subscribe to game state updates
    this.subscribe('game', 'state-update', this.handleStateUpdate);
    this.subscribe('game', 'over', this.handleGameOver);
    this.subscribe('player', 'position-update', this.handlePlayerPositionUpdate);
    this.subscribe('player', 'level-up', this.handlePlayerLevelUp);
    this.subscribe('bullet', 'created', this.handleBulletCreated);
  }

  // Event handlers
  private handleStateUpdate = (state: GameState) => {
    if (this.onStateUpdate) {
      this.onStateUpdate(state);
    }
  };

  private handleGameOver = (stats: any) => {
    if (this.onGameOver) {
      this.onGameOver(stats);
    }
  };

  private handlePlayerPositionUpdate = (position: { x: number; y: number }) => {
    // Handle player position updates from server
    console.log('Player position updated:', position);
  };

  private handlePlayerLevelUp = (levelData: any) => {
    console.log('Player leveled up:', levelData);
  };

  private handleBulletCreated = (bullet: any) => {
    console.log('Bullet created:', bullet);
  };

  // Public methods for game control
  startGame() {
    this.publish('game', 'start', {});
  }

  restartGame() {
    this.publish('game', 'restart', {});
  }

  sendPlayerInput(input: PlayerInput) {
    // Add timestamp for anti-cheat validation
    input.timestamp = Date.now();
    this.publish('player', 'input', input);
  }

  // Callbacks setup
  onStateChange(callback: (state: GameState) => void) {
    this.onStateUpdate = callback;
  }

  onGameEnd(callback: (stats: any) => void) {
    this.onGameOver = callback;
  }

  // Input helpers
  sendMoveInput(direction: { x: number; y: number }) {
    // Normalize direction vector to prevent cheating
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude > 0) {
      direction.x /= magnitude;
      direction.y /= magnitude;
    }

    this.sendPlayerInput({
      type: 'move',
      direction,
      timestamp: Date.now()
    });
  }

  sendShootInput() {
    this.sendPlayerInput({
      type: 'shoot',
      timestamp: Date.now()
    });
  }
}