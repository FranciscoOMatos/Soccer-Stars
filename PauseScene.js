export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.add.rectangle(centerX, centerY, 400, 250, 0x000000, 0.7).setOrigin(0.5);
        this.add.text(centerX, centerY - 80, 'Jogo em Pausa', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const btnContinuar = this.add.text(centerX, centerY - 10, '▶️ Continuar', {
            fontSize: '26px',
            backgroundColor: '#28a745',
            color: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const btnMenu = this.add.text(centerX, centerY + 60, '🏠 Voltar ao Menu', {
            fontSize: '26px',
            backgroundColor: '#dc3545',
            color: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        btnContinuar.on('pointerdown', () => {
            this.scene.stop(); // fecha PauseScene
            this.scene.resume('PlayScene'); // retoma o jogo
        });

        btnMenu.on('pointerdown', () => {
            this.scene.stop('PlayScene'); // termina o jogo
            this.scene.start('MenuScene'); // volta ao menu
        });
    }
}
