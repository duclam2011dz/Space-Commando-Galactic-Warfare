export default class Bullet {
    constructor(id, ownerId, x, y, vx, vy) {
        this.id = id;
        this.ownerId = ownerId;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.lifetime = 2000; // ms
    }

    update(delta) {
        this.x += this.vx * (delta / 1000);
        this.y += this.vy * (delta / 1000);
        this.lifetime -= delta;
        return this.lifetime > 0;
    }

    serialize() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            x: this.x,
            y: this.y,
        };
    }
}