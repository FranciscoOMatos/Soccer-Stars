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

        const esquerda = width * 0.2;
        const direita = width * 0.8;

        this.jogador1 = this.physics.add.image(esquerda, centerY, 'jogador1').setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);
        this.jogador2 = this.physics.add.image(direita, centerY, 'jogador2').setScale(0.2).setCollideWorldBounds(true).setBounce(0.9);

        this.posInicialJogador1 = { x: this.jogador1.x, y: this.jogador1.y };
        this.posInicialJogador2 = { x: this.jogador2.x, y: this.jogador2.y };

        this.jogador1.body.setCircle(this.jogador1.displayWidth / 2 * 1.1);
        this.jogador1.body.setOffset(this.jogador1.displayWidth / 2 - this.jogador1.body.halfWidth, this.jogador1.displayHeight / 2 - this.jogador1.body.halfHeight);
        this.jogador2.body.setCircle(this.jogador2.displayWidth / 2 * 1.1);
        this.jogador2.body.setOffset(this.jogador2.displayWidth / 2 - this.jogador2.body.halfWidth, this.jogador2.displayHeight / 2 - this.jogador2.body.halfHeight);

        this.bola = this.physics.add.image(centerX, centerY, 'bola').setScale(0.1).setCollideWorldBounds(true).setBounce(0.9);
        this.bola.body.setCircle(this.bola.displayWidth / 2 * 1.05);
        this.bola.body.setOffset(this.bola.displayWidth / 2 - this.bola.body.halfWidth, this.bola.displayHeight / 2 - this.bola.body.halfHeight);

        this.physics.add.collider(this.jogador1, this.bola);
        this.physics.add.collider(this.jogador2, this.bola);
        this.physics.add.collider(this.jogador1, this.jogador2);

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
        this.bola.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        this.bola.setVelocity(0);
        this.jogador1.setVelocity(0);
        this.jogador2.setVelocity(0);
        this.jogador1.setPosition(this.posInicialJogador1.x, this.posInicialJogador1.y);
        this.jogador2.setPosition(this.posInicialJogador2.x, this.posInicialJogador2.y);

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
                    this.jogador1.setVelocity(0);
                    this.jogador2.setVelocity(0);
                    this.bola.setVelocity(0);

                    const vencedor = this.golos.vermelho > this.golos.azul
                        ? 'Vermelho venceu!'
                        : this.golos.azul > this.golos.vermelho
                            ? 'Azul venceu!'
                            : 'Empate!';

                    this.add.text(this.cameras.main.centerX, 100, vencedor, {
                        fontSize: '40px', color: '#fff'
                    }).setOrigin(0.5);

                    const btnJogarNovamente = this.add.text(this.cameras.main.centerX, 200, '🔁 Jogar Novamente', {
                        fontSize: '30px', backgroundColor: '#28a745', color: '#fff', padding: { x: 15, y: 10 }
                    }).setOrigin(0.5).setInteractive();

                    btnJogarNovamente.on('pointerdown', () => {
                        this.scene.restart({ modo: this.modo, equipa: this.equipa });
                    });

                    const btnVoltarMenu = this.add.text(this.cameras.main.centerX, 280, '🏠 Menu Principal', {
                        fontSize: '30px', backgroundColor: '#dc3545', color: '#fff', padding: { x: 15, y: 10 }
                    }).setOrigin(0.5).setInteractive();

                    btnVoltarMenu.on('pointerdown', () => {
                        this.scene.start('MenuScene');
                    });

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

        if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'vermelho')) {
            if (this.keysWASD.left.isDown) j1.setVelocityX(-speed);
            else if (this.keysWASD.right.isDown) j1.setVelocityX(speed);
            else j1.setVelocityX(0);

            if (this.keysWASD.up.isDown) j1.setVelocityY(-speed);
            else if (this.keysWASD.down.isDown) j1.setVelocityY(speed);
            else j1.setVelocityY(0);
        }

        if (this.modo === 'amigo' || (this.modo === 'cpu' && this.equipa === 'azul')) {
            if (this.cursors.left.isDown) j2.setVelocityX(-speed);
            else if (this.cursors.right.isDown) j2.setVelocityX(speed);
            else j2.setVelocityX(0);

            if (this.cursors.up.isDown) j2.setVelocityY(-speed);
            else if (this.cursors.down.isDown) j2.setVelocityY(speed);
            else j2.setVelocityY(0);
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
        if (this.modo === 'amigo' && Phaser.Input.Keyboard.JustDown(this.chuteKey)) this.tentarChutar(j2);

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
