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
        if(scene.powerBar.height > 0){
          scene.powerBar.height -= 10;
        }
        if (scene.powerBar.height == 0) {
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
  let enemyCar = scene.physics.add.image(400, -100, `${randomEnemy.ID}`);// posizione iniziale fuori dallo schermo
  enemyCar.setVelocityY(100); // scende lentamente verso il basso
  enemyCar.setDepth(1); // sopra la pista
  enemyCar.isTracking = true; // proprietà personalizzata, vedi update
  scene.enemies.add(enemyCar);
  //enemyCar.setAngle(180); 

  //animazione potere nemico
  let enemyPowerAnimation = scene.add.sprite(enemyCar.x, enemyCar.y, randomEnemy.keyAnimazione).setVisible(false)

    //if (!enemyPowerAnimation.anims.isPlaying) {
    //  enemyPowerAnimation.play(randomEnemy.keyAnimazione);
    //}
    enemyCar.powerAnimation = enemyPowerAnimation;
    enemyCar.keyAnimazione = randomEnemy.keyAnimazione

  //gestore collisioni con giocatore
  scene.physics.add.collider(carSelected, enemyCar, () => {
    scene.lifeBar.height -= 5; 
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



export function spawnRandomObj(scene, carSelected){
  let objectToSpawn;
  let randomItem = Phaser.Math.Between(1, 10);
  isEven(randomItem) ? objectToSpawn = 'power' : objectToSpawn = 'life';
  
  let randomSpot;//if per evitare che l'oggetto compaia sul nemico
  if (Phaser.Math.Between(0, 1) === 0) {
  randomSpot = Phaser.Math.Between(250, 300);
} else {
  randomSpot = Phaser.Math.Between(500, 700);
}
  let upItem = scene.physics.add.image(randomSpot, -100, objectToSpawn);
  upItem.setVelocityY(100); // scende lentamente verso il basso
  upItem.setDepth(1);
  upItem.setScale(0.07);

  scene.physics.add.collider(carSelected, upItem, () => {
    upItem.disableBody(true, true);
    if(objectToSpawn=='life' && scene.lifeBar.height<200){
      scene.lifeBar.height += 5; 
    }
    if(objectToSpawn=='power' && scene.powerBar.height<200){
      scene.powerBar.height += 5;
    }
  });
}

//funzione per generare nemici ed oggetti nel tempo
export function spawnThingsOverTime(scene, selectedPG, carSelected, enemySpawnDelay, minimumSpawnDelay) {
  // genera il nemico e l'oggetto
  spawnRandomEnemyCar(scene, selectedPG, carSelected);
  spawnRandomObj(scene, carSelected)
  // calcola il nuovo ritardo: ogni volta diminuisce del 10%
  enemySpawnDelay *= 0.9;
  // limite minimo per non esagerare
  if (enemySpawnDelay < minimumSpawnDelay) {
    enemySpawnDelay = minimumSpawnDelay;
  }
  // richiama sé stessa dopo il nuovo delay
  scene.time.delayedCall(enemySpawnDelay, () => {
    spawnThingsOverTime(scene, selectedPG, carSelected, enemySpawnDelay, minimumSpawnDelay);
  });
}






//Funzioni generali

function isEven(n) {
  return n % 2 === 0;
}
