

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
    const dischargeTimer = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        scene.powerBar.height -= 10;
        powerAnimation.setVisible(true).setDepth(2).play(keyAnimazione);

        if (scene.powerBar.height <= 0) {
          dischargeTimer.remove();
          powerAnimation.setVisible(false).stop();

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



//attualmente non usata
export function spawnEnemyCar(enemyName) {
  let enemyCar = physics.add.image(400, -100, `${enemyName}`); // posizione iniziale fuori dallo schermo
  enemyCar.setVelocityY(100); // scende lentamente verso il basso
  enemyCar.setDepth(1); // sopra la pista

  physics.add.collider(car, enemyCar, () => {
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

//da testare
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
