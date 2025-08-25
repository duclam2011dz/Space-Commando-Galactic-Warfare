export default class Player {
    constructor(id, x, y, color) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotation = 0;
    }

    update(data) {
        this.x = data.x;
        this.y = data.y;
        this.rotation = data.rotation;
    }

    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            color: this.color,
        };
    }
}