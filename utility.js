import { PG } from './characters.js';

export function saluta(nome) {
    console.log(`Ciao, ${nome}!`);
  }

export function addTrackPiece(scene, type, y) {
  const piece = scene.add.image(400, y, type); // usa scene invece di this
  piece.setDepth(0);
  scene.trackPieces.add(piece);
}

export function powerBarActivation(scene, powerAnimation, keyAnimazione) {
  if (scene.powerBar.height === 200) {
    //avvia animazione
    powerAnimation.setVisible(true).setDepth(2);
    //evita di riavviare l'animazione se è già in corso permettendo il loop
    if (!powerAnimation.anims.isPlaying) {
      powerAnimation.play(keyAnimazione);
    }
    //timer per il consumo della barra
    const dischargeTimer = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        scene.powerBar.height -= 10;
        if (scene.powerBar.height <= 0) {
          dischargeTimer.remove();
          powerAnimation.setVisible(false).stop();
          //timer per il recupero della barra
          const rechargeTimer = scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
              scene.powerBar.height += 2.5;
              if (scene.powerBar.height >= 200) {
                scene.powerBar.height = 200;
                rechargeTimer.remove();
                console.log('Barra ricaricata completamente');
              }
            }
          });
        }
      }
    });
  }
}

export function fasterByTime(scene) {
  //incrementa la velocità di 2 ogni 30 sec.
  scene.scrollSpeed += 2
}


//testing problema: slowDownActive is not defined
export function spawnRandomEnemyCar(scene, selectedPG, carSelected) {
  let pgCopy = PG.filter((x) => x.ID != selectedPG);
  let randomEnemy = pgCopy[Math.floor(Math.random() * pgCopy.length)];

  let enemyCar = scene.physics.add.image(400, -100, `${randomEnemy.ID}`); // posizione iniziale fuori dallo schermo
  enemyCar.setVelocityY(100); // scende lentamente verso il basso
  enemyCar.setDepth(1); // sopra la pista

  scene.physics.add.collider(carSelected, enemyCar, () => {
    // Attiva rallentamento
    slowDownActive = true;
    // Effetto di tremolio sulla camera
    cameras.main.shake(100, 0.01);
    // Dopo 3 secondi, torna normale
    time.delayedCall(1000, () => {
    slowDownActive = false;
    });
  });
};

//da completare
export function spawnObject() {
  let objectToSpawn;
  let randomItem = Phaser.Math.Between(1, 10);
  isEven(randomItem) ? objectToSpawn = 'power' : objectToSpawn = 'life';
  obj = physics.add.image(400, -100, `${objectToSpawn}`); // posizione iniziale fuori dallo schermo
  obj.setVelocityY(100); // scende lentamente verso il basso
  obj.setDepth(1); // sopra la pista

  physics.add.overlap(car, obj, collectObject, null, this);

  function collectStar (car, obj, objectToSpawn){
    obj.disableBody(true, true);
    //??      
  }
};

//Funzioni generali

function isEven(n) {
  return n % 2 === 0;
}
