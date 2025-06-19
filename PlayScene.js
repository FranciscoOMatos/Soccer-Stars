export default class PlayScene extends Phaser.Scene {
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
        this.ultimoChuteBot = 0;
        this.goloEmAndamento = false;

        const esquerda = width * 0.2;
        const direita = width * 0.8;

        this.jogador1 = this.physics.add.image(esquerda, centerY, 'jogador1')
            .setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);
        this.jogador2 = this.physics.add.image(direita, centerY, 'jogador2')
            .setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);

        this.posInicialJogador1 = { x: this.jogador1.x, y: this.jogador1.y };
        this.posInicialJogador2 = { x: this.jogador2.x, y: this.jogador2.y };

        const raioJogador = this.jogador1.displayWidth / 2;
        [this.jogador1, this.jogador2].forEach(j => {
            j.body.setCircle(raioJogador);
            j.body.setOffset(j.displayWidth / 2 - raioJogador, j.displayHeight / 2 - raioJogador);
        });

        this.bola = this.physics.add.image(centerX, centerY, 'bola')
            .setScale(0.15).setCollideWorldBounds(true).setBounce(0.9);
        const raioBola = this.bola.displayWidth / 2;
        this.bola.body.setCircle(raioBola);
        this.bola.body.setOffset(this.bola.displayWidth / 2 - raioBola, this.bola.displayHeight / 2 - raioBola);

        this.physics.add.collider(this.jogador1, this.bola);
        this.physics.add.collider(this.jogador2, this.bola);
        this.physics.add.collider(this.jogador1, this.jogador2);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.chuteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.chuteKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keysWASD = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.controlosAtivos = false;
        this.golos = { vermelho: 0, azul: 0 };
        this.timer = 90;
        this.temporizadorAtivo = true;

        this.uiContainer = this.add.rectangle(centerX, 60, 340, 80, 0x000000, 0.6)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(0);

        this.timerText = this.add.text(centerX, 50, '', {
            fontSize: '24px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5).setDepth(1);

        this.scoreVermelho = this.add.text(centerX - 80, 75, '', {
            fontSize: '20px', fontFamily: 'Arial', color: '#ff0000'
        }).setOrigin(0.5).setDepth(1);

        this.scoreSeparador = this.add.text(centerX, 75, '|', {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5).setDepth(1);

        this.scoreAzul = this.add.text(centerX + 80, 75, '', {
            fontSize: '20px', fontFamily: 'Arial', color: '#1e90ff'
        }).setOrigin(0.5).setDepth(1);

        this.goloMensagem = this.add.text(centerX, centerY - 100, '', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        this.atualizarUI();
        this.iniciarJogo();

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.controlosAtivos) {
                this.scene.launch('PauseScene');
                this.scene.pause();
            }
        });
    }

    mostrarMensagemGolo(texto, cor) {
        this.goloMensagem.setText(texto);
        this.goloMensagem.setColor(cor);
        this.goloMensagem.setVisible(true);

        if (this.tempoMensagem) this.time.removeEvent(this.tempoMensagem);

        this.tempoMensagem = this.time.addEvent({
            delay: 2000,
            callback: () => this.goloMensagem.setVisible(false)
        });
    }

    atualizarUI() {
        this.timerText.setText(`Tempo: ${this.timer}s`);
        this.scoreVermelho.setText(`Vermelho: ${this.golos.vermelho}`);
        this.scoreAzul.setText(`Azul: ${this.golos.azul}`);
    }

    iniciarJogo() {
        this.controlosAtivos = false;
        this.bola.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        this.bola.setVelocity(0);
        this.bola.setVisible(true);
        this.bola.body.enable = true;

        this.jogador1.setVelocity(0);
        this.jogador2.setVelocity(0);
        this.jogador1.setPosition(this.posInicialJogador1.x, this.posInicialJogador1.y);
        this.jogador2.setPosition(this.posInicialJogador2.x, this.posInicialJogador2.y);

        if (this.contadorTexto) this.contadorTexto.destroy();

        let tempo = 5;
        this.temporizadorAtivo = false;

        this.contadorTexto = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, tempo, {
            fontSize: '80px', color: '#ffffff', fontFamily: 'Arial'
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
                    this.temporizadorAtivo = true;
                    if (!this.temporizadorIniciado) {
                        this.temporizadorIniciado = true;
                        this.iniciarTemporizador();
                    }
                }
            }
        });
    }

    iniciarTemporizador() {
        this.temporizador = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.timer > 0 && this.temporizadorAtivo) {
                    this.timer--;
                    this.atualizarUI();
                } else if (this.timer <= 0) {
                    this.temporizador.remove();
                    this.controlosAtivos = false;
                    this.jogador1.setVelocity(0);
                    this.jogador2.setVelocity(0);
                    this.bola.setVelocity(0);

                    const centerX = this.cameras.main.centerX;
                    const centerY = this.cameras.main.centerY + 50;

                    const container = this.add.rectangle(centerX, centerY - 100, 420, 200, 0x000000, 0.7)
                        .setStrokeStyle(2, 0xffffff)
                        .setOrigin(0.5)
                        .setDepth(10);

                    this.add.text(centerX, centerY - 140, 'FIM DE JOGO', {
                        fontSize: '28px', fontFamily: 'Arial', color: '#ffffff'
                    }).setOrigin(0.5).setDepth(11);

                    this.add.text(centerX - 80, centerY - 100, `Vermelho: ${this.golos.vermelho}`, {
                        fontSize: '20px', color: '#ff4444'
                    }).setOrigin(0.5).setDepth(11);

                    this.add.text(centerX + 80, centerY - 100, `Azul: ${this.golos.azul}`, {
                        fontSize: '20px', color: '#3399ff'
                    }).setOrigin(0.5).setDepth(11);

                    const vencedor = this.golos.vermelho > this.golos.azul
                        ? 'Vermelho venceu!'
                        : this.golos.azul > this.golos.vermelho
                            ? 'Azul venceu!'
                            : 'Empate!';

                    this.add.text(centerX, centerY - 60, vencedor, {
                        fontSize: '34px', fontFamily: 'Georgia', fontStyle: 'bold', color: '#ffffff'
                    }).setOrigin(0.5).setDepth(11);

                    const btnJogarNovamente = this.add.text(centerX, centerY + 70, '🔁 Jogar Novamente', {
                        fontSize: '26px', backgroundColor: '#28a745', color: '#ffffff', padding: { x: 20, y: 10 }
                    }).setOrigin(0.5).setDepth(11).setInteractive();

                    btnJogarNovamente.on('pointerdown', () => {
                        this.scene.restart({ modo: this.modo, equipa: this.equipa });
                    });

                    const btnVoltarMenu = this.add.text(centerX, centerY + 130, '🏠 Menu Principal', {
                        fontSize: '26px', backgroundColor: '#dc3545', color: '#ffffff', padding: { x: 20, y: 10 }
                    }).setOrigin(0.5).setDepth(11).setInteractive();

                    btnVoltarMenu.on('pointerdown', () => {
                        this.scene.start('MenuScene');
                    });
                }
            }
        });
    }

    update() {
        if (!this.controlosAtivos) return;

        const speed = 200;
        const j1 = this.jogador1;
        const j2 = this.jogador2;

        if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'vermelho')) {
            j1.setVelocity(
                this.keysWASD.left.isDown ? -speed : this.keysWASD.right.isDown ? speed : 0,
                this.keysWASD.up.isDown ? -speed : this.keysWASD.down.isDown ? speed : 0
            );
        }

        if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'azul')) {
            j2.setVelocity(
                this.cursors.left.isDown ? -speed : this.cursors.right.isDown ? speed : 0,
                this.cursors.up.isDown ? -speed : this.cursors.down.isDown ? speed : 0
            );
        }

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

        if (Phaser.Input.Keyboard.JustDown(this.chuteKey2)) this.tentarChutar(j1);
        if ((this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'azul')) && Phaser.Input.Keyboard.JustDown(this.chuteKey)) {
            this.tentarChutar(j2);
        }

        const alturaBalizaTop = 260;
        const alturaBalizaBot = 420;
        const naBalizaY = this.bola.y > alturaBalizaTop && this.bola.y < alturaBalizaBot;

        const golEsquerdo = this.bola.x < 60 && naBalizaY && this.bola.body.velocity.x < 0;
        const golDireito = this.bola.x > this.cameras.main.width - 60 && naBalizaY && this.bola.body.velocity.x > 0;

        if ((golEsquerdo || golDireito) && !this.goloEmAndamento) {
            this.goloEmAndamento = true;
            this.controlosAtivos = false;
            this.temporizadorAtivo = false;

            this.bola.setVisible(false);
            this.bola.body.enable = false;

            if (golEsquerdo) {
                this.golos.azul++;
                this.mostrarMensagemGolo('Azul marcou!', '#1e90ff');
            } else {
                this.golos.vermelho++;
                this.mostrarMensagemGolo('Vermelho marcou!', '#ff0000');
            }

            this.atualizarUI();

            this.time.delayedCall(2000, () => {
                this.iniciarJogo();
                this.goloEmAndamento = false;
            });
        }
    }

    tentarChutar(jogador) {
        const dist = Phaser.Math.Distance.Between(jogador.x, jogador.y, this.bola.x, this.bola.y);
        if (dist < 70) {
            const dx = this.bola.x - jogador.x;
            const dy = this.bola.y - jogador.y;
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) {
                const velocidade = 300;
                this.bola.setVelocity((dx / magnitude) * velocidade, (dy / magnitude) * velocidade);
            }
        }
    }
}
