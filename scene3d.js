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

    const ambient = new THREE.HemisphereLight(0xd8d0ff, 0x071112, 1.45);
    world.add(ambient);
    const keyLight = new THREE.PointLight(0x75d8cf, 3.4, 16);
    keyLight.position.set(0, 0, 1.8);
    world.add(keyLight);
    const rimLight = new THREE.PointLight(0xc07cff, 1.9, 12);
    rimLight.position.set(-3.2, 1.9, 0.3);
    world.add(rimLight);

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

    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xd8fff7, transparent: true, opacity: 0.66, wireframe: true });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.53, 1), coreMaterial);
    core.position.z = 0.42;
    portal.add(core);
    const coreHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0x79f3e6, transparent: true, opacity: 0.16, depthWrite: false })
    );
    coreHalo.position.z = 0.38;
    portal.add(coreHalo);

    const shardGeometry = new THREE.OctahedronGeometry(0.12, 0);
    const shardMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xff8b73, transparent: true, opacity: 0.9 }),
      new THREE.MeshBasicMaterial({ color: 0x78e5d2, transparent: true, opacity: 0.84 }),
      new THREE.MeshBasicMaterial({ color: 0xa997ff, transparent: true, opacity: 0.86 }),
      new THREE.MeshBasicMaterial({ color: 0xffd26f, transparent: true, opacity: 0.9 }),
    ];
    const shards = Array.from({ length: 12 }, (_, index) => {
      const shard = new THREE.Mesh(shardGeometry, shardMaterials[index % shardMaterials.length]);
      const angle = (index / 12) * Math.PI * 2;
      shard.position.set(Math.cos(angle) * (2.03 + (index % 2) * 0.13), Math.sin(angle) * 1.64, (index % 3) * 0.16 - 0.15);
      shard.scale.setScalar(0.68 + (index % 4) * 0.17);
      world.add(shard);
      return { mesh: shard, angle, offset: index * 0.62, radius: 2.03 + (index % 2) * 0.13 };
    });

    const particleCount = 210;
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

    const templateAccents = {
      space: 0x93aaff, mansion: 0xef9bd0, jungle: 0xb5ed55, lab: 0x56e3da,
      underwater: 0x65e9e3, museum: 0xffcd76, arctic: 0x9fe5ff, festival: 0xf17ce2, generic: 0xb49aff,
    };
    const templateProps = Object.create(null);
    const propMaterial = (color, opacity = 0.8) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, side: THREE.DoubleSide });
    const addProp = (group, geometry, material, x, y, z = -0.35, scale = [1, 1, 1], rotation = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      group.add(mesh);
      return mesh;
    };
    for (const templateId of Object.keys(templateAccents)) {
      const group = new THREE.Group();
      group.visible = templateId === "underwater";
      world.add(group);
      templateProps[templateId] = group;
    }
    const spaceProps = templateProps.space;
    addProp(spaceProps, new THREE.SphereGeometry(0.56, 24, 16), propMaterial(0x647aff, 0.64), -3.25, 1.25, -0.65);
    const planetRing = addProp(spaceProps, new THREE.TorusGeometry(0.75, 0.025, 6, 48), propMaterial(0xa6c6ff, 0.78), -3.25, 1.25, -0.56, [1, 0.55, 1], [0.65, 0.2, -0.3]);
    addProp(spaceProps, new THREE.BoxGeometry(0.42, 0.22, 0.12), propMaterial(0xe1c2ff, 0.8), 3.35, -1.12, -0.4, [1, 1, 1], [0, 0, 0.35]);
    addProp(spaceProps, new THREE.BoxGeometry(0.85, 0.055, 0.12), propMaterial(0x7cb5ff, 0.62), 3.35, -1.12, -0.45);

    const mansionProps = templateProps.mansion;
    for (const x of [-3.35, 3.35]) {
      addProp(mansionProps, new THREE.CylinderGeometry(0.25, 0.4, 1.8, 8), propMaterial(0x745172, 0.72), x, -0.95, -0.5);
      addProp(mansionProps, new THREE.ConeGeometry(0.4, 0.8, 8), propMaterial(0xd18cb8, 0.82), x, 0.35, -0.48);
      addProp(mansionProps, new THREE.SphereGeometry(0.12, 12, 8), propMaterial(0xffc18b, 0.95), x, -0.02, -0.2);
    }

    const jungleProps = templateProps.jungle;
    for (let index = 0; index < 8; index += 1) {
      const side = index % 2 ? 1 : -1;
      const y = -1.65 + Math.floor(index / 2) * 0.82;
      addProp(jungleProps, new THREE.SphereGeometry(0.3, 12, 8), propMaterial(index % 3 ? 0x76bd58 : 0xb2df67, 0.76), side * (3.12 + (index % 3) * 0.16), y, -0.35, [0.58, 1.65, 0.34], [0, 0, side * (0.45 + (index % 2) * 0.22)]);
    }

    const labProps = templateProps.lab;
    for (let index = 0; index < 3; index += 1) {
      const x = -3.25 + index * 0.28;
      addProp(labProps, new THREE.CylinderGeometry(0.13, 0.16, 0.86, 12), propMaterial([0x5fe2db, 0x87baff, 0xb494ff][index], 0.54), x, -0.95 + (index % 2) * 0.28, -0.3);
      addProp(labProps, new THREE.SphereGeometry(0.14, 12, 8), propMaterial([0x9bfff0, 0x9dccff, 0xe4b7ff][index], 0.85), x, -0.5 + (index % 2) * 0.28, -0.28, [1, 0.72, 1]);
    }

    const underwaterProps = templateProps.underwater;
    for (const [x, height, color] of [[-3.15, 1.1, 0x63dfd2], [-3.55, 0.72, 0xf184d6], [3.2, 0.94, 0x72c6f2], [3.55, 1.2, 0xb6e978]]) {
      addProp(underwaterProps, new THREE.CylinderGeometry(0.035, 0.12, height, 8), propMaterial(color, 0.8), x, -1.55 + height / 2, -0.35, [1, 1, 1], [0, 0, x < 0 ? -0.22 : 0.22]);
      addProp(underwaterProps, new THREE.SphereGeometry(0.14, 10, 8), propMaterial(color, 0.8), x + (x < 0 ? -0.1 : 0.1), -1.55 + height, -0.32, [1.35, 0.75, 0.8]);
    }

    const museumProps = templateProps.museum;
    for (const x of [-3.34, 3.34]) {
      addProp(museumProps, new THREE.BoxGeometry(0.76, 1.2, 0.08), propMaterial(0xc99d61, 0.76), x, 0.2, -0.45);
      addProp(museumProps, new THREE.BoxGeometry(0.55, 0.88, 0.04), propMaterial(0x493444, 0.86), x, 0.2, -0.38);
      addProp(museumProps, new THREE.OctahedronGeometry(0.22, 0), propMaterial(0xffd882, 0.95), x, 0.2, -0.28, [0.75, 1.2, 0.75]);
    }

    const arcticProps = templateProps.arctic;
    for (const [x, height] of [[-3.35, 1.45], [-2.95, 0.92], [3.35, 1.3], [2.98, 0.82]]) {
      addProp(arcticProps, new THREE.ConeGeometry(0.34, height, 5), propMaterial(0x9ceaff, 0.57), x, -1.55 + height / 2, -0.4, [0.7, 1, 0.55], [0.02, 0, x < 0 ? -0.17 : 0.17]);
    }

    const festivalProps = templateProps.festival;
    for (const [x, color] of [[-3.35, 0xff6ac8], [3.35, 0x63f0e0]]) {
      addProp(festivalProps, new THREE.ConeGeometry(0.78, 3.1, 16, 1, true), propMaterial(color, 0.1), x, 0.45, -0.5, [0.5, 1, 1], [0, 0, x < 0 ? -0.33 : 0.33]);
      addProp(festivalProps, new THREE.SphereGeometry(0.11, 12, 8), propMaterial(color, 0.98), x, 1.82, -0.35);
    }

    const genericProps = templateProps.generic;
    for (let index = 0; index < 6; index += 1) {
      addProp(genericProps, new THREE.OctahedronGeometry(0.16 + (index % 2) * 0.08, 0), propMaterial(index % 2 ? 0xa88dff : 0x69e8d8, 0.76), index % 2 ? 3.2 : -3.2, -1.5 + index * 0.57, -0.35, [0.8, 1.4, 0.7], [0, 0, index * 0.2]);
    }

    const environments = {
      underwater: { color: 0x37f0df, accent: 0x8be8ff, secondary: 0x9383ff, fog: 0x082426 },
      space: { color: 0x8b91ff, accent: 0xf39cff, secondary: 0x6ce9ef, fog: 0x11152b },
      haunted: { color: 0xf276c5, accent: 0xffae85, secondary: 0x9e8aff, fog: 0x241627 },
      jungle: { color: 0xb5ed55, accent: 0xffcf6e, secondary: 0x50e3bd, fog: 0x12271c },
    };
    const presets = { neon: 0xff4fb8, ambar: 0xffb84d, bruma: 0xbabfff };
    let environment = "underwater";
    let templateId = "underwater";
    let preset = "bruma";
    let motion = "glow";
    let opening = false;
    let pulseUntil = 0;
    let reactionUntil = 0;
    let reactionMood = "playful";

    function applyPalette() {
      const palette = environments[environment] || environments.underwater;
      const color = presets[preset] || palette.color;
      ringMaterials.forEach((material) => material.color.setHex(color));
      particleMaterial.color.setHex(color);
      keyLight.color.setHex(color);
      rimLight.color.setHex(palette.secondary);
      coreMaterial.color.setHex(templateAccents[templateId] || palette.accent);
      coreHalo.material.color.setHex(color);
      shardMaterials.forEach((material, index) => material.color.setHex(index % 2 ? (templateAccents[templateId] || palette.accent) : index % 3 ? color : palette.secondary));
      const fog = palette.fog;
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
    const currentTemplate = [...sceneElement.classList].find((name) => name.startsWith("theme-"));
    if (currentTemplate && templateProps[currentTemplate.slice("theme-".length)]) templateId = currentTemplate.slice("theme-".length);
    Object.entries(templateProps).forEach(([id, group]) => { group.visible = id === templateId; });
    applyPalette();

    window.addEventListener("nexo:environment", (event) => {
      environment = environments[event.detail?.environment] ? event.detail.environment : "underwater";
      applyPalette();
    });
    window.addEventListener("nexo:preset", (event) => {
      if (presets[event.detail?.preset]) preset = event.detail.preset;
      applyPalette();
    });
    window.addEventListener("nexo:design", (event) => {
      const requestedPreset = event.detail?.preset;
      const requestedMotion = event.detail?.motion;
      if (presets[requestedPreset]) preset = requestedPreset;
      if (["glow", "aurora", "pulse", "crystal", "rain"].includes(requestedMotion)) motion = requestedMotion;
      applyPalette();
    });
    window.addEventListener("nexo:template", (event) => {
      const id = event.detail?.templateId;
      if (!templateProps[id]) return;
      templateId = id;
      Object.entries(templateProps).forEach(([key, group]) => { group.visible = key === templateId; });
      applyPalette();
    });
    window.addEventListener("nexo:clue", () => { pulseUntil = performance.now() + 1200; });
    window.addEventListener("nexo:reaction", (event) => {
      reactionMood = ["curious", "worried", "excited", "style", "playful"].includes(event.detail?.mood) ? event.detail.mood : "playful";
      reactionUntil = performance.now() + 1500;
    });
    window.addEventListener("nexo:open", () => { opening = true; });
    window.addEventListener("nexo:reset", () => { opening = false; });

    const clock = new THREE.Clock();
    function render() {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const reactionProgress = THREE.MathUtils.clamp(1 - (reactionUntil - performance.now()) / 1500, 0, 1);
      const reactionStrength = reactionUntil > performance.now() ? Math.sin(reactionProgress * Math.PI) : 0;
      const reactionTint = { curious: 0xc8a6ff, worried: 0x78bfff, excited: 0xd5ff76, style: 0xff79d7, playful: 0x8debd5 }[reactionMood];
      keyLight.intensity = 3.4 + reactionStrength * (reactionMood === "excited" ? 2.2 : 1.15);
      rimLight.intensity = 1.9 + reactionStrength * 1.1;
      rimLight.color.setHex(reactionStrength > 0.02 ? reactionTint : (environments[environment] || environments.underwater).secondary);
      rings[0].rotation.z = Math.sin(elapsed * 0.18) * 0.08;
      rings[1].rotation.z += delta * 0.12;
      rings[2].rotation.y = Math.sin(elapsed * 0.24) * 0.3;
      planetRing.rotation.z += delta * 0.09;
      core.rotation.x += delta * 0.2;
      core.rotation.y -= delta * 0.32;
      const corePulse = 0.88 + (Math.sin(elapsed * 1.5) + 1) * 0.12;
      const designPulse = (motion === "pulse" ? 1 + (Math.sin(elapsed * 3.2) + 1) * 0.025 : 1) * (1 + reactionStrength * 0.055);
      core.scale.setScalar(corePulse * designPulse);
      coreHalo.material.opacity = 0.12 + (Math.sin(elapsed * 1.4) + 1) * 0.05;
      if (motion === "aurora") {
        const hue = (elapsed * 0.035) % 1;
        keyLight.color.setHSL(hue, 0.78, 0.62);
        ringMaterials[0].color.setHSL((hue + 0.1) % 1, 0.82, 0.66);
        coreHalo.material.color.setHSL((hue + 0.28) % 1, 0.76, 0.69);
      }
      shards.forEach(({ mesh, angle, offset, radius }) => {
        const orbit = angle + elapsed * ((motion === "crystal" ? 0.24 : 0.12) + reactionStrength * 0.16);
        mesh.position.x = Math.cos(orbit) * radius;
        mesh.position.y = Math.sin(orbit * 1.3 + offset) * 1.67;
        mesh.rotation.x += delta * (0.22 + offset * 0.01);
        mesh.rotation.y -= delta * 0.3;
        mesh.material.opacity = 0.56 + (Math.sin(elapsed * 1.7 + offset) + 1) * 0.18;
      });
      const targetX = opening ? -0.72 : 0;
      const targetY = opening ? -0.55 : 0;
      portal.position.x = THREE.MathUtils.damp(portal.position.x, targetX, 2.2, delta);
      portal.rotation.y = THREE.MathUtils.damp(portal.rotation.y, targetY, 2.2, delta);
      const cluePulse = performance.now() < pulseUntil ? 1.08 : 1;
      const targetScale = opening ? 1.08 : cluePulse * designPulse;
      const scale = THREE.MathUtils.damp(portal.scale.x, targetScale, 3, delta);
      portal.scale.setScalar(scale);

      const particlePositions = particleGeometry.attributes.position.array;
      for (let index = 0; index < particleCount; index += 1) {
        const y = index * 3 + 1;
        const x = index * 3;
        particlePositions[y] += drift[index] * delta * (motion === "rain" ? -3.2 : 1);
        if (reactionStrength > 0.01) particlePositions[x] += Math.sin(elapsed * 1.8 + index) * delta * reactionStrength * 0.22;
        if (particlePositions[y] > 3.7) particlePositions[y] = -3.7;
        if (particlePositions[y] < -3.7) particlePositions[y] = 3.7;
        if (particlePositions[x] > 6.5) particlePositions[x] = -6.5;
        if (particlePositions[x] < -6.5) particlePositions[x] = 6.5;
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
