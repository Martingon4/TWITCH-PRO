import * as THREE from "/three.module.js";

const canvas = document.getElementById("roomThreeCanvas");
const host = canvas?.parentElement;
const sceneElement = document.getElementById("scene");

if (canvas && host && sceneElement) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);

    const world = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.HemisphereLight(0xb8e7d7, 0x071112, 1.1);
    world.add(ambient);
    const keyLight = new THREE.PointLight(0x75d8cf, 2.2, 13);
    keyLight.position.set(0, 0, 1.8);
    world.add(keyLight);

    const portal = new THREE.Group();
    world.add(portal);
    const ringMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x7be7d5, transparent: true, opacity: 0.78, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0xb6e7d5, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ color: 0x7be7d5, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    ];
    const rings = [
      new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.018, 8, 144), ringMaterials[0]),
      new THREE.Mesh(new THREE.TorusGeometry(1.49, 0.009, 6, 144), ringMaterials[1]),
      new THREE.Mesh(new THREE.TorusGeometry(1.84, 0.008, 6, 144), ringMaterials[2]),
    ];
    rings[0].position.z = 0.35;
    rings[1].position.z = 0.28;
    rings[1].rotation.set(0.12, 0.18, 0);
    rings[2].position.z = 0.22;
    rings[2].rotation.set(-0.22, -0.12, 0.18);
    portal.add(...rings);

    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const drift = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 13;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 6.7;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 3.5 - 0.4;
      drift[index] = 0.08 + Math.random() * 0.22;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0x9ce7d7, size: 0.045, transparent: true, opacity: 0.56, depthWrite: false });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    world.add(particles);

    const environments = {
      underwater: { color: 0x7be7d5, fog: 0x0b2224 },
      space: { color: 0x91baff, fog: 0x11182c },
      haunted: { color: 0xe0a1e8, fog: 0x24182a },
      jungle: { color: 0xbbe586, fog: 0x14251d },
    };
    const presets = { neon: 0x64f4e3, ambar: 0xffc56d, bruma: 0xbac6f0 };
    let environment = "underwater";
    let preset = "bruma";
    let opening = false;
    let pulseUntil = 0;

    function applyPalette() {
      const color = presets[preset] || environments[environment]?.color || environments.underwater.color;
      ringMaterials.forEach((material) => material.color.setHex(color));
      particleMaterial.color.setHex(color);
      keyLight.color.setHex(color);
      const fog = environments[environment]?.fog || environments.underwater.fog;
      world.fog = new THREE.FogExp2(fog, 0.018);
    }

    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    applyPalette();
    sceneElement.classList.add("three-ready");

    const currentEnvironment = [...sceneElement.classList].find((name) => name.startsWith("environment-"));
    if (currentEnvironment && environments[currentEnvironment.slice("environment-".length)]) {
      environment = currentEnvironment.slice("environment-".length);
    }
    const currentPreset = [...sceneElement.classList].find((name) => name.startsWith("preset-"));
    if (currentPreset) preset = currentPreset.slice("preset-".length);
    applyPalette();

    window.addEventListener("nexo:environment", (event) => {
      environment = environments[event.detail?.environment] ? event.detail.environment : "underwater";
      applyPalette();
    });
    window.addEventListener("nexo:preset", (event) => {
      if (presets[event.detail?.preset]) preset = event.detail.preset;
      applyPalette();
    });
    window.addEventListener("nexo:clue", () => { pulseUntil = performance.now() + 1200; });
    window.addEventListener("nexo:open", () => { opening = true; });
    window.addEventListener("nexo:reset", () => { opening = false; });

    const clock = new THREE.Clock();
    function render() {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      rings[0].rotation.z = Math.sin(elapsed * 0.18) * 0.08;
      rings[1].rotation.z += delta * 0.12;
      rings[2].rotation.y = Math.sin(elapsed * 0.24) * 0.3;
      const targetX = opening ? -0.72 : 0;
      const targetY = opening ? -0.55 : 0;
      portal.position.x = THREE.MathUtils.damp(portal.position.x, targetX, 2.2, delta);
      portal.rotation.y = THREE.MathUtils.damp(portal.rotation.y, targetY, 2.2, delta);
      const pulse = performance.now() < pulseUntil ? 1.08 : 1;
      const targetScale = opening ? 1.08 : pulse;
      const scale = THREE.MathUtils.damp(portal.scale.x, targetScale, 3, delta);
      portal.scale.setScalar(scale);

      const particlePositions = particleGeometry.attributes.position.array;
      for (let index = 0; index < particleCount; index += 1) {
        const y = index * 3 + 1;
        particlePositions[y] += drift[index] * delta;
        if (particlePositions[y] > 3.7) particlePositions[y] = -3.7;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      renderer.render(world, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  } catch (error) {
    sceneElement.classList.add("three-fallback");
    console.warn("Three.js no está disponible; se mantiene la escena CSS.", error);
  }
}
