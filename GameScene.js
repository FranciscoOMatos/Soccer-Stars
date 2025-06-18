export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.modo = data.modo;
    }

    preload() {
        this.load.image('campo', 'assets/campo.png');
    }

    create() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        this.add.image(cx, cy, 'campo').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(cx, cy - 180, 'Escolhe a tua Equipa', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const botaoVermelho = this.add.text(cx, cy - 40, 'Equipa Vermelha', {
            fontSize: '28px', backgroundColor: '#b22222', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const botaoAzul = this.add.text(cx, cy + 40, 'Equipa Azul', {
            fontSize: '28px', backgroundColor: '#1e90ff', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        botaoVermelho.on('pointerdown', () => this.scene.start('PlayScene', { modo: this.modo, equipa: 'vermelho' }));
        botaoAzul.on('pointerdown', () => this.scene.start('PlayScene', { modo: this.modo, equipa: 'azul' }));
    }
}
