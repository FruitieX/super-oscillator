import * as THREE from "three";
import WindowResize from "three-window-resize";
import * as ThreeExtensions from "./three";
import Synthesizer from "./synthesizer";

let renderer, camera, scene, light, title, description, synthesizer;

init().then(render);

function init() {
  return Synthesizer.init().then(() => {
    ThreeExtensions.install();

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector(".app").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, Number.MAX_SAFE_INTEGER);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1300;

    WindowResize(renderer, camera); // Automatically handle window resize events.

    scene = new THREE.Scene();

    light = new THREE.SpotLight("#aaaaaa");
    light.position.x = 0;
    light.position.y = 1000;
    light.position.z = 0;
    scene.add(light);

    title = new THREE.Mesh();
    title.material = new THREE.MeshToonMaterial({ color: "#3a3a3a", transparent: true, opacity: 0 });
    title.geometry = new THREE.TextGeometry("Super Oscillator", { font: Synthesizer.font, size: window.innerWidth * 0.045, height: 1 });
    title.bbox.centerX = 0;
    title.bbox.centerY = 200;
    title.bbox.centerZ = title.userData.initialZ = -600;
    title.position.x -= 18; // FIXME: Text doesn't center properly; a bug in FontLoader?
    scene.add(title);

    description = new THREE.Mesh();
    description.material = new THREE.MeshToonMaterial({ color: "#3a3a3a", transparent: true, opacity: 0 });
    description.geometry = new THREE.TextGeometry("An interactive, 3D music synthesizer for the Web!", { font: Synthesizer.font, size: window.innerWidth * 0.016, height: 1 });
    description.bbox.centerX = 0;
    description.bbox.centerY = -220;
    description.bbox.centerZ = description.userData.initialZ = -600;
    description.position.x -= 3; // FIXME: Text doesn't center properly; a bug in FontLoader?
    scene.add(description);

    synthesizer = new Synthesizer({
      width: window.innerWidth * 0.8,
      height: window.innerWidth * 0.07,
      depth: window.innerWidth * 0.15
    });
    synthesizer.bbox.centerX = 0;
    synthesizer.bbox.centerY = 600;
    synthesizer.bbox.centerZ = 0;
    synthesizer.addMouseListener(renderer, camera);
    scene.add(synthesizer);
  });
}

function render() {
  // Queue up the next render.
  requestAnimationFrame(render);

  if (synthesizer.bbox.centerY > 0) {
    // Move synthesizer until it reaches its resting position.
    synthesizer.bbox.centerY -= 4;
  } else if (synthesizer.rotation.x < Math.PI / 4) {
    // Rotate synthesizer until it reaches its resting position.
    synthesizer.rotation.x += Math.PI / 300;
  } else if (title.bbox.centerZ < 0) {
      // Move title until it reaches its resting position.
      title.bbox.centerZ += 4;

      // Fade-in title.
      title.material.opacity = 1 - Math.abs(title.bbox.centerZ / title.userData.initialZ);
  } else if (description.bbox.centerZ < 0) {
    // Move description until it reaches its resting position.
    description.bbox.centerZ += 4;

    // Fade-in description.
    description.material.opacity = 1 - Math.abs(description.bbox.centerZ / description.userData.initialZ);
  }

  // Render the scene!
  renderer.render(scene, camera);
}
