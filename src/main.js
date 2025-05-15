// Import dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 80, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.strength = 1.2;
bloomPass.radius = 0.6;
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 30, 20);
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();
const planetTextures = {
  Mercury: textureLoader.load('one.jpg'),
  Venus: textureLoader.load('two.jpg'),
  Earth: textureLoader.load('three.png'),
  Mars: textureLoader.load('four.jpg'),
  Jupiter: textureLoader.load('five.jpg'),
  Saturn: textureLoader.load('six.png'),
  Uranus: textureLoader.load('seven.png')
};



const sun = new THREE.Mesh(
  new THREE.SphereGeometry(16, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffffcc, emissive: 0xffddaa, emissiveIntensity: 3 })
);
sun.userData.name = 'The Sun';
scene.add(sun);

const sunLight = new THREE.PointLight(0xffffff, 2, 200);
sunLight.position.copy(sun.position);
scene.add(sunLight);

const planetData = [
  { size: 2, distance: 24, speed: 0.005, rotationSpeed: 0.01, name: 'Mercury', glowColor: 0xff00aa },
  { size: 2.5, distance: 30, speed: 0.004, rotationSpeed: 0.008, name: 'Venus', glowColor: 0xffc0cb },
  { size: 3, distance: 38, speed: 0.0035, rotationSpeed: 0.02, name: 'Earth', glowColor: 0xff5500 },
  { size: 2.5, distance: 46, speed: 0.003, rotationSpeed: 0.017, name: 'Mars', glowColor: 0x00ff00 },
  { size: 3.5, distance: 56, speed: 0.002, rotationSpeed: 0.015, name: 'Jupiter', glowColor: 0x0099ff },
  { size: 3, distance: 66, speed: 0.0015, rotationSpeed: 0.013, name: 'Saturn', glowColor: 0xfff5cc },
  { size: 2.5, distance: 76, speed: 0.001, rotationSpeed: 0.011, name: 'Uranus', glowColor: 0x665533 }
];

const planets = [];
planetData.forEach((data, i) => {
  const texture = planetTextures[data.name] || null;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0 })
  );

  // Subtle Glow
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: data.glowColor,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
    depthWrite: false
  });
  const glowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size * 1.05, 32, 32),
    glowMaterial
  );
  mesh.add(glowMesh);

  // Planet-specific effects
  switch (data.name) {
    case 'Earth': {
      const cloudGeo = new THREE.SphereGeometry(data.size * 1.01, 32, 32);
      const cloudMat = new THREE.MeshStandardMaterial({
        //map: textureLoader.load('/clouds.png'),
        transparent: true,
        opacity: 0.4,
        depthWrite: false
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      mesh.add(cloudMesh);
      mesh.userData.cloudMesh = cloudMesh;
      break;
    }
    case 'Mars': {
      for (let j = 0; j < 3; j++) {
        const rock = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x996655 })
        );
        rock.position.set(Math.random() * 3, Math.random() * 1, Math.random() * 3);
        
      }
      break;
    }
    case 'Jupiter': {
      const storm = new THREE.Mesh(
        new THREE.SphereGeometry(data.size * 0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffaa00, emissive: 0xff7700, emissiveIntensity: 1 })
      );
      storm.position.set(data.size * 0.7, 0, 0);
      mesh.add(storm);
      break;
    }
    case 'Saturn': {
      const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 1.4, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffeebb,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      for (let j = 0; j < 50; j++) {
        const dust = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 0.5 })
        );
        const angle = Math.random() * Math.PI * 2;
        const rad = THREE.MathUtils.randFloat(data.size * 1.5, data.size * 2.1);
        dust.position.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad);
        mesh.add(dust);
      }
      break;
    }
    case 'Uranus': {
      for (let j = 0; j < 10; j++) {
        const sparkle = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x99ffff, transparent: true, opacity: 0.6 })
        );
        sparkle.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        );
        mesh.add(sparkle);
      }
      break;
    }
  }

  // --- ADD ORBIT TRAIL ---
  const segments = 128;
  const orbitGeometry = new THREE.BufferGeometry();
  const positionsOrbit = new Float32Array(segments * 3);
  for (let j = 0; j < segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    positionsOrbit[j * 3] = Math.cos(theta) * data.distance;
    positionsOrbit[j * 3 + 1] = 0;
    positionsOrbit[j * 3 + 2] = Math.sin(theta) * data.distance;
  }
  orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positionsOrbit, 3));
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.3 });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);
  // --- END ORBIT TRAIL ---

  mesh.userData = data;
  scene.add(mesh);
  planets.push({ mesh, angle: Math.random() * Math.PI * 2 });
});

// Calculate farthest planet distance to set min star distance accordingly
const farthestDistance = Math.max(...planetData.map(p => p.distance));

// Stars setup
const starCount = 3000;
const positions = new Float32Array(starCount * 3);
const colorsStar = new Float32Array(starCount * 3);
const velocities = new Float32Array(starCount * 3);

function getSubtleWhiteTint() {
  const base = 0.95 + Math.random() * 0.05;
  const offset = (Math.random() - 0.5) * 0.1;
  if (Math.random() < 0.1) {
    const colorChoice = Math.floor(Math.random() * 3);
    switch (colorChoice) {
      case 0: return new THREE.Color(base + offset, base, base);
      case 1: return new THREE.Color(base, base + offset, base);
      case 2: return new THREE.Color(base, base, base + offset);
    }
  }
  return new THREE.Color(base, base + offset, base - offset);
}

const radius = 300;
const minRadius = farthestDistance + 5; // Ensure stars are outside the farthest planet orbit

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const radiusFactor = Math.random() * (radius - minRadius) + minRadius;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  positions[i3] = radiusFactor * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = radiusFactor * Math.sin(phi) * Math.sin(theta);
  positions[i3 + 2] = radiusFactor * Math.cos(phi);

  const color = getSubtleWhiteTint();
  colorsStar[i3] = color.r;
  colorsStar[i3 + 1] = color.g;
  colorsStar[i3 + 2] = color.b;

  velocities[i3] = (Math.random() - 0.5) * 0.02;
  velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
  velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
}

const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(colorsStar, 3));

const starTexture = new THREE.TextureLoader().load('circle.png');

const starMat = new THREE.PointsMaterial({
  size: 0.6,
  map: starTexture,
  transparent: true,
  depthWrite: false,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const popup = document.getElementById('info-popup');
const popupImage = document.getElementById('popup-image');
const downloadCvBtn = document.getElementById('download-cv-btn');
const closePopupBtn = document.getElementById('close-popup-btn');

closePopupBtn.onclick = () => {
  popup.style.display = 'none';
};

downloadCvBtn.onclick = () => {
  // Replace '/path/to/your-cv.pdf' with your actual CV pdf file URL/path
  const link = document.createElement('a');
  link.href = 'ResumeAbdullahRafiq.pdf';  // <-- put your CV file URL here
  link.download = 'AbdullahRafiqCV.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Update your existing click event handler code to something like this:
window.addEventListener('click', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([sun, ...planets.map(p => p.mesh)], true);

  if (intersects.length > 0) {
    let object = intersects[0].object;

    while (object && !object.userData.name) {
      object = object.parent;
    }

    if (!object) return;

    let title = object.userData.name || 'The Sun';
    let description = 'Click around to explore more!';
    let imageUrl = '';
    let showDownloadBtn = false;

    switch (title) {
      case 'The Sun':
        title = 'Abdullah Rafiq';
        description = 'The bright heart of our Solar System.';
        showDownloadBtn = true;  // Show CV download button
        break;
      case 'Mercury':
        title = 'Happy Bucket';
        description = 'At Happy Bucket, I took on the role of Director and Software Engineer, where I was deeply involved in designing and developing a mental health and well-being application aimed at genuinely helping users manage their mental health challenges. My focus was on creating unique and creative features that directly addressed real user needs, ensuring the platform offered meaningful support. I led a small development team, fostering clear and concise communication between members and collaborating closely with fellow directors to keep our shared vision aligned. This teamwork allowed the platform to continuously evolve and improve over time. Technically, I built the web application using PHP, HTML, CSS, and SQL, focusing on delivering an intuitive and accessible user experience. I prioritized creating a responsive and user-friendly website that made the app’s core functionality easy to use and accessible to a wide audience. Overall, my work at Happy Bucket combined technical development, team leadership, and user-centered design to create a platform that made a real difference in people’s mental health and well-being.';
        imageUrl = 'happybucket1.png';
        break;
      case 'Venus':
        title = 'Warrior - An Exploration of AI in narrative-driven games';
        description = 'Venus: The hottest planet with thick clouds.';
        imageUrl = 'two.jpg';
        break;
      case 'Earth':
        title = 'Predicting F10.7';
        description = 'Earth: Our home, rich with life.';
        imageUrl = 'f10.7.png';
        break;
      case 'Mars':
        title = 'ROTULUS: 3U CubSat Mission';
        description = 'Mars: The red planet with a mysterious past.';
        imageUrl = 'rotulus.png';
        break;
      case 'Jupiter':
        title = 'Rover Wheel Evaluation using Evolutionary Algorithms';
        description = 'Jupiter: The giant with a raging storm.';
        imageUrl = 'stein.png';
        break;
      case 'Saturn':
        title = 'Trajectory Data Converter';
        description = 'Saturn: Famous for its beautiful rings.';
        imageUrl = 'six.png';
        break;
      case 'Uranus':
        title = 'Galax-C';
        description = 'Uranus: The icy blue planet that spins sideways.';
        imageUrl = 'seven.png';
        break;
    }

    popup.querySelector('h2').innerText = title;
    popup.querySelector('p').innerText = description;

    if (showDownloadBtn) {
      popupImage.style.display = 'none';
      downloadCvBtn.style.display = 'inline-block';
    } else {
      popupImage.src = imageUrl;
      popupImage.style.display = 'block';
      downloadCvBtn.style.display = 'none';
    }

    popup.style.display = 'block';
  }
});




const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.enableZoom = false;

function animate() {
  requestAnimationFrame(animate);

  sun.rotation.y += 0.002;

  planets.forEach(p => {
    p.angle += p.mesh.userData.speed;
    const d = p.mesh.userData.distance;
    p.mesh.position.set(Math.cos(p.angle) * d, 0, Math.sin(p.angle) * d);

    // Rotate planet on its axis
    p.mesh.rotation.y += p.mesh.userData.rotationSpeed || 0.01;

    if (p.mesh.userData.cloudMesh) {
      p.mesh.userData.cloudMesh.rotation.y += 0.005;
    }
  });

  const pos = starGeo.attributes.position.array;
  const minDistance = minRadius; // same as minRadius for stars
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] += velocities[i];
    pos[i + 1] += velocities[i + 1];
    pos[i + 2] += velocities[i + 2];

    const dist = Math.sqrt(pos[i] ** 2 + pos[i + 1] ** 2 + pos[i + 2] ** 2);
    if (dist < minDistance) {
      const radiusFactor = Math.random() * (radius - minRadius) + minRadius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i] = radiusFactor * Math.sin(phi) * Math.cos(theta);
      pos[i + 1] = radiusFactor * Math.sin(phi) * Math.sin(theta);
      pos[i + 2] = radiusFactor * Math.cos(phi);
    }
  }
  starGeo.attributes.position.needsUpdate = true;

  controls.update();
  composer.render();
}

document.getElementById('question-mark-circle').addEventListener('click', () => {
  popup.querySelector('h2').innerText = 'Welcome Traveller!';
  popup.querySelector('p').innerText = 'My name is Abdullah and welcome to my personal Solar System I made quickly using three.js to show off some of my personal projects. Drag to look around using the mouse and click on the the star in the centre to learn about me or the planets to see my projects!\n \n WARNING - This is not a replica of our Solar Sytem and breaks many laws of physics!';
  popupImage.style.display = 'none';      // hide image
  downloadCvBtn.style.display = 'none';   // hide CV button
  popup.style.display = 'block';
});


popup.querySelector('h2').innerText = 'Welcome Traveller!';
  popup.querySelector('p').innerText = 'My name is Abdullah and welcome to my personal Solar System I made quickly using three.js to show off some of my personal projects. Drag to look around using the mouse and click on the the star in the centre to learn about me or the planets to see my projects! \n \nWARNING - This is not a replica of our Solar Sytem and breaks many laws of physics!';
  popup.style.display = 'block';

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
