import MenuScene from './MenuScene.js';
import GameScene from './GameScene.js';
import PlayScene from './PlayScene.js';
import PauseScene from './PauseScene.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true // Ativa visualização dos corpos físicos
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, GameScene, PlayScene, PauseScene]
};

const game = new Phaser.Game(config);
