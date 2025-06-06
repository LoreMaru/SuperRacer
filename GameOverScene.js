class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        
        this.timeResult = data;
        console.log(JSON.stringify(this.timeResult))
      }

    preload(){
        this.load.image('sky', './assets/sky.png');
    }

    create(){
        this.add.image(400, 300, 'sky').setDepth(10);

        this.timerText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `${this.timeResult.timeResult}`, {
            fontFamily: 'Arial',
            fontSize: '25px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(11).setOrigin(0.5, 0.5);
    }

    upload(){
    }

}

export { GameOverScene };