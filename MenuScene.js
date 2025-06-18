export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('campo', 'assets/campo.png');
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.add.image(centerX, centerY, 'campo')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(centerX, centerY - 200, 'SOCCER', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(centerX, centerY - 140, 'STARS', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

        const botaoCPU = this.add.text(centerX, centerY - 20, '🤖 Contra o Computador', {
            fontSize: '28px', backgroundColor: '#1e90ff', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const botaoAmigo = this.add.text(centerX, centerY + 60, '🧍‍♂️ Contra um Amigo', {
            fontSize: '28px', backgroundColor: '#dc143c', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const botaoInstrucoes = this.add.text(centerX, centerY + 140, 'ℹ Instruções', {
            fontSize: '24px', backgroundColor: '#6c757d', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        botaoCPU.on('pointerdown', () => this.scene.start('GameScene', { modo: 'cpu' }));
        botaoAmigo.on('pointerdown', () => this.scene.start('GameScene', { modo: 'amigo' }));
        botaoInstrucoes.on('pointerdown', () => this.mostrarInstrucoes());
    }

    mostrarInstrucoes() {
        const largura = this.cameras.main.width;
        const altura = this.cameras.main.height;

        const fundo = this.add.rectangle(largura / 2, altura / 2, largura * 0.8, altura * 0.7, 0x000000, 0.8).setOrigin(0.5);

        const texto = `
MODOS DE JOGO:
- Contra o Computador: Jogas sozinho contra a IA.
- Contra um Amigo: Dois jogadores no mesmo teclado.

CONTROLOS:
- Jogador 1 (WASD + SHIFT)
- Jogador 2 (Setas + ESPAÇO)

OBJETIVO:
- Marca golos na baliza adversária.
        `.trim();

        const instrucoes = this.add.text(largura / 2, altura / 2, texto, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: largura * 0.7 }
        }).setOrigin(0.5);

        const botaoFechar = this.add.text(largura / 2, altura - 100, '❌ Fechar', {
            fontSize: '24px', backgroundColor: '#dc3545', color: '#ffffff', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        botaoFechar.on('pointerdown', () => {
            fundo.destroy();
            instrucoes.destroy();
            botaoFechar.destroy();
        });
    }
}
