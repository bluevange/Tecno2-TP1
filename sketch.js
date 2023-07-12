class Zona {
  constructor(x, y, width, height, imgIndices) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.imgIndices = imgIndices;
  }

  mostrarImagenAleatoria() {
    if (this.imgIndices.length > 0) {
      let randomIndex = floor(random(this.imgIndices.length));
      let imgIndex = this.imgIndices[randomIndex];
      if (imgIndex >= 0 && imgIndex < imgs.length) {
        let img = imgs[imgIndex];
        image(img, this.x, this.y, this.width, this.height);
      }
    }
  }

  contienePunto(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

class Imagen {
  constructor(img, x, y, size) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.size = size;
    this.rotation = random(TWO_PI); // Rotación aleatoria inicial entre 0 y 2π (360 grados)
  }

  mostrar() {
    push();
    translate(this.x + this.size / 2, this.y + this.size / 2);
    rotate(this.rotation);
    image(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
    pop();
  }

  rotar(velocidad) {
    this.rotation += velocidad;
  }
}

let zonas = [];
let imgPaths = [
  'libraries/trazo0.png',
  'libraries/trazo1.png',
  'libraries/trazo2.png',
  'libraries/trazo3.png',
  'libraries/trazo4.png',
  'libraries/trazo5.png',
  'libraries/trazo6.png',
  'libraries/trazo7.png',
  'libraries/trazo8.png',
  'libraries/trazo9.png',
  'libraries/trazo10.png',
  'libraries/trazo11.png',
  'libraries/trazo12.png',
  'libraries/trazo13.png',
  'libraries/trazo14.png',
  'libraries/trazo16.png',
  'libraries/trazo17.png',
  'libraries/trazo18.png',
  'libraries/trazo19.png',
  'libraries/trazo20.png',
  'libraries/trazo21.png',
  'libraries/trazo22.png',
  'libraries/trazo23.png',
  'libraries/trazo24.png',
  'libraries/trazo28.png',
  'libraries/trazo29.png',
  'libraries/trazo30.png',
  'libraries/trazo31.png',
  'libraries/trazo32.png',
  'libraries/trazo33.png'
];
let imgs = [];
let mic;
let AMP_MIN = 0.02; // umbral mínimo de amplitud. Señal que supera al ruido de fondo
let AMP_MAX = 0.1; // umbral máximo de amplitud.
let imagesOnScreen = [];
let rotationSpeed = 0;

let soundTimer = 0;
const SOUND_DURATION_THRESHOLD = 3; // Umbral de duración de sonido en segundos para activar la rotación
const RESTART_THRESHOLD = 220; // Umbral de duración de sonido en segundos para reiniciar las imágenes

function preload() {
  for (let i = 0; i < imgPaths.length; i++) {
    imgs[i] = loadImage(imgPaths[i]);
  }
}

function setup() {
  createCanvas(600, 600);

  // Asignar múltiples imágenes a cada zona
  zonas.push(new Zona(-100, 0, 400, 600, [0, 1, 2, 21,24, 25, 28,32]));
  zonas.push(new Zona(300, 0, 400, 600, [ 4, 10, 11, 22, 29,31]));
  zonas.push(new Zona(-100, 0, 200, 500, [5, 6, 7, 12, 18, 15, 17, 14, 25, 26]));
  zonas.push(new Zona(300, 0, 200, 400, [8, 9, 13, 20, 19,18,27,30]));

  mic = new p5.AudioIn();
  mic.start();
  userStartAudio();
}

function draw() {
  let vol = mic.getLevel();

  background(153, 255, 204);
  for (let i = 0; i < zonas.length; i++) {
    let zone = zonas[i];
    //rect(zone.x, zone.y, zone.width, zone.height);
  }

  // Si el volumen supera el umbral mínimo y no se han dibujado todas las imágenes, agregar una nueva imagen al array
  if (vol > AMP_MIN && imagesOnScreen.length < 40) {
    let x = random(-100, width);
    let y = random(height-50);
    let imgIndex = -1;
    let zoneIndex = -1;

    for (let i = 0; i < zonas.length; i++) {
      if (zonas[i].contienePunto(x, y)) {
        zoneIndex = i;
        let zone = zonas[zoneIndex];
        if (zone.imgIndices.length > 0) {
          let randomIndex = floor(random(zone.imgIndices.length));
          imgIndex = zone.imgIndices[randomIndex];
        }
        break;
      }
    }

    if (imgIndex >= 0 && imgIndex < imgs.length) {
      let img = imgs[imgIndex];
      let imgSize = random(200, 250);
      if (random() < 0.3) {
        imgSize *= 2; // Aumentar el tamaño de la imagen en un 100% (doble tamaño)
      }
      let newImage = new Imagen(img, x, y, imgSize);
      imagesOnScreen.push(newImage);
    }
  }

  // Mostrar todas las imágenes en pantalla y rotarlas si el sonido se mantiene durante unos segundos
  for (let i = 0; i < imagesOnScreen.length; i++) {
    let imageObj = imagesOnScreen[i];
    imageObj.mostrar();

    if (vol > AMP_MIN) {
      soundTimer += deltaTime / 1000; // Incrementar el temporizador de sonido en segundos
    } else {
      soundTimer = 0; // Reiniciar el temporizador si no hay sonido
    }

    if (soundTimer >= SOUND_DURATION_THRESHOLD) {
      rotationSpeed = map(vol, AMP_MIN, AMP_MAX, 0, 0.2); // Calcular la velocidad de rotación basada en el volumen del sonido
      imageObj.rotar(rotationSpeed);
    }
  }

  // Reiniciar las imágenes si el sonido se mantiene durante un tiempo más largo
  if (soundTimer >= RESTART_THRESHOLD) {
    imagesOnScreen.splice(0, imagesOnScreen.length); // Eliminar todas las imágenes actuales
    soundTimer = 0; // Reiniciar el temporizador de sonido
  }
}

// Eliminar una imagen al hacer clic sobre ella
function mouseClicked() {
  for (let i = imagesOnScreen.length - 1; i >= 0; i--) {
    let imageObj = imagesOnScreen[i];
    if (
      mouseX >= imageObj.x &&
      mouseX <= imageObj.x + imageObj.size &&
      mouseY >= imageObj.y &&
      mouseY <= imageObj.y + imageObj.size
    ) {
      imagesOnScreen.splice(i, 1);
    }
  }
}
