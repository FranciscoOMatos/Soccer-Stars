// SCENA 1 – MENU
class MenuScene extends Phaser.Scene {
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

    const fundo = this.add.rectangle(largura / 2, altura / 2, largura * 0.8, altura * 0.7, 0x000000, 0.8)
        .setOrigin(0.5);
    
    const texto = `
MODOS DE JOGO:
- Contra o Computador: Jogas sozinho contra a IA.
- Contra um Amigo: Dois jogadores no mesmo teclado.

CONTROLOS:
- Jogador 1 (WASD + SHIFT):
    W, A, S, D para mover
    SHIFT para rematar
- Jogador 2 (Setas + ESPAÇO):
    ← ↑ ↓ → para mover
    ESPAÇO para rematar

OBJETIVO:
- Marca golos empurrando a bola para a baliza adversária.
- Vence quem tiver mais golos no fim do tempo.
    `.trim();

    const instrucoes = this.add.text(largura / 2, altura / 2, texto, {
        fontSize: '20px',
        color: '#ffffff',
        align: 'left',
        wordWrap: { width: largura * 0.7 }
    }).setOrigin(0.5);

    const botaoFechar = this.add.text(largura / 2, altura - 100, '❌ Fechar', {
        fontSize: '24px',
        backgroundColor: '#dc3545',
        color: '#ffffff',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    botaoFechar.on('pointerdown', () => {
        fundo.destroy();
        instrucoes.destroy();
        botaoFechar.destroy();
    });
}
}

// SCENA 2 – ESCOLHA DE EQUIPA
class GameScene extends Phaser.Scene {
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

// SCENA 3 – JOGO
class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    init(data) {
        this.modo = data.modo;
        this.equipa = data.equipa;
    }

    preload() {
        this.load.image('campo', 'assets/campo.png');
        this.load.image('bola', 'assets/bola.png');
        this.load.image('jogador1', 'assets/jogador1.png');
        this.load.image('jogador2', 'assets/jogador2.png');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.add.image(centerX, centerY, 'campo').setDisplaySize(width, height);

        this.ultimoChuteBot = 0; // marca de tempo do último chute do bot

        const esquerda = width * 0.2;
        const direita = width * 0.8;

        // Jogadores
        this.jogador1 = this.physics.add.image(esquerda, centerY, 'jogador1').setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);
        this.jogador2 = this.physics.add.image(direita, centerY, 'jogador2').setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);

        this.posInicialJogador1 = { x: this.jogador1.x, y: this.jogador1.y };
        this.posInicialJogador2 = { x: this.jogador2.x, y: this.jogador2.y };


        this.jogador1.body.setCircle(this.jogador1.displayWidth / 2 * 1.1);
        this.jogador1.body.setOffset(this.jogador1.displayWidth / 2 - this.jogador1.body.halfWidth, this.jogador1.displayHeight / 2 - this.jogador1.body.halfHeight);

        this.jogador2.body.setCircle(this.jogador2.displayWidth / 2 * 1.1);
        this.jogador2.body.setOffset(this.jogador2.displayWidth / 2 - this.jogador2.body.halfWidth, this.jogador2.displayHeight / 2 - this.jogador2.body.halfHeight);

        // Bola
        this.bola = this.physics.add.image(centerX, centerY, 'bola').setScale(0.1).setCollideWorldBounds(true).setBounce(0.9);
        this.bola.body.setCircle(this.bola.displayWidth / 2 * 1.05);
        this.bola.body.setOffset(this.bola.displayWidth / 2 - this.bola.body.halfWidth, this.bola.displayHeight / 2 - this.bola.body.halfHeight);

        this.physics.add.collider(this.jogador1, this.bola);
        this.physics.add.collider(this.jogador2, this.bola);
        this.physics.add.collider(this.jogador1, this.jogador2);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.chuteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keysWASD = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.chuteKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.controlosAtivos = false;

        // Golos e timer
        this.golos = { vermelho: 0, azul: 0 };
        this.timer = 120;
        this.timerText = this.add.text(60, 50, '', { fontSize: '32px', color: '#fff' });
        this.golosText = this.add.text(60, 90, '', { fontSize: '24px', color: '#fff' });


        this.atualizarUI();
        this.iniciarJogo();
    }

    atualizarUI() {
       this.timerText.setText(`Tempo: ${this.timer}s`);
this.golosText.setText(`Vermelho: ${this.golos.vermelho} | Azul: ${this.golos.azul}`);
    }

iniciarJogo() {
    this.controlosAtivos = false;

    // Reposicionar bola no centro
    this.bola.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
    this.bola.setVelocity(0);

    // Reposicionar jogadores
    this.jogador1.setVelocity(0);
    this.jogador2.setVelocity(0);
    this.jogador1.setPosition(this.posInicialJogador1.x, this.posInicialJogador1.y);
    this.jogador2.setPosition(this.posInicialJogador2.x, this.posInicialJogador2.y);

    // Reiniciar o contador visual de 5s
    if (this.contadorTexto) this.contadorTexto.destroy();

    let tempo = 5;
    this.contadorTexto = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, tempo, {
        fontSize: '80px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.contagem = this.time.addEvent({
        delay: 1000,
        repeat: 5,
        callback: () => {
            tempo--;
            if (tempo > 0) {
                this.contadorTexto.setText(tempo);
            } else if (tempo === 0) {
                this.contadorTexto.setText("GO!");
            } else {
                this.contadorTexto.destroy();
                this.controlosAtivos = true;

                // Só iniciar o cronómetro de 2min no início do jogo
                if (!this.temporizadorIniciado) {
                    this.temporizadorIniciado = true;
                    this.iniciarTemporizador();
                }
            }
        }
    });
}

tentarChutar(jogador) {
    const dx = this.bola.x - jogador.x;
    const dy = this.bola.y - jogador.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Evita divisão por zero ou valores inválidos
    if (dist > 0.1) {
        const chuteForca = 300;
        const normX = dx / dist;
        const normY = dy / dist;
        this.bola.setVelocity(normX * chuteForca, normY * chuteForca);
    }
}


iniciarTemporizador() {
    this.temporizador = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (this.timer > 0) {
                this.timer--;
                this.atualizarUI();
            } else {
                this.controlosAtivos = false;
                this.timerText.setText('FIM DE JOGO');

                // Parar jogadores e bola
                this.jogador1.setVelocity(0);
                this.jogador2.setVelocity(0);
                this.bola.setVelocity(0);


                const vencedor = this.golos.vermelho > this.golos.azul
                    ? 'Vermelho venceu!'
                    : this.golos.azul > this.golos.vermelho
                        ? 'Azul venceu!'
                        : 'Empate!';

                this.add.text(this.cameras.main.centerX, 100, vencedor, {
                    fontSize: '40px',
                    color: '#fff'
                }).setOrigin(0.5);

                // Botão: Jogar Novamente
                const btnJogarNovamente = this.add.text(this.cameras.main.centerX, 200, '🔁 Jogar Novamente', {
                    fontSize: '30px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    padding: { x: 15, y: 10 }
                }).setOrigin(0.5).setInteractive();

                btnJogarNovamente.on('pointerdown', () => {
                    this.scene.restart({ modo: this.modo, equipa: this.equipa });
                });

                // Botão: Voltar ao Menu
                const btnVoltarMenu = this.add.text(this.cameras.main.centerX, 280, '🏠 Menu Principal', {
                    fontSize: '30px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    padding: { x: 15, y: 10 }
                }).setOrigin(0.5).setInteractive();

                btnVoltarMenu.on('pointerdown', () => {
                    this.scene.start('MenuScene');
                });

                // Parar o temporizador
                this.temporizador.remove();
            }
        }
    });
}

    update() {
    if (!this.controlosAtivos) return;

    const speed = 200;

    const j1 = this.jogador1;
    const j2 = this.jogador2;

    // === Jogador 1 (WASD) ===
    if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'vermelho')) {
        if (this.keysWASD.left.isDown) j1.setVelocityX(-speed);
        else if (this.keysWASD.right.isDown) j1.setVelocityX(speed);
        else j1.setVelocityX(0);

        if (this.keysWASD.up.isDown) j1.setVelocityY(-speed);
        else if (this.keysWASD.down.isDown) j1.setVelocityY(speed);
        else j1.setVelocityY(0);
    }

    // === Jogador 2 (setas) ===
    if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'azul')) {
        if (this.cursors.left.isDown) j2.setVelocityX(-speed);
        else if (this.cursors.right.isDown) j2.setVelocityX(speed);
        else j2.setVelocityX(0);

        if (this.cursors.up.isDown) j2.setVelocityY(-speed);
        else if (this.cursors.down.isDown) j2.setVelocityY(speed);
        else j2.setVelocityY(0);
    }

    // === Jogador controlado pelo computador (IA) ===
if (this.modo === 'cpu' && this.controlosAtivos) {
    const bot = this.equipa === 'vermelho' ? j2 : j1;
    const isBotLeft = bot.x < this.cameras.main.centerX;
    const goalX = isBotLeft ? this.cameras.main.width - 50 : 50;

    const distBola = Phaser.Math.Distance.Between(bot.x, bot.y, this.bola.x, this.bola.y);
    const bolaNoCampoBot = (isBotLeft && this.bola.x < this.cameras.main.centerX) ||
                           (!isBotLeft && this.bola.x > this.cameras.main.centerX);

    if (bolaNoCampoBot) {
        const defesaX = isBotLeft ? 100 : this.cameras.main.width - 100;
        bot.setVelocity((defesaX - bot.x) * 0.5, (this.bola.y - bot.y) * 0.5);
    } else {
        bot.setVelocity((this.bola.x - bot.x) * 0.5, (this.bola.y - bot.y) * 0.5);
    }

    if (distBola < 60 && this.time.now - this.ultimoChuteBot > 800) {
        const direcaoX = goalX - bot.x;
        const direcaoY = this.cameras.main.centerY - bot.y;
        const magnitude = Math.sqrt(direcaoX * direcaoX + direcaoY * direcaoY);
        if (magnitude > 0) {
            this.bola.setVelocity((direcaoX / magnitude) * 200, (direcaoY / magnitude) * 200);
        }
        this.ultimoChuteBot = this.time.now;
    }
}

    // === Chutes ===
    if (Phaser.Input.Keyboard.JustDown(this.chuteKey2)) this.tentarChutar(j1);
    if (this.modo === 'amigo' && Phaser.Input.Keyboard.JustDown(this.chuteKey)) this.tentarChutar(j2);

    // === Golo ===
    const alturaBalizaTop = 220;
    const alturaBalizaBot = 460;
    const naBalizaY = this.bola.y > alturaBalizaTop && this.bola.y < alturaBalizaBot;

    const golEsquerdo = this.bola.x < 60 && naBalizaY;
    const golDireito = this.bola.x > this.cameras.main.width - 60 && naBalizaY;

    if (golEsquerdo || golDireito) {
        if (golEsquerdo) this.golos.azul++;
        else this.golos.vermelho++;
        this.atualizarUI();
        this.iniciarJogo();
    }
}
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, GameScene, PlayScene]
};

const game = new Phaser.Game(config);