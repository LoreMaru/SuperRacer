//se abbiamo diviso le scene in più file serve l'import nel main
import { GameScene } from './GameScene.js';
import { SelectScene } from './SelectScene.js';
import { GameOverScene } from './GameOverScene.js';


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [SelectScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);