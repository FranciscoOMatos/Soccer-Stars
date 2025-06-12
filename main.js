const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#006400',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let bola;
let jogador1;
let jogador2;
let cursors;
let chuteKey;
let keysWASD;
let chuteKey2;


const game = new Phaser.Game(config);

function preload() {
    this.load.image('campo', 'assets/campo.png'); // novo fundo
    this.load.image('bola', 'assets/bola.png');
    this.load.image('jogador1', 'assets/jogador1.png');
    this.load.image('jogador2', 'assets/jogador2.png');
}

let selectedPlayer = null;
let dragStart = null;

function create() {

cursors = this.input.keyboard.createCursorKeys();
chuteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

// Jogador 2 - teclas WASD
keysWASD = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D
});
chuteKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);


    this.add.image(400, 300, 'campo');

// Jogador 1
jogador1 = this.physics.add.image(200, 300, 'jogador1')
    .setScale(0.2)
    .setCollideWorldBounds(true)
    .setBounce(0.9);
jogador1.body.setCircle(25);  // círculo de colisão de raio 25 (ajustável)
jogador1.body.offset.set(5, 5); // ajusta centro manualmente se necessário

// Jogador 2
jogador2 = this.physics.add.image(600, 300, 'jogador2')
    .setScale(0.2)
    .setCollideWorldBounds(true)
    .setBounce(0.9);
jogador2.body.setCircle(25);
jogador2.body.offset.set(5, 5);

// Bola
bola = this.physics.add.image(400, 300, 'bola')
    .setScale(0.1)
    .setCollideWorldBounds(true)
    .setBounce(0.9);
bola.body.setCircle(10);
bola.body.offset.set(3, 3);

    // Colisões
    this.physics.add.collider(jogador1, bola);
    this.physics.add.collider(jogador2, bola);
    this.physics.add.collider(jogador1, jogador2);

    // Input
    this.input.on('pointerdown', (pointer) => {
        const { x, y } = pointer;
        if (Phaser.Math.Distance.Between(x, y, jogador1.x, jogador1.y) < 32) {
            selectedPlayer = jogador1;
            dragStart = { x, y };
        } else if (Phaser.Math.Distance.Between(x, y, jogador2.x, jogador2.y) < 32) {
            selectedPlayer = jogador2;
            dragStart = { x, y };
        }
    });

    this.input.on('pointerup', (pointer) => {
        if (selectedPlayer && dragStart) {
            const forceX = dragStart.x - pointer.x;
            const forceY = dragStart.y - pointer.y;
            selectedPlayer.setVelocity(forceX * 0.2, forceY * 0.2);
        }
        selectedPlayer = null;
        dragStart = null;
    });
}

function update() {
    const speed = 200;
    const chuteForca = 300;

    // Jogador 1 (WASD)
    if (keysWASD.left.isDown) {
        jogador1.setVelocityX(-speed);
    } else if (keysWASD.right.isDown) {
        jogador1.setVelocityX(speed);
    } else {
        jogador1.setVelocityX(0);
    }

    if (keysWASD.up.isDown) {
        jogador1.setVelocityY(-speed);
    } else if (keysWASD.down.isDown) {
        jogador1.setVelocityY(speed);
    } else {
        jogador1.setVelocityY(0);
    }

    // Jogador 2 (setas)
    if (cursors.left.isDown) {
        jogador2.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        jogador2.setVelocityX(speed);
    } else {
        jogador2.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        jogador2.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
        jogador2.setVelocityY(speed);
    } else {
        jogador2.setVelocityY(0);
    }

    // Jogador 1 chuta com SHIFT
    if (Phaser.Input.Keyboard.JustDown(chuteKey2)) {
        const dist = Phaser.Math.Distance.Between(jogador1.x, jogador1.y, bola.x, bola.y);
        if (dist < 50) {
            const dirX = bola.x - jogador1.x;
            const dirY = bola.y - jogador1.y;
            const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
            bola.setVelocity((dirX / magnitude) * chuteForca, (dirY / magnitude) * chuteForca);
        }
    }

    // Jogador 2 chuta com SPACE
    if (Phaser.Input.Keyboard.JustDown(chuteKey)) {
        const dist = Phaser.Math.Distance.Between(jogador2.x, jogador2.y, bola.x, bola.y);
        if (dist < 50) {
            const dirX = bola.x - jogador2.x;
            const dirY = bola.y - jogador2.y;
            const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
            bola.setVelocity((dirX / magnitude) * chuteForca, (dirY / magnitude) * chuteForca);
        }
    }
}
