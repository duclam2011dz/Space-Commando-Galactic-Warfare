import MainScene from "./MainScene.js";

export default class SpaceCommandoGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: "gameContainer",
            scene: [MainScene],
            physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
            scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
        };

        this.game = null;
        this.initUI();
    }

    initUI() {
        this.playBtn = document.getElementById("playBtn");
        this.settingsBtn = document.getElementById("settingsBtn");
        this.quitBtn = document.getElementById("quitBtn");
        this.saveSettingsBtn = document.getElementById("saveSettingsBtn");
        this.menuScreen = document.querySelector(".menu-screen");
        this.settingsScreen = document.querySelector(".settings-screen");
        this.skinOptions = document.querySelectorAll(".skin-option");
        this.gridToggle = document.getElementById("gridToggle");

        this.playBtn.addEventListener("click", () => this.startGame());
        this.settingsBtn.addEventListener("click", () => this.showSettings());
        this.quitBtn.addEventListener("click", () => this.quitGame());
        this.saveSettingsBtn.addEventListener("click", () => this.saveSettings());

        this.skinOptions.forEach(opt =>
            opt.addEventListener("click", () => this.selectSkin(opt))
        );
    }

    startGame() {
        this.menuScreen.style.display = "none";
        if (this.game) this.game.destroy(true);
        this.game = new Phaser.Game(this.config);
    }

    showSettings() {
        this.menuScreen.style.display = "none";
        this.settingsScreen.style.display = "flex";
    }

    quitGame() {
        if (confirm("Are you sure you want to quit?")) window.close();
    }

    saveSettings() {
        // 1) Skin
        const selectedSkin = document.querySelector(".skin-option.selected");
        if (selectedSkin) {
            const newColor = this.getColorFromSkin(selectedSkin.dataset.skin);
            // ghi vào static để lần startGame sau vẫn dùng
            MainScene.playerColor = newColor;

            // nếu game đang chạy → update ngay
            if (this.game) {
                const scene = this.game.scene.getScene("MainScene");
                if (scene && scene.updateLocalSkin) {
                    scene.updateLocalSkin(newColor);
                }
            }
        }

        // 2) Grid (client only)
        const wantGrid = this.gridToggle.checked;
        MainScene.showGrid = wantGrid;
        if (this.game) {
            const scene = this.game.scene.getScene("MainScene");
            if (scene && scene.applyGridToggle) {
                scene.applyGridToggle(wantGrid);
            }
        }

        // back to menu
        this.settingsScreen.style.display = "none";
        this.menuScreen.style.display = "flex";
    }

    selectSkin(option) {
        this.skinOptions.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
    }

    getColorFromSkin(skin) {
        const colors = {
            blue: 0x3b82f6,
            red: 0xef4444,
            green: 0x10b981,
            purple: 0x8b5cf6
        };
        return colors[skin] || 0x3b82f6;
    }
}