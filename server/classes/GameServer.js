import { Server } from "socket.io";
import Player from "./Player.js";
import Bullet from "./Bullet.js";
import logger from "../utils/logging.js";

export default class GameServer {
    constructor(httpServer) {
        this.io = new Server(httpServer);
        this.players = new Map();
        this.bullets = new Map();
        this.lastBulletId = 0;

        this.setupSocketEvents();

        // game loop tick (60 FPS)
        this.lastUpdate = Date.now();
        setInterval(() => this.gameLoop(), 1000 / 60);
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            logger.success(`Client connected: ${socket.id}`);

            // init default skin
            this.players[socket.id] = { x: 0, y: 0, rotation: 0, skin: 0x3b82f6 };

            socket.on("updateSkin", (data) => {
                if (this.players[socket.id]) {
                    this.players[socket.id].skin = data.color;
                }
            });

            socket.on("pingCheck", (clientTime) => {
                const latency = Date.now() - clientTime;
                logger.ping(`Client ${socket.id}: ${latency} ms`);
                socket.emit("pongCheck", clientTime);
            });

            // new player join
            socket.on("newPlayer", (data) => {
                const player = new Player(
                    socket.id,
                    data.x,
                    data.y,
                    data.color || 0x3b82f6
                );
                this.players.set(socket.id, player);

                // thông báo cho tất cả client
                this.io.emit("playersUpdate", this.getAllPlayers());
            });

            // player movement update
            socket.on("playerMove", (data) => {
                const player = this.players.get(socket.id);
                if (player) {
                    player.update(data);
                }
            });

            // player shoot
            socket.on("shoot", (data) => {
                const bulletId = ++this.lastBulletId;
                const bullet = new Bullet(
                    bulletId,
                    socket.id,
                    data.x,
                    data.y,
                    data.vx,
                    data.vy
                );
                this.bullets.set(bulletId, bullet);
            });

            // disconnect
            socket.on("disconnect", () => {
                this.players.delete(socket.id);
                this.io.emit("playersUpdate", this.getAllPlayers());
                logger.warn(`Client disconnected: ${socket.id}`);
            });
        });
    }

    gameLoop() {
        const now = Date.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;

        // update bullets
        for (const [id, bullet] of this.bullets) {
            const alive = bullet.update(delta);
            if (!alive) { this.bullets.delete(id); }
        }

        // broadcast game state
        this.io.emit("stateUpdate", {
            players: this.getAllPlayers(),
            bullets: this.getAllBullets(),
        });
    }

    getAllPlayers() {
        return Array.from(this.players.values()).map((p) => p.serialize());
    }

    getAllBullets() {
        return Array.from(this.bullets.values()).map((b) => b.serialize());
    }
}