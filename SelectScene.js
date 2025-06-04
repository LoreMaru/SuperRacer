import { PG } from './characters.js';

class SelectScene extends Phaser.Scene {
    constructor() {
        super('SelectScene');
    }

    preload(){
        this.load.image('PG1', './assets/BuickerB.png');
        this.load.image('PG2', './assets/SuperB.png');
        this.load.image('PG3', './assets/GalardB.png');
        this.load.image('PG4', './assets/RamB.png');
        this.load.image('sky', './assets/sky.png');
    }

    create(){
        this.selectedCharacter = null;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const positions = [
            { x: centerX - 200, y: centerY - 100 },
            { x: centerX + 200, y: centerY - 100 },
            { x: centerX - 200, y: centerY + 100 },
            { x: centerX + 200, y: centerY + 100 }
          ];;

        PG.forEach((char, index) => {
            const pos = positions[index];
            // Crea descrizione
            const label = this.add.text(
                pos.x - 80,
                pos.y - 50,
                `${char.name}\n${char.potere}:\n${char.descrizione}`,
                { fontSize: '16px', fill: '#ffffff', align: 'left', wordWrap: { width: 140, useAdvancedWrap: true } }
            )
            .setOrigin(0.5);
            // Crea immagine cliccabile
            const img = this.add.image(pos.x, pos.y, char.ID)
            .setInteractive({ useHandCursor: true })

            img.on('pointerdown', () => {
                //Se c'era già un'immagine selezionata, resettiamo il suo stato
                if (this.selectedImage) {
                    this.tweens.killTweensOf(this.selectedImage);        // Ferma il tween precedente
                    this.selectedImage.setScale(1);                      // Riporta alla scala normale
                }
                //Salva la selezione attuale
                this.selectedCharacter = char.ID;
                this.selectedImage = img;            
                //Aggiungi effetto di pulsazione alla scala
                this.tweens.add({
                targets: img,
                scale: { from: 1, to: 1.1 },
                duration: 300,
                yoyo: true,
                repeat: -1
                });
            });
              
        });
        // Tasto start
        const startButton = this.add.rectangle(400, 500, 160, 50, 0x3333ff)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff);

        const startText = this.add.text(400, 500, 'START', {
        fontSize: '24px', fill: '#ffffff'
        }).setOrigin(0.5);

        // Avvia la scena successiva solo se un personaggio è stato selezionato
        startButton.on('pointerdown', () => {
            if (this.selectedCharacter) {
                this.scene.start('GameScene', { selected: this.selectedCharacter });
                //console.log(this.selectedCharacter)
            } else {
                this.add.text(400, 560, 'Seleziona un personaggio!', {
                fontSize: '16px', fill: '#ff4444'
                }).setOrigin(0.5);
            }
    });                  
    }

    update(){

    }
}    


export { SelectScene };