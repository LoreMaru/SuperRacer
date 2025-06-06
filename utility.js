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


export function spawnRandomEnemyCar(scene, selectedPG, carSelected) {
  
  let pgCopy = PG.filter((x) => x.ID != selectedPG);
  let randomEnemy = pgCopy[Math.floor(Math.random() * pgCopy.length)];
  let enemyCar = scene.physics.add.image(400, -100, `${randomEnemy.ID}`); // posizione iniziale fuori dallo schermo
  enemyCar.setVelocityY(100); // scende lentamente verso il basso
  enemyCar.setDepth(1); // sopra la pista
  //enemyCar.setAngle(180); 

  scene.physics.add.collider(carSelected, enemyCar, () => {
    // Attiva rallentamento
    scene.slowDownActive = true;
    // Effetto di tremolio sulla camera
    scene.cameras.main.shake(100, 0.01);
    // Dopo 3 secondi, torna normale
    scene.time.delayedCall(1000, () => {
      scene.slowDownActive = false;
    });
  });
};

export function spawnEnemiesOverTime(scene, selectedPG, carSelected, enemySpawnDelay, minimumSpawnDelay) {
  // genera il nemico
  spawnRandomEnemyCar(scene, selectedPG, carSelected);
  // calcola il nuovo ritardo: ogni volta diminuisce del 10%
  enemySpawnDelay *= 0.9;
  // limite minimo per non esagerare
  if (enemySpawnDelay < minimumSpawnDelay) {
    enemySpawnDelay = minimumSpawnDelay;
  }

  // richiama sé stessa dopo il nuovo delay
  scene.time.delayedCall(enemySpawnDelay, () => {
    spawnEnemiesOverTime(scene, selectedPG, carSelected, enemySpawnDelay, minimumSpawnDelay);
  });
}


//da completare
//phaser.min.js:1 Uncaught TypeError: Cannot read properties of undefined
export function spawnRandomObject(scene, car) {
  let objectToSpawn;
  let randomItem = Phaser.Math.Between(1, 10);
  isEven(randomItem) ? objectToSpawn = 'power' : objectToSpawn = 'life';
  console.log(objectToSpawn)
  let obj = scene.physics.add.image(400, -100, `${objectToSpawn}`); // posizione iniziale fuori dallo schermo
  obj.setVelocityY(100); // scende lentamente verso il basso
  obj.setDepth(1); // sopra la pista

  scene.physics.add.overlap(car, obj, collectObject(obj), null, this);
};

export function collectObject (obj){
    obj.disableBody(true, true);    
  }

export function spawnObjectsOverTime(scene, objSpawnDelay, minimumOBJSpawnDelay, car) {
  // genera il nemico
  spawnRandomObject(scene, car);
  // calcola il nuovo ritardo: ogni volta diminuisce del 10%
  objSpawnDelay *= 0.9;
  // limite minimo per non esagerare
  if (objSpawnDelay < minimumOBJSpawnDelay) {
    objSpawnDelay = minimumOBJSpawnDelay;
  }

  // richiama sé stessa dopo il nuovo delay
  scene.time.delayedCall(objSpawnDelay, () => {
    spawnObjectsOverTime(scene, objSpawnDelay, minimumOBJSpawnDelay);
  });
}

//Funzioni generali

function isEven(n) {
  return n % 2 === 0;
}
