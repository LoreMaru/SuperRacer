export function createAnimations(scene) {
  scene.anims.create({
    key: 'Corsa_all_Oro',
    frames: scene.anims.generateFrameNumbers('Corsa_all_Oro', { start: 0, end: 91 }),
    frameRate: 30,
    repeat: -1
  });

  scene.anims.create({
    key: 'Due_ruote',
    frames: scene.anims.generateFrameNumbers('Due_ruote', { start: 0, end: 61 }),
    frameRate: 30,
    repeat: -1
  });

  scene.anims.create({
    key: 'Diss_onanza',
    frames: scene.anims.generateFrameNumbers('Diss_onanza', { start: 0, end: 61 }),
    frameRate: 30,
    repeat: -1
  });

  scene.anims.create({
    key: 'Bolla_papale',
    frames: scene.anims.generateFrameNumbers('Bolla_papale', { start: 0, end: 28 }),
    frameRate: 30,
    repeat: -1
  });
  

  }
  