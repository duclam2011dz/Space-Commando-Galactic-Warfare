export default class MainScene extends Phaser.Scene {
    // ===== Static options (đọc/ghi từ UI) =====
    static playerColor = 0x3b82f6; // default
    static showGrid = true;

    constructor() {
        super({ key: "MainScene" });
        this.otherPlayers = new Map(); // lưu các player khác
        this.bullets = new Map();
        this.gridGraphics = null;
    }

    preload() { }

    create() {
        // Socket.io
        this.socket = io();

        // local player color
        this.playerColor = MainScene.playerColor;

        // tạo player local (tạm thôi, server sẽ sync)
        this.player = this.add.graphics();
        this.drawPlayer(this.player, this.playerColor);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(30, 30);
        this.player.setPosition(400, 300);

        // Draw grid
        this.applyGridToggle(MainScene.showGrid);

        // gửi sự kiện new player
        this.socket.emit("newPlayer", {
            x: this.player.x,
            y: this.player.y,
            color: this.playerColor,
        });

        // listen state update từ server
        this.socket.on("stateUpdate", (state) => {
            this.handleServerState(state);
        });

        // controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on("pointerdown", () => {
            this.shoot();
        });

        // set camera
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.cameras.main.startFollow(this.player);

        // Ping check
        this.setupPing();
    }

    update() {
        this.handleInput();
    }

    setupPing() {
        this.socket.on("pongCheck", (serverTime) => {
            const latency = Date.now() - serverTime;
            console.log(`Ping: ${latency} ms`);
        });

        this.pingInterval = setInterval(() => {
            this.socket.emit("pingCheck", Date.now());
        }, 2000);
    }

    shutdown() {
        clearInterval(this.pingInterval);
    }

    // ===== API cho UI gọi khi đổi skin/grid lúc đang chơi =====
    updateLocalSkin(newColor) {
        this.playerColor = newColor;
        this.drawPlayer(this.player, this.playerColor); // vẽ lại local
        // báo server để broadcast cho mọi người
        if (this.socket) {
            this.socket.emit("updateSkin", { color: this.playerColor });
        }
    }

    applyGridToggle(show) {
        MainScene.showGrid = !!show; // lưu lại static

        // clear grid cũ
        if (this.gridGraphics) {
            this.gridGraphics.clear();
            this.gridGraphics.destroy();
            this.gridGraphics = null;
        }

        // nếu bật → vẽ mới
        if (MainScene.showGrid) {
            this.gridGraphics = this.add.graphics();
            this.drawGrid(this.gridGraphics, 1600, 1200, 50);
        }
    }

    // ---- INPUT ----
    handleInput() {
        let vx = 0,
            vy = 0;
        if (this.cursors.left.isDown) vx = -200;
        else if (this.cursors.right.isDown) vx = 200;
        if (this.cursors.up.isDown) vy = -200;
        else if (this.cursors.down.isDown) vy = 200;

        this.player.body.setVelocity(vx, vy);

        const pointer = this.input.activePointer;
        this.player.rotation =
            Phaser.Math.Angle.Between(
                this.player.x,
                this.player.y,
                pointer.worldX,
                pointer.worldY
            ) +
            Math.PI / 2;

        // gửi state cho server
        this.socket.emit("playerMove", {
            x: this.player.x,
            y: this.player.y,
            rotation: this.player.rotation,
        });
    }

    shoot() {
        const angle = this.player.rotation - Math.PI / 2;
        const vx = Math.cos(angle) * 400;
        const vy = Math.sin(angle) * 400;

        this.socket.emit("shoot", {
            x: this.player.x,
            y: this.player.y,
            vx,
            vy,
        });
    }

    // ---- SYNC STATE ----
    handleServerState(state) {
        // sync players
        const seen = new Set();
        state.players.forEach((p) => {
            if (p.id === this.socket.id) {
                // chính mình → server gửi để confirm (anti cheat)
                this.player.setPosition(p.x, p.y);
                this.player.rotation = p.rotation;

                // nếu server có màu khác (ví dụ mình đổi skin từ nơi khác)
                if (p.color !== this.playerColor) {
                    this.playerColor = p.color;
                    this.drawPlayer(this.player, this.playerColor);
                }
            } else {
                // các player khác
                if (!this.otherPlayers.has(p.id)) {
                    const g = this.add.graphics();
                    g._color = p.color;
                    this.drawPlayer(g, p.color);
                    this.otherPlayers.set(p.id, g);
                }
                const g = this.otherPlayers.get(p.id);
                if (g._color !== p.color) {
                    g._color = p.color; // redraw khi đổi skin
                    this.drawPlayer(g, p.color);
                }
                g.setPosition(p.x, p.y);
                g.rotation = p.rotation;
            }
            seen.add(p.id);
        });

        // xóa player nào biến mất
        for (let id of this.otherPlayers.keys()) {
            if (!seen.has(id)) {
                this.otherPlayers.get(id).destroy();
                this.otherPlayers.delete(id);
            }
        }

        // sync bullets
        const bulletSeen = new Set();
        state.bullets.forEach((b) => {
            if (!this.bullets.has(b.id)) {
                const g = this.add.graphics();
                g.fillStyle(0xffffff, 1);
                g.fillCircle(0, 0, 5);
                this.physics.add.existing(g);
                this.bullets.set(b.id, g);
            }
            const g = this.bullets.get(b.id);
            g.setPosition(b.x, b.y);
            bulletSeen.add(b.id);
        });

        // xóa bullet nào biến mất
        for (let id of this.bullets.keys()) {
            if (!bulletSeen.has(id)) {
                this.bullets.get(id).destroy();
                this.bullets.delete(id);
            }
        }
    }

    // ---- DRAW ----
    drawPlayer(graphics, color) {
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.beginPath();
        graphics.moveTo(0, -15);
        graphics.lineTo(-10, 15);
        graphics.lineTo(10, 15);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(0xffffff, 1);
        graphics.beginPath();
        graphics.arc(0, 0, 5, 0, Math.PI * 2);
        graphics.fillPath();
    }

    drawGrid(graphics, width, height, gridSize) {
        graphics.clear();
        graphics.lineStyle(1, 0x333333, 0.5);

        for (let x = 0; x <= width; x += gridSize) {
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
            graphics.strokePath();
        }
        for (let y = 0; y <= height; y += gridSize) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
            graphics.strokePath();
        }
    }
}