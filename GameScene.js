import { createAnimations } from './animations.js';
import { addTrackPiece, powerBarActivation, fasterByTime, spawnRandomEnemyCar, spawnThingsOverTime } from './utility.js';
import { PG } from './characters.js';

var car
var enemy
var cursors

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  } 

  init(dataFromSelection) {
    //Questo viene chiamato prima di preload()
    //Serve per portare i dati della selezione dalla scena precedente
    this.selectedID = dataFromSelection.selected;
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
    //this.load.spritesheet('bolla_papale', './assets/effects/10_weaponhit_spritesheet.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet(this.character.keyAnimazione, this.character.animazione, { frameWidth: 100, frameHeight: 100 });

    //scelta del nemico
    this.load.image('PG1', './assets/BuickerB.png');
    this.load.image('PG2', './assets/SuperB.png');
    this.load.image('PG3', './assets/GalardB.png');
    this.load.image('PG4', './assets/RamB.png');
    this.load.spritesheet(PG[0].keyAnimazione, PG[0].animazione, { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet(PG[1].keyAnimazione, PG[1].animazione, { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet(PG[2].keyAnimazione, PG[2].animazione, { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet(PG[3].keyAnimazione, PG[3].animazione, { frameWidth: 100, frameHeight: 100 });
    console.log('Animazioni disponibili:', this.anims.anims.entries);
  }
  
  create() {
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
    //per incremento della velocità al passare del tempo
    this.lastHalfMinute = -1;

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
    this.scrollSpeed = 6;
    // Accumulatore per sapere quando aggiungere un nuovo pezzo
    this.distanceSinceLastPiece = 0;    
    // Posizionamento dei primi 3 pezzi (tutti rettilinei), partendo da y = 0 verso l'alto
    for (let i = 0; i < 3; i++) {
      addTrackPiece(this, 'straight', i * -this.pieceHeight);
    }
    
    //player
    this.car = this.physics.add.image(300, 500, 'car');
    this.car.setCollideWorldBounds(true);
    this.car.setOrigin(0.5);
    this.car.setDepth(1);

    //**animazione potere
    this.powerAnimation = this.add.sprite(this.car.x, this.car.y, this.character.keyAnimazione)
    .setOrigin(0.5)
    .setVisible(false)
    .setScale(1.5)
    //.play(this.character.keyAnimazione);
    
    //**gestione dell'apparizione dei nemici e degli oggetti
    this.enemies = this.physics.add.group();
    this.enemySpawnDelay = 10000; // in millisecondi (10 secondi)
    this.minimumSpawnDelay = 2000; // non andare sotto i 2 secondi
    spawnThingsOverTime(this, this.selectedID, this.car, this.enemySpawnDelay, this.minimumSpawnDelay); // avvia il ciclo

  
    //**inizializzazione comandi
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }
  
  update(time, delta) {
    const carSpeed = 3;

    this.powerAnimation.x = this.car.x;
    this.powerAnimation.y = this.car.y;

    //**gestione comandi
    if (this.cursors.left.isDown) {
      this.car.x -= carSpeed;
    } else if (this.cursors.right.isDown) {
      this.car.x += carSpeed;
    }
    if (this.cursors.up.isDown) {
      this.car.y -= 0.5;

      //this.lifeBar.height > 0 ? this.lifeBar.height -= 0.5 : this.lifeBar.height
    }
    if (this.cursors.down.isDown) {
      this.car.y += 0.5;
    }//tasto X per usare il power
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
      powerBarActivation(this, this.powerAnimation, this.character.keyAnimazione);   
    }//FINE gestione comandi, deve andare tutto dopo questo quando possibile
    
    ////parte dell'aggiustamento per stabilizazione fps
    const dt = delta / 1000;                // delta in secondi
    const scrollMultiplier = dt * 60;       // normalizzazione a 60 fps

    //**Gestione Timer
    if (this.lifeBar && this.lifeBar.height > 0) {
      const elapsed = this.time.now - this.startTime; // tempo totale in ms
      const totalSeconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const secondsFormatted = seconds.toString().padStart(2, '0');
      const milliseconds = Math.floor(elapsed % 1000);
      // probabilmente andrà messo qui per la schermata di game over
      // if (this.lifeBar && this.lifeBar.height > 0) {
      this.timerText.setText(`Tempo: ${minutes}:${secondsFormatted}:${milliseconds}`);

      if (totalSeconds % 15 === 0 && this.lastHalfMinute !== totalSeconds) {
        //incrementa la velocità di 2 ogni minuto
        this.lastHalfMinute = totalSeconds;
        fasterByTime(this);
        console.log('velocità',this.scrollSpeed)
      }
    }else {
      this.timer.remove();
      //let timeResult = `Tempo: ${minutes}:${secondsFormatted}:${milliseconds}`
      //this.scene.start('GameOverScene', { timeResult });
    }

    //**gestione update percorso
    // Imposta velocità visiva dello sfondo: rallenta se l’auto è fuori carreggiata
    let visualScrollSpeed = this.scrollSpeed;
    if (this.car.x < 100 || this.car.x > 600) {
      visualScrollSpeed = 4.9;
    }
    if (this.slowDownActive) {
      visualScrollSpeed = 2.5;
    }
    
    const adjustedSpeed = visualScrollSpeed * scrollMultiplier;//parte dell'aggiustamento per stabilizazione fps
    
    // Sposta ogni pezzo pista verso il basso (effetto movimento)
    this.trackPieces.getChildren().forEach(piece => {
      piece.y += adjustedSpeed;
      // Se il pezzo è completamente uscito dallo schermo, lo distruggiamo per liberare memoria
      if (piece.y > 1000) {
        piece.destroy();
      }
    });    
    // Aggiungiamo un nuovo pezzo quando si è raggiunta la distanza verticale necessaria
    this.distanceSinceLastPiece += this.scrollSpeed * scrollMultiplier;//parte dell'aggiustamento per stabilizazione fps
    if (this.distanceSinceLastPiece >= this.pieceHeight) {
      const types = ['straight', 'curve_left', 'curve_right'];          // tipi di pezzi disponibili
      const randomType = Phaser.Utils.Array.GetRandom(types);           // scegli uno casuale
      addTrackPiece(this, randomType, -this.pieceHeight);                // aggiungi in alto
      this.distanceSinceLastPiece = 0;                                  // resetta il contatore
    }


    this.enemies.getChildren().forEach(enemy => {
  if (!enemy.active) return;

  const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.car.x, this.car.y);
  const playerPowered = this.powerBar.height > 0;

  switch (enemy.state) {
    case 'IDLE':
      if (!playerPowered) {
        enemy.state = 'CHASING';
      }
      break;

    case 'CHASING':
      if (playerPowered) {
        enemy.state = 'AVOIDING';
      } else if (dist < 30) {
        enemy.state = 'ATTACKING';
        enemy.body.setVelocity(0);
        scene.time.delayedCall(500, () => {
          enemy.attackReady = true;
        });
      } else {
        this.physics.moveToObject(enemy, this.car, 100);
      }
      break;

    case 'AVOIDING':
      if (!playerPowered) {
        enemy.state = 'CHASING';
      } else {
        enemy.body.setVelocityX(enemy.x < this.car.x ? -100 : 100);
        enemy.body.setVelocityY(20);
      }
      break;

    case 'ATTACKING':
      // Ferma nemico e attesa, il collider lo sposterà su DONE
      enemy.body.setVelocity(0);
      break;

    case 'DONE':
      enemy.body.setVelocity(0, 100);
      // Rimuovi se esce dallo schermo
      if (enemy.y > 700) enemy.destroy();
      break;
  }
});
    


  }


}

//se abbiamo diviso le scene in più file serve l'export
export { GameScene };
