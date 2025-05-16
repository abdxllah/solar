import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';


window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.style.display = 'none', 500);
  }
});

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
  { size: 2, distance: 24, speed: 0.0025, rotationSpeed: 0.01, name: 'Mercury', glowColor: 0xff00aa },
  { size: 2.5, distance: 30, speed: 0.002, rotationSpeed: 0.008, name: 'Venus', glowColor: 0xffc0cb },
  { size: 3, distance: 38, speed: 0.00175, rotationSpeed: 0.02, name: 'Earth', glowColor: 0xff5500 },
  { size: 2.5, distance: 46, speed: 0.0015, rotationSpeed: 0.017, name: 'Mars', glowColor: 0x00ff00 },
  { size: 3.5, distance: 56, speed: 0.001, rotationSpeed: 0.015, name: 'Jupiter', glowColor: 0x0099ff },
  { size: 3, distance: 66, speed: 0.00075, rotationSpeed: 0.013, name: 'Saturn', glowColor: 0xfff5cc },
  { size: 2.5, distance: 76, speed: 0.0005, rotationSpeed: 0.011, name: 'Uranus', glowColor: 0x665533 }
];

const planets = [];
planetData.forEach((data, i) => {
  const texture = planetTextures[data.name] || null;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0 })
  );

  // glow
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

  // effects for planets
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

  //orbit trail
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

  mesh.userData = data;
  scene.add(mesh);
  planets.push({ mesh, angle: Math.random() * Math.PI * 2 });
});

const farthestDistance = Math.max(...planetData.map(p => p.distance));

// stars setup
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
const minRadius = farthestDistance + 5; 

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
const popupImage2 = document.getElementById('popup-image2');
const downloadCvBtn = document.getElementById('download-cv-btn');
const closePopupBtn = document.getElementById('close-popup-btn');

closePopupBtn.onclick = () => {
  popup.style.display = 'none';
};

downloadCvBtn.onclick = () => {
  const link = document.createElement('a');
  link.href = '/ResumeAbdullahRafiq.pdf';  
  link.download = 'AbdullahRafiqCV.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
    let description = 'I have grown up always wanting to help people and I\'m driven by the desire to make a meaningful difference. My passion lies in using technology and creativity to improve lives and make difference, whether that’s through designing tools for space missions, developing mental health platforms, or creating projects that support and uplift communities. With a foundation in both space and software engineering, I thrive at the intersection of logic and empathy, precision and imagination. Everything I build, whether it’s a predictive model for solar activity or a custom programming language for space engineers, is rooted in purpose: to help others, inspire change, and push boundaries.';
    let imageUrl = '';
    let imageUrl2 = '';
    let showDownloadBtn = false;

    switch (title) {
      case 'The Sun':
        title = 'Abdullah Rafiq - Space Engineer. Computer Scientist. Musician. Comedic liability.';
        description = 'I have grown up always wanting to help people and I\'m driven by the desire to make a meaningful difference. My passion lies in using technology and creativity to improve lives and make difference, whether that’s through designing tools for space missions, developing mental health platforms, or creating projects that support and uplift communities. With a foundation in both space and software engineering, I thrive at the intersection of logic and empathy, precision and imagination. Everything I build, whether it’s a predictive model for solar activity or a custom programming language for space engineers, is rooted in purpose: to help others, inspire change, and push boundaries, both on the world around me and beyond.';
        showDownloadBtn = true;  
        popupImage2.style.display = 'none';
        break;
      case 'Mercury':
        title = 'Happy Bucket';
        description = 'At Happy Bucket, I took on the role of Director and Software Engineer, where I was deeply involved in designing and developing a mental health and well-being application aimed at genuinely helping users manage their mental health challenges. The idea came up around the time that me and my friends were doing our A-levels and was rooted around the struggles that we ourselves were facing and seeing our peers face. My focus was on creating unique and creative features that directly addressed real user needs, ensuring the platform offered meaningful support. Some of these included a timer for when users were experiencing moments of anxiety to help calm them until it passed, as well as a feature called Send Me Into Orbit that allowed users to recieve anonymous messages of support from other users. \n \n I helped lead a small development team, fostering clear and concise communication between members and collaborating closely with fellow directors to keep our shared vision aligned. This teamwork allowed the platform to continuously evolve and improve over time. Happy Bucket was built using PHP, HTML, CSS, and SQL, focusing on delivering an intuitive and accessible user experience. The priority for us was creating a responsive and user-friendly website that made the app’s core functionality easy to use and accessible to a wide audience. My work at Happy Bucket was the first real exposure I had to both software development and business in general. It combined technical development, team leadership, and user-centered design to try to create a platform that made a real difference in people’s mental health and well-being. I learned not just how to code a Full Stack Application, but also more about Agile techniques and software engineering as a whole. I also learnt more about the design side of coding, as well as the stuff in a platform that goes beyond development, like marketing and research.\n\n';
        imageUrl = 'happybucket1.png';
        imageUrl2 = 'happybucket2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Venus':
        title = 'Warrior - An Exploration of AI in narrative-driven games';
        description = 'During my final year in Computer Science, I wanted to push the boundaries of what AI could do in games—not just for functionality, but for storytelling. I’ve always loved the idea of games that feel personal, where your choices actually mean something, and I thought AI could be the way to make that happen in a more dynamic way than traditional branching narratives. So I built a story-driven game called Warrior, where I explored how multiple AI systems could work together to create a more responsive and immersive experience for the player. \n \n My focus was on the technical implementation—bringing these ideas to life through code. I built the game in Unity using C#, and designed a full system that allowed players to input natural language responses and have those responses shape the story in real time. I used a mix of Naive Bayes for offline classification and GPT-3 for online classification and conversation, giving users the choice between speed and depth. One of the core challenges was making sure the input could be accurately interpreted by the system, so I developed a layered classification approach, where even GPT-3 responses were filtered through a custom classifier to make sure everything aligned with the story structure. \n\n To manage the story, I built a system based on “story beats”—smaller pieces of narrative that the game could pull from depending on the player\'s decisions. I created a custom node-based editor in Unity using xNode, which made it easy to build and visualise the branching structure. Then I developed a Tension Manager, which dynamically selected which story beat should come next based on player input and four core variables: tension, affinity, fight, and red button (a kind of hostility meter). This helped guide the pacing of the game and gave the story a proper arc without feeling too rigid or pre-scripted. \n\n I also implemented fully dynamic NPCs using OpenAI’s GPT-3, where players could have freeform conversations with uniquely developed Viking characters—each with their own traits, backstories, and memory of past interactions. This gave the game more depth and replayability, and I was especially proud of how well it integrated with the core narrative engine. All of this was tied together in a 2D pixel-based interface that I designed and built, focusing on clean, readable dialogue and a game flow that felt natural.\n\n This project was a huge learning experience—not just technically, but also in terms of design thinking and player experience. I had to figure out how to make different AI systems work together in a coherent way, and then build a framework that other developers could use and adapt for their own stories. I tested the system with real users, collected feedback, and iterated based on that, treating the development like a live product. It’s was a good experience with complex and creative coding, and it really opened my eyes to how AI and narrative design can come together in new ways.'
        imageUrl = 'warrior.png';
        imageUrl2 = 'warrior2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Earth':
        title = 'Predicting F10.7';
        description = 'As part of my Space Engineering course, I developed a machine learning model to predict the F10.7cm solar radio flux for the next 28 days. F10.7 is a key parameter in space weather forecasting, and this project was a way for me to explore how my Computer Science experience and AI could support better predictions using historical data. I was really keen to focus on how different solar indices could feed into the model, and how much value each one added—so the entire approach was heavily data-driven and grounded in actual solar physics research.\n\n I built the prediction system using an LSTM (Long Short-Term Memory) neural network—ideal for time series tasks like this, because of its ability to understand sequential dependencies in data. The dataset I used came from several sources: historical F10.7 data, sunspot numbers, and other flux densities like F8cm and F15cm. I experimented with other drivers like Kp/Ap indices and X-ray flux from NOAA’s GOES satellites, but after some testing, I found they either didn’t improve the model or actually worsened performance—so I stripped it back to what worked best.\n\n To get to that conclusion, I plotted correlation matrices for each dataset to understand relationships between the features. Once I’d locked in the most useful inputs, I engineered lag features for F10.7, sunspot number, and F15cm—these really helped capture the temporal nature of the data and improved the model’s performance. I pre-processed everything using MinMaxScaler to normalise the data and built sequences of 30 days\' worth of inputs to feed into the LSTM.\n\nThe model itself was coded in Python using TensorFlow and Keras. I structured it with one LSTM layer followed by a Dropout to prevent overfitting, and then a dense output layer for the regression task. I also implemented an adaptive learning rate scheduler to fine-tune training over time and included early stopping to avoid excessive epochs. Hyperparameter tuning was based on trial and error and guided by how quickly the loss converged.\n\n After training the model, I tested it against real F10.7 data for the next 28 days that wasn’t included in the training set. I evaluated its performance using a wide range of metrics—MAE, RMSE, MAPE, R², and more. I also benchmarked it against a simple model that just predicted the average of the previous 28 days, and my LSTM clearly outperformed it. For further analysis, I conducted residual plots, histograms, and Q-Q plots to ensure the model’s predictions weren’t just statistically accurate but also stable and unbiased.\n\n Finally, I built out visualisations comparing the actual and predicted F10.7 values, and saved the trained model for future use. This project gave me a chance to apply machine learning to a real-world problem in space science, and it taught me a lot about data engineering, model evaluation, and time-series forecasting. It was one of the more technical and research-heavy pieces of code I’ve worked on, and I really enjoyed bringing it all together into something that felt like it had both scientific and practical value. Since this I have become a better coder, so there is definitely changes I could make at some point, but I\'m happy with the results I was able to obtain. '
        imageUrl2 = 'f10.7.png';
        imageUrl = 'sun.jpg';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Mars':
        title = 'ROTULUS: 3U CubSat Mission';
        description = 'For one of my major group projects in my Space Engineering course, I took the lead on designing the deployment mechanism for ROTULUS, a 3U CubeSat mission aimed at demonstrating a new drag-sail technology for satellite deorbiting in low Earth orbit. The goal of ROTULUS is to help tackle the space debris problem by accelerating satellite disposal using a novel sail deployment technique that’s both reliable and cost-effective. My main responsibility was focused on designing and refining how the sail would actually deploy in space.\n\n From the start, I knew the deployment mechanism was going to make or break the mission. So I approached it in stages—mechanical and electromechanical—and tried to balance innovation with reliability. I explored different concepts, but I was always grounding my decisions in what made sense for a university-led project: proven heritage in CubeSat missions, low complexity, minimal risk, and realistic mass and volume budgets. I used MATLAB for analysis and programming to help calculate the best approaches. I ended up using a burn wire system for the initial lid release, which is a tried-and-tested approach, and paired that with folded CFRP booms for the main sail deployment. I ran failure mode analysis (FMEA) across all options to identify critical risks early and narrow things down to what would actually work in space, not just on paper. \n\n The most challenging part was the secondary sail deployment. Unlike the primary sail, this didn’t have much heritage, so it had to be a novel design. I considered a few options, including using shape memory alloys and passive methods, but these introduced too much risk or weren’t feasible given our constraints. What I landed on was a concept that combined a mechanical motor with a pulley system to precisely unfold the secondary sail perpendicularly to the primary one. It’s still at a conceptual stage, but it laid a solid foundation for future development and gave the team a clear direction to build on.\n\n Alongside the design, I also developed a basic CAD model to integrate the deployment mechanism into the CubeSat bus. This meant rethinking the internal layout and making small structural changes to make everything fit, including adjusting the base height to allow for solar panels. I focused the CAD on components I knew were viable so future engineers could easily pick up the design and continue refining the parts that still needed work.\n\n Overall, this project gave me a chance to fully own a subsystem—from research and design through to risk analysis and integration. It pushed me to think not just about what works in theory, but what works in practice, especially when you\'re working with tight space, mass, and cost constraints. It also showed me how to balance creativity with practicality in spacecraft engineering. There’s still work to do on the secondary sail, but this project gave me a chance to dive deep into hardware design and leave behind something the team can take forward.'
        imageUrl = 'rotulus.png';
        popupImage2.style.display = 'none';
        break;
      case 'Jupiter':
        title = 'Rover Wheel Evaluation using Evolutionary Algorithms';
        description = 'For this project, I developed a system that used evolutionary algorithms to optimise the geometry of Steinmetz solids for use as planetary rover wheels. The idea was pretty simple on paper: could we use evolution-inspired code to design better-performing rover wheels, and at the same time explore whether Steinmetz solids—a kind of intersecting-cylinder shape—were even viable in this context? But turning that idea into a functioning system meant building a whole pipeline from scratch, and making sure it was accessible, reusable, and actually gave meaningful results. \n\n The system was designed with three key components: an evolutionary algorithm written in Python, a mesh generator that translated the code-based wheel designs into physical 3D meshes, and a simulation environment that tested how well each design performed on a terrain track. I kept the whole thing simple to run—just one terminal command from start to finish—so that other developers (or even non-programmers) could use and adapt the code without needing to dive into the backend. The evolutionary algorithm iterated over generations, tweaking variables like the number of intersecting cylinders, the radius and width of the wheel, and the number, size, and placement of grousers (those little tread ridges on a wheel). All of that was wrapped in a framework that prioritised ease of use, low computational cost, and adaptability.\n\n From the start, I followed an Agile development process, constantly refining the algorithm based on each run’s results. I used DEAP and Trimesh for the mesh generation, which gave me loads of geometric control while staying compatible with the rest of the system. For simulations, I went with CoppeliaSim, mostly because of its Remote API integration with Python—it meant I could automate the whole process from design to performance evaluation. \n\n The evolutionary algorithm itself went through ten major iterations. I experimented with everything from population size to mutation methods and crossover strategies, using both Gaussian and uniform mutations depending on whether the variable was continuous or discrete. A tournament selection mechanism kept the fittest designs evolving, and the termination condition was set to stop only once 75% of the population had converged on a single solution, avoiding early convergence and saving computational time. \n\n The simulation side of the system was just as important. I used ESA’s ExoMy rover as the base, and set it to drive over a custom-designed terrain featuring rocks, craters, and a 15-degree incline ramp. The goal was to see how the optimised wheels compared to the default ones in terms of traversal time, across different surface types. By the third run of the algorithm, the new wheels were outperforming the baseline, and by the final run, I had a design that improved overall traversal time by 22%. That final wheel used a bicylinder shape with four well-placed grousers, and proved faster not only across flat terrain but also on rough surfaces and steep inclines. I also validated everything across multiple physics engines in CoppeliaSim—Bullet 2.78, Bullet 2.83, and ODE—and the optimised wheel consistently outperformed the standard across all of them. \n\n Ultimately, the project showed that not only can Steinmetz solids work as rover wheels, but evolutionary algorithms can reliably optimise them too. There\'s definitely room to go deeper—trying different base shapes, adding in real-world manufacturing constraints, or integrating this into a physical rover build—but what I built serves as a solid proof of concept.'
        imageUrl = 'stein.png';
        imageUrl2 = 'stein2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Saturn':
        title = 'Trajectory Data Converter';
        description = 'For my trajectory converter project, I aimed to build a robust tool that simplifies the complex task of converting spacecraft trajectory data between various formats. The heart of the project was NASA’s SPICE toolkit, which I used through its C-language API. This powerful library provided all the essential functions for handling spacecraft geometry, position, and time conversions with precision, making it the ideal foundation for reliable trajectory transformations. The tool has the ability to convert trajectories starting from NAIF IDs into Orbit Ephemeris Message files, and then to other formats as needed.\n\n By parsing trajectory data files, the system was able to preserve flexibility in interpolation methods and frame references. The solution integrates time conversion, frame transformation, and state vector handling, enabling precise and adaptable trajectory generation for simulation or mission analysis workflows. To make the tool even more dynamic, I integrated NASA’s Horizons API. This lets the converter fetch precise, up-to-date ephemeris data directly from Horizons based on user-supplied NAIF IDs and time intervals, removing the need for local files. This capability makes the tool highly adaptable for a wide range of mission scenarios and simplifies access to trusted NASA trajectory data. \n\n The backend was built with Python and FastAPI, providing a clean, efficient server to handle file uploads and conversion requests. Under the hood, the heavy lifting is done by a C-based conversion script that directly calls the SPICE toolkit functions, ensuring both high performance and accuracy. While the frontend is simple, it effectively guides users through the conversion process and returns the converted data quickly.\n\n This work allowed me to merge low-level systems programming with space data standards, optimising pipeline efficiency for space mission support. Also, this project was a deep dive into the intricacies of spacecraft trajectory data and how to bridge powerful scientific tools like SPICE with user-friendly software. It taught me not only the technical side of space mission data formats but also how to design systems that make complex operations accessible. I’m proud of how the converter combines precision, flexibility, and ease of use, and I look forward to extending its capabilities further.'
        imageUrl = 'trajectory.png';
        popupImage2.style.display = 'none';
        break;
      case 'Uranus':
        title = 'Galax-C';
        description = 'Galax-C is my latest project and still very much a work in progress. I’m building a programming language based on C, specifically designed for space engineering applications. The idea came from seeing how many space professionals rely on complicated proprietary tools or have to write long, complex code just to perform standard calculations. I wanted to create something that simplifies that process, offering built-in functions for common space-related math so users can focus on the problem, not the programming overhead. \n\nThe language itself is designed with simplicity in mind. I’m aiming for a clean, straightforward syntax that makes it easier to write and understand code, even for engineers who aren’t professional programmers. This means complex calculations, like orbital mechanics or astrophysics formulas, can be written quickly and clearly. My hope is that Galax-C will speed up prototyping and testing of ideas by providing a dedicated tool that’s both powerful and approachable.\n\n Although Galax-C currently has the least amount of work done compared to my other projects, I’m excited about its potential. I want it to become a useful resource in the space community, reducing reliance on expensive software and bridging the gap between engineering concepts and software development. It’s a long-term effort, but I’m committed to building a language that can grow alongside the evolving needs of space professionals.'
        imageUrl = 'c.jpg';
        popupImage2.style.display = 'none';
        //popupImage2.src = imageUrl;
        //popupImage2.style.display = 'block';
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

window.addEventListener('touchend', event => {
  const touch = event.changedTouches[0];

  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([sun, ...planets.map(p => p.mesh)], true);

  if (intersects.length > 0) {
    let object = intersects[0].object;
    
    while (object && !object.userData.name) {
      object = object.parent;
    }

    if (!object) return;

    let title = object.userData.name || 'The Sun';
    let description = 'I have grown up always wanting to help people and I\'m driven by the desire to make a meaningful difference. My passion lies in using technology and creativity to improve lives and make difference, whether that’s through designing tools for space missions, developing mental health platforms, or creating projects that support and uplift communities. With a foundation in both space and software engineering, I thrive at the intersection of logic and empathy, precision and imagination. Everything I build, whether it’s a predictive model for solar activity or a custom programming language for space engineers, is rooted in purpose: to help others, inspire change, and push boundaries.';
    let imageUrl = '';
    let imageUrl2 = '';
    let showDownloadBtn = false;

    switch (title) {
      case 'The Sun':
        title = 'Abdullah Rafiq - Space Engineer. Computer Scientist. Musician. Comedic liability.';
        description = 'I have grown up always wanting to help people and I\'m driven by the desire to make a meaningful difference. My passion lies in using technology and creativity to improve lives and make difference, whether that’s through designing tools for space missions, developing mental health platforms, or creating projects that support and uplift communities. With a foundation in both space and software engineering, I thrive at the intersection of logic and empathy, precision and imagination. Everything I build, whether it’s a predictive model for solar activity or a custom programming language for space engineers, is rooted in purpose: to help others, inspire change, and push boundaries, both on the world around me and beyond.';
        showDownloadBtn = true;  
        popupImage2.style.display = 'none';
        break;
      case 'Mercury':
        title = 'Happy Bucket';
        description = 'At Happy Bucket, I took on the role of Director and Software Engineer, where I was deeply involved in designing and developing a mental health and well-being application aimed at genuinely helping users manage their mental health challenges. The idea came up around the time that me and my friends were doing our A-levels and was rooted around the struggles that we ourselves were facing and seeing our peers face. My focus was on creating unique and creative features that directly addressed real user needs, ensuring the platform offered meaningful support. Some of these included a timer for when users were experiencing moments of anxiety to help calm them until it passed, as well as a feature called Send Me Into Orbit that allowed users to recieve anonymous messages of support from other users. \n \n I helped lead a small development team, fostering clear and concise communication between members and collaborating closely with fellow directors to keep our shared vision aligned. This teamwork allowed the platform to continuously evolve and improve over time. Happy Bucket was built using PHP, HTML, CSS, and SQL, focusing on delivering an intuitive and accessible user experience. The priority for us was creating a responsive and user-friendly website that made the app’s core functionality easy to use and accessible to a wide audience. My work at Happy Bucket was the first real exposure I had to both software development and business in general. It combined technical development, team leadership, and user-centered design to try to create a platform that made a real difference in people’s mental health and well-being. I learned not just how to code a Full Stack Application, but also more about Agile techniques and software engineering as a whole. I also learnt more about the design side of coding, as well as the stuff in a platform that goes beyond development, like marketing and research.\n\n';
        imageUrl = 'happybucket1.png';
        imageUrl2 = 'happybucket2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Venus':
        title = 'Warrior - An Exploration of AI in narrative-driven games';
        description = 'During my final year in Computer Science, I wanted to push the boundaries of what AI could do in games—not just for functionality, but for storytelling. I’ve always loved the idea of games that feel personal, where your choices actually mean something, and I thought AI could be the way to make that happen in a more dynamic way than traditional branching narratives. So I built a story-driven game called Warrior, where I explored how multiple AI systems could work together to create a more responsive and immersive experience for the player. \n \n My focus was on the technical implementation—bringing these ideas to life through code. I built the game in Unity using C#, and designed a full system that allowed players to input natural language responses and have those responses shape the story in real time. I used a mix of Naive Bayes for offline classification and GPT-3 for online classification and conversation, giving users the choice between speed and depth. One of the core challenges was making sure the input could be accurately interpreted by the system, so I developed a layered classification approach, where even GPT-3 responses were filtered through a custom classifier to make sure everything aligned with the story structure. \n\n To manage the story, I built a system based on “story beats”—smaller pieces of narrative that the game could pull from depending on the player\'s decisions. I created a custom node-based editor in Unity using xNode, which made it easy to build and visualise the branching structure. Then I developed a Tension Manager, which dynamically selected which story beat should come next based on player input and four core variables: tension, affinity, fight, and red button (a kind of hostility meter). This helped guide the pacing of the game and gave the story a proper arc without feeling too rigid or pre-scripted. \n\n I also implemented fully dynamic NPCs using OpenAI’s GPT-3, where players could have freeform conversations with uniquely developed Viking characters—each with their own traits, backstories, and memory of past interactions. This gave the game more depth and replayability, and I was especially proud of how well it integrated with the core narrative engine. All of this was tied together in a 2D pixel-based interface that I designed and built, focusing on clean, readable dialogue and a game flow that felt natural.\n\n This project was a huge learning experience—not just technically, but also in terms of design thinking and player experience. I had to figure out how to make different AI systems work together in a coherent way, and then build a framework that other developers could use and adapt for their own stories. I tested the system with real users, collected feedback, and iterated based on that, treating the development like a live product. It’s was a good experience with complex and creative coding, and it really opened my eyes to how AI and narrative design can come together in new ways.'
        imageUrl = 'warrior.png';
        imageUrl2 = 'warrior2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Earth':
        title = 'Predicting F10.7';
        description = 'As part of my Space Engineering course, I developed a machine learning model to predict the F10.7cm solar radio flux for the next 28 days. F10.7 is a key parameter in space weather forecasting, and this project was a way for me to explore how my Computer Science experience and AI could support better predictions using historical data. I was really keen to focus on how different solar indices could feed into the model, and how much value each one added—so the entire approach was heavily data-driven and grounded in actual solar physics research.\n\n I built the prediction system using an LSTM (Long Short-Term Memory) neural network—ideal for time series tasks like this, because of its ability to understand sequential dependencies in data. The dataset I used came from several sources: historical F10.7 data, sunspot numbers, and other flux densities like F8cm and F15cm. I experimented with other drivers like Kp/Ap indices and X-ray flux from NOAA’s GOES satellites, but after some testing, I found they either didn’t improve the model or actually worsened performance—so I stripped it back to what worked best.\n\n To get to that conclusion, I plotted correlation matrices for each dataset to understand relationships between the features. Once I’d locked in the most useful inputs, I engineered lag features for F10.7, sunspot number, and F15cm—these really helped capture the temporal nature of the data and improved the model’s performance. I pre-processed everything using MinMaxScaler to normalise the data and built sequences of 30 days\' worth of inputs to feed into the LSTM.\n\nThe model itself was coded in Python using TensorFlow and Keras. I structured it with one LSTM layer followed by a Dropout to prevent overfitting, and then a dense output layer for the regression task. I also implemented an adaptive learning rate scheduler to fine-tune training over time and included early stopping to avoid excessive epochs. Hyperparameter tuning was based on trial and error and guided by how quickly the loss converged.\n\n After training the model, I tested it against real F10.7 data for the next 28 days that wasn’t included in the training set. I evaluated its performance using a wide range of metrics—MAE, RMSE, MAPE, R², and more. I also benchmarked it against a simple model that just predicted the average of the previous 28 days, and my LSTM clearly outperformed it. For further analysis, I conducted residual plots, histograms, and Q-Q plots to ensure the model’s predictions weren’t just statistically accurate but also stable and unbiased.\n\n Finally, I built out visualisations comparing the actual and predicted F10.7 values, and saved the trained model for future use. This project gave me a chance to apply machine learning to a real-world problem in space science, and it taught me a lot about data engineering, model evaluation, and time-series forecasting. It was one of the more technical and research-heavy pieces of code I’ve worked on, and I really enjoyed bringing it all together into something that felt like it had both scientific and practical value. Since this I have become a better coder, so there is definitely changes I could make at some point, but I\'m happy with the results I was able to obtain. '
        imageUrl2 = 'f10.7.png';
        imageUrl = 'sun.jpg';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Mars':
        title = 'ROTULUS: 3U CubSat Mission';
        description = 'For one of my major group projects in my Space Engineering course, I took the lead on designing the deployment mechanism for ROTULUS, a 3U CubeSat mission aimed at demonstrating a new drag-sail technology for satellite deorbiting in low Earth orbit. The goal of ROTULUS is to help tackle the space debris problem by accelerating satellite disposal using a novel sail deployment technique that’s both reliable and cost-effective. My main responsibility was focused on designing and refining how the sail would actually deploy in space.\n\n From the start, I knew the deployment mechanism was going to make or break the mission. So I approached it in stages—mechanical and electromechanical—and tried to balance innovation with reliability. I explored different concepts, but I was always grounding my decisions in what made sense for a university-led project: proven heritage in CubeSat missions, low complexity, minimal risk, and realistic mass and volume budgets. I used MATLAB for analysis and programming to help calculate the best approaches. I ended up using a burn wire system for the initial lid release, which is a tried-and-tested approach, and paired that with folded CFRP booms for the main sail deployment. I ran failure mode analysis (FMEA) across all options to identify critical risks early and narrow things down to what would actually work in space, not just on paper. \n\n The most challenging part was the secondary sail deployment. Unlike the primary sail, this didn’t have much heritage, so it had to be a novel design. I considered a few options, including using shape memory alloys and passive methods, but these introduced too much risk or weren’t feasible given our constraints. What I landed on was a concept that combined a mechanical motor with a pulley system to precisely unfold the secondary sail perpendicularly to the primary one. It’s still at a conceptual stage, but it laid a solid foundation for future development and gave the team a clear direction to build on.\n\n Alongside the design, I also developed a basic CAD model to integrate the deployment mechanism into the CubeSat bus. This meant rethinking the internal layout and making small structural changes to make everything fit, including adjusting the base height to allow for solar panels. I focused the CAD on components I knew were viable so future engineers could easily pick up the design and continue refining the parts that still needed work.\n\n Overall, this project gave me a chance to fully own a subsystem—from research and design through to risk analysis and integration. It pushed me to think not just about what works in theory, but what works in practice, especially when you\'re working with tight space, mass, and cost constraints. It also showed me how to balance creativity with practicality in spacecraft engineering. There’s still work to do on the secondary sail, but this project gave me a chance to dive deep into hardware design and leave behind something the team can take forward.'
        imageUrl = 'rotulus.png';
        popupImage2.style.display = 'none';
        break;
      case 'Jupiter':
        title = 'Rover Wheel Evaluation using Evolutionary Algorithms';
        description = 'For this project, I developed a system that used evolutionary algorithms to optimise the geometry of Steinmetz solids for use as planetary rover wheels. The idea was pretty simple on paper: could we use evolution-inspired code to design better-performing rover wheels, and at the same time explore whether Steinmetz solids—a kind of intersecting-cylinder shape—were even viable in this context? But turning that idea into a functioning system meant building a whole pipeline from scratch, and making sure it was accessible, reusable, and actually gave meaningful results. \n\n The system was designed with three key components: an evolutionary algorithm written in Python, a mesh generator that translated the code-based wheel designs into physical 3D meshes, and a simulation environment that tested how well each design performed on a terrain track. I kept the whole thing simple to run—just one terminal command from start to finish—so that other developers (or even non-programmers) could use and adapt the code without needing to dive into the backend. The evolutionary algorithm iterated over generations, tweaking variables like the number of intersecting cylinders, the radius and width of the wheel, and the number, size, and placement of grousers (those little tread ridges on a wheel). All of that was wrapped in a framework that prioritised ease of use, low computational cost, and adaptability.\n\n From the start, I followed an Agile development process, constantly refining the algorithm based on each run’s results. I used DEAP and Trimesh for the mesh generation, which gave me loads of geometric control while staying compatible with the rest of the system. For simulations, I went with CoppeliaSim, mostly because of its Remote API integration with Python—it meant I could automate the whole process from design to performance evaluation. \n\n The evolutionary algorithm itself went through ten major iterations. I experimented with everything from population size to mutation methods and crossover strategies, using both Gaussian and uniform mutations depending on whether the variable was continuous or discrete. A tournament selection mechanism kept the fittest designs evolving, and the termination condition was set to stop only once 75% of the population had converged on a single solution, avoiding early convergence and saving computational time. \n\n The simulation side of the system was just as important. I used ESA’s ExoMy rover as the base, and set it to drive over a custom-designed terrain featuring rocks, craters, and a 15-degree incline ramp. The goal was to see how the optimised wheels compared to the default ones in terms of traversal time, across different surface types. By the third run of the algorithm, the new wheels were outperforming the baseline, and by the final run, I had a design that improved overall traversal time by 22%. That final wheel used a bicylinder shape with four well-placed grousers, and proved faster not only across flat terrain but also on rough surfaces and steep inclines. I also validated everything across multiple physics engines in CoppeliaSim—Bullet 2.78, Bullet 2.83, and ODE—and the optimised wheel consistently outperformed the standard across all of them. \n\n Ultimately, the project showed that not only can Steinmetz solids work as rover wheels, but evolutionary algorithms can reliably optimise them too. There\'s definitely room to go deeper—trying different base shapes, adding in real-world manufacturing constraints, or integrating this into a physical rover build—but what I built serves as a solid proof of concept.'
        imageUrl = 'stein.png';
        imageUrl2 = 'stein2.png';
        popupImage2.src = imageUrl2;
        popupImage2.style.display = 'block';
        break;
      case 'Saturn':
        title = 'Trajectory Data Converter';
        description = 'For my trajectory converter project, I aimed to build a robust tool that simplifies the complex task of converting spacecraft trajectory data between various formats. The heart of the project was NASA’s SPICE toolkit, which I used through its C-language API. This powerful library provided all the essential functions for handling spacecraft geometry, position, and time conversions with precision, making it the ideal foundation for reliable trajectory transformations. The tool has the ability to convert trajectories starting from NAIF IDs into Orbit Ephemeris Message files, and then to other formats as needed.\n\n By parsing trajectory data files, the system was able to preserve flexibility in interpolation methods and frame references. The solution integrates time conversion, frame transformation, and state vector handling, enabling precise and adaptable trajectory generation for simulation or mission analysis workflows. To make the tool even more dynamic, I integrated NASA’s Horizons API. This lets the converter fetch precise, up-to-date ephemeris data directly from Horizons based on user-supplied NAIF IDs and time intervals, removing the need for local files. This capability makes the tool highly adaptable for a wide range of mission scenarios and simplifies access to trusted NASA trajectory data. \n\n The backend was built with Python and FastAPI, providing a clean, efficient server to handle file uploads and conversion requests. Under the hood, the heavy lifting is done by a C-based conversion script that directly calls the SPICE toolkit functions, ensuring both high performance and accuracy. While the frontend is simple, it effectively guides users through the conversion process and returns the converted data quickly.\n\n This work allowed me to merge low-level systems programming with space data standards, optimising pipeline efficiency for space mission support. Also, this project was a deep dive into the intricacies of spacecraft trajectory data and how to bridge powerful scientific tools like SPICE with user-friendly software. It taught me not only the technical side of space mission data formats but also how to design systems that make complex operations accessible. I’m proud of how the converter combines precision, flexibility, and ease of use, and I look forward to extending its capabilities further.'
        imageUrl = 'trajectory.png';
        popupImage2.style.display = 'none';
        break;
      case 'Uranus':
        title = 'Galax-C';
        description = 'Galax-C is my latest project and still very much a work in progress. I’m building a programming language based on C, specifically designed for space engineering applications. The idea came from seeing how many space professionals rely on complicated proprietary tools or have to write long, complex code just to perform standard calculations. I wanted to create something that simplifies that process, offering built-in functions for common space-related math so users can focus on the problem, not the programming overhead. \n\nThe language itself is designed with simplicity in mind. I’m aiming for a clean, straightforward syntax that makes it easier to write and understand code, even for engineers who aren’t professional programmers. This means complex calculations, like orbital mechanics or astrophysics formulas, can be written quickly and clearly. My hope is that Galax-C will speed up prototyping and testing of ideas by providing a dedicated tool that’s both powerful and approachable.\n\n Although Galax-C currently has the least amount of work done compared to my other projects, I’m excited about its potential. I want it to become a useful resource in the space community, reducing reliance on expensive software and bridging the gap between engineering concepts and software development. It’s a long-term effort, but I’m committed to building a language that can grow alongside the evolving needs of space professionals.'
        imageUrl = 'c.jpg';
        popupImage2.style.display = 'none';
        //popupImage2.src = imageUrl;
        //popupImage2.style.display = 'block';
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


document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const popup = document.getElementById('info-popup');
    if (popup && popup.style.display === 'block') {
      popup.style.display = 'none';
    }
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

    
    p.mesh.rotation.y += p.mesh.userData.rotationSpeed || 0.01;

    if (p.mesh.userData.cloudMesh) {
      p.mesh.userData.cloudMesh.rotation.y += 0.005;
    }
  });

  const pos = starGeo.attributes.position.array;
  const minDistance = minRadius; 
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
  popup.querySelector('p').innerText = 'My name is Abdullah and welcome to my small personal Solar System I made using Three.js to show off some of my personal projects. Drag to look around using the mouse and click on the the star in the centre to learn about me or the planets to see my projects!\n \n WARNING - This is not a replica of our Solar System and breaks many laws of physics!';
  popupImage.style.display = 'none'; 
  popupImage2.style.display = 'none';     
  downloadCvBtn.style.display = 'none';  
  popup.style.display = 'block';
});


popup.querySelector('h2').innerText = 'Welcome Traveller!';
  popup.querySelector('p').innerText = 'My name is Abdullah and welcome to my small personal Solar System I made using Three.js to show off some of my personal projects. Drag to look around using the mouse and click on the the star in the centre to learn about me or the planets to see my projects! \n \nWARNING - This is not a replica of our Solar System and breaks many laws of physics!';
  popup.style.display = 'block';

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
