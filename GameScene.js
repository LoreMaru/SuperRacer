import { createAnimations } from './animations.js';
import { addTrackPiece } from './utility.js';
import { PG } from './characters.js';

var car
var enemy
var cursors

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  } 

  init(data) {
    //Questo viene chiamato prima di preload()
    //Serve per portare i dati della selezione dalla scena precedente
    this.selectedID = data.selected;
    //console.log('Init:', this.selectedID);
  }

  preload() {
    this.load.image('life', './assets/love-always-wins.png');
    this.load.image('power', './assets/a1.png');
    this.load.image('ground', './assets/1.png');
    //this.load.image('car', './assets/GalardB.png');
    this.character = PG.find(c => c.ID === this.selectedID);
    this.load.image('car', this.character.immagine);
    //console.log('Hai scelto pre:', character);
    this.load.image('straight', './assets/1.png');     // pezzo rettilineo
    this.load.image('curve_left', './assets/2.png'); // curva a sinistra
    this.load.image('curve_right', './assets/3.png'); // curva a destra
    //this.load.image('enemy', './assets/SuperB.png');
    //this.load.spritesheet('bolla_papale', './assets/effects/10_weaponhit_spritesheet.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet(this.character.keyAnimazione, this.character.animazione, { frameWidth: 100, frameHeight: 100 });
    //console.log('preload ',this.character.keyAnimazione, this.character.animazione)

  }
  
  create(data) {
    //console.log('Hai scelto cre:', data.selected);
    //import file animazioni
    createAnimations(this);

    //**gestione del timer**
    this.startTime = this.time.now; // tempo iniziale in millisecondi
    //formattazione testo timer
    this.timerText = this.add.text(550, 10, `Tempo: 0:000`, {
      fontFamily: 'Arial',
      fontSize: '25px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(1);

  //**gestione delle barre**
    this.life = this.add.image(40, 10, 'life').setOrigin(0, 0);
    this.life.setDepth(1).setScale(0.07);
    this.emptyLifeBar = this.add.rectangle(20, 10, 20, 200, 0x3E2020).setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
    this.emptyLifeBar.setDepth(0)
    this.lifeBar = this.add.rectangle(20, 10, 20, 200, 0xff0000).setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
    this.lifeBar.setDepth(1)

    this.power = this.add.image(755, 590, 'power').setOrigin(1, 1);
    this.power.setDepth(1).setScale(0.10);    
    this.emptyPowerBar = this.add.rectangle(780, 590, 20, 200, 0x196158).setOrigin(1, 1).setStrokeStyle(2, 0xffffff);
    this.emptyPowerBar.setDepth(0)
    this.powerBar = this.add.rectangle(780, 590, 20, 200, 0x80BA27).setOrigin(1, 1).setStrokeStyle(2, 0xffffff);
    this.powerBar.setDepth(1)    

    //**gestione del percorso
    //sfondo statico, da sistemare come linea di partenza
    this.add.image(400, 300, 'ground').setDepth(-1);
    // Gruppo che conterrà dinamicamente i pezzi della pista
    this.trackPieces = this.add.group();
    // Altezza in pixel di ogni segmento della pista
    this.pieceHeight = 600;
    // Velocità base di scorrimento della pista (in pixel per frame)
    this.scrollSpeed = 2;
    // Accumulatore per sapere quando aggiungere un nuovo pezzo
    this.distanceSinceLastPiece = 0;    
    // Posizionamento dei primi 3 pezzi (tutti rettilinei), partendo da y = 0 verso l'alto
    for (let i = 0; i < 3; i++) {
      addTrackPiece(this, 'straight', i * -this.pieceHeight);
    }
    
    //player
    this.car = this.physics.add.image(300, 500, 'car');
    this.car.setCollideWorldBounds(true);
    this.car.setOrigin(-1);
    this.car.setDepth(1);

    //animazione di test
    //this.bolla_papale = this.add.sprite(300, 400, 'bolla_papale').setOrigin(0.5).setDepth(0);
    //this.bolla_papale.play('bolla_papale');
    this.character.keyAnimazione = this.add.sprite(this.car.x, this.car.x, this.character.keyAnimazione)
    .setOrigin(0)
    .setDepth(2)
    .play(this.character.keyAnimazione); 
    //console.log('create ',this.character.keyAnimazione)   
  
    //**inizializzazione comandi
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }
  
  update() {
    const carSpeed = 3;

    this.character.keyAnimazione.x = this.car.x;
    this.character.keyAnimazione.y = this.car.y;

    //**update timer
/*    BLOCCO TIMER CON CONTEGGIO SECONDI:MILLISECONDI
    if (this.lifeBar && this.lifeBar.height > 0) {
      const elapsed = this.time.now - this.startTime;
      const seconds = Math.floor(elapsed / 1000);
      const milliseconds = Math.floor(elapsed % 1000);
  
      this.timerText.setText(`Tempo: ${seconds}:${milliseconds.toString().padStart(3, '0')}`);
    } else {
      // opzionale: blocca aggiornamento
      this.timer.remove();
    }
*/
    if (this.lifeBar && this.lifeBar.height > 0) {
      const elapsed = this.time.now - this.startTime; // tempo totale in ms
      const totalSeconds = Math.floor(elapsed / 1000);

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const secondsFormatted = seconds.toString().padStart(2, '0');
      const milliseconds = Math.floor(elapsed % 1000);

      this.timerText.setText(`Tempo: ${minutes}:${secondsFormatted}:${milliseconds}`);
    } else {
      this.timer.remove();
    }

    //**gestione update percorso
    // Imposta velocità visiva dello sfondo: rallenta se l’auto è fuori carreggiata
    let visualScrollSpeed = this.scrollSpeed;
    if (this.car.x < 100 || this.car.x > 600) {
      visualScrollSpeed = 0.5; // rallenta lo scorrimento
    }
    if (this.slowDownActive) {
      visualScrollSpeed = 0.3; // rallenta all'impatto
    }
    // Sposta ogni pezzo pista verso il basso (effetto movimento)
    this.trackPieces.getChildren().forEach(piece => {
      piece.y += visualScrollSpeed;
      // Se il pezzo è completamente uscito dallo schermo, lo distruggiamo per liberare memoria
      if (piece.y > 1000) {
        piece.destroy();
      }
    });    
    // Aggiungiamo un nuovo pezzo quando si è raggiunta la distanza verticale necessaria
    this.distanceSinceLastPiece += this.scrollSpeed;
    if (this.distanceSinceLastPiece >= this.pieceHeight) {
      const types = ['straight', 'curve_left', 'curve_right'];          // tipi di pezzi disponibili
      const randomType = Phaser.Utils.Array.GetRandom(types);           // scegli uno casuale
      addTrackPiece(this, randomType, -this.pieceHeight);                // aggiungi in alto
      this.distanceSinceLastPiece = 0;                                  // resetta il contatore
    }
  
    //**gestione comandi
    if (this.cursors.left.isDown) {
      this.car.x -= carSpeed;
    } else if (this.cursors.right.isDown) {
      this.car.x += carSpeed;
    }
    if (this.cursors.up.isDown) {
      this.car.y -= 0.5;

      this.lifeBar.height > 0 ? this.lifeBar.height -= 0.5 : this.lifeBar.height
      this.powerBar.height > 0 ? this.powerBar.height -= 0.5 : this.powerBar.height
    }
    if (this.cursors.down.isDown) {
      this.car.y += 0.5;
    }//tasto X per usare il power
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.lifeBar.height > 0 ? this.lifeBar.height -= 0.5 : this.lifeBar.height
      this.powerBar.height > 0 ? this.powerBar.height -= 0.5 : this.powerBar.height
    }    
  }
  
  

}

//se abbiamo diviso le scene in più file serve l'export
export { GameScene };