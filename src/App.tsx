import { useEffect, useRef } from 'react';
import { Game } from './Game';
import './App.css';

function App() {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Game();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>吸血鬼幸存者</h1>
      <p>使用方向键移动，自动攻击最近的敌人</p>
      <div id="game-container"></div>
    </div>
  );
}

export default App
