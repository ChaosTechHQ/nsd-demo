// ChaosTech NSD 3D Radar v6.0 - Manual Camera Control (No OrbitControls needed)
let scene3d, camera3d, renderer3d, droneMeshes3d = [];
let radarVisible = false;
let is3DMode = false;

// Manual camera control variables
let cameraRotation = { x: 0.5, y: 0.5 };
let cameraDistance = 250;
let isDragging = false;
let mouseStart = { x: 0, y: 0 };

function toggleRadarView() {
  is3DMode = !is3DMode;
  const btn = document.getElementById('toggleView');
  if (!btn) return;

  const canvas = document.getElementById('mainRadar');
  
  if (is3DMode) {
    btn.textContent = '🗺️ 2D View';
    btn.style.background = '#ff4444';
    init3DRadar();
    canvas.style.display = 'none';
  } else {
    btn.textContent = '🛰️ 3D View';
    btn.style.background = '#00ff88';
    canvas.style.display = 'block';
    if (renderer3d) {
      renderer3d.dispose();
      const container = document.getElementById('radar3dContainer');
      if (container && container.parentElement) {
        container.parentElement.removeChild(container);
      }
      renderer3d = null;
    }
    radarVisible = false;
  }
}

function init3DRadar() {
  const canvas = document.getElementById('mainRadar');
  const parent = canvas.parentElement;
  
  let container = document.getElementById('radar3dContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'radar3dContainer';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '1';
    parent.appendChild(container);
  } else {
    container.innerHTML = '';
  }

  // Check if THREE exists
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded. Check CDN link in index.html');
    alert('3D View requires Three.js. Check browser console.');
    return;
  }

  // Scene
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x000011);

  // Camera
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera3d = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000);
  updateCameraPosition();

  // Renderer
  renderer3d = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer3d.setSize(w, h);
  renderer3d.setPixelRatio(window.devicePixelRatio);
  renderer3d.shadowMap.enabled = true;
  container.appendChild(renderer3d.domElement);

  // ⭐ MANUAL CAMERA CONTROL (No OrbitControls needed)
  renderer3d.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    mouseStart = { x: e.clientX, y: e.clientY };
  });

  renderer3d.domElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - mouseStart.x;
    const dy = e.clientY - mouseStart.y;
    
    cameraRotation.y += dx * 0.005;
    cameraRotation.x -= dy * 0.005;
    
    // Clamp x rotation to prevent flipping
    cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
    
    mouseStart = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  });

  renderer3d.domElement.addEventListener('mouseup', () => {
    isDragging = false;
  });

  renderer3d.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    cameraDistance += e.deltaY * 0.5;
    cameraDistance = Math.max(50, Math.min(600, cameraDistance));
    updateCameraPosition();
  }, { passive: false });

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x00ff88, 0.5);
  scene3d.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 150, 100);
  directionalLight.castShadow = true;
  scene3d.add(directionalLight);

  // Grid (200x200 field)
  const gridHelper = new THREE.GridHelper(200, 20, 0x00ff88, 0x004444);
  gridHelper.position.y = 0.01;
  scene3d.add(gridHelper);

  // Base marker at center
  const baseGeometry = new THREE.CylinderGeometry(5, 8, 6, 16);
  const baseMaterial = new THREE.MeshPhongMaterial({
    color: 0x0088ff,
    emissive: 0x004488,
    emissiveIntensity: 0.3
  });
  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.position.set(0, 3, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  scene3d.add(baseMesh);

  // Boundary walls
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    emissive: 0x003322,
    emissiveIntensity: 0.2
  });

  const northWall = new THREE.Mesh(new THREE.BoxGeometry(200, 2, 0.5), wallMaterial);
  northWall.position.set(0, 1, -100);
  scene3d.add(northWall);

  const southWall = new THREE.Mesh(new THREE.BoxGeometry(200, 2, 0.5), wallMaterial);
  southWall.position.set(0, 1, 100);
  scene3d.add(southWall);

  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 200), wallMaterial);
  eastWall.position.set(100, 1, 0);
  scene3d.add(eastWall);

  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 200), wallMaterial);
  westWall.position.set(-100, 1, 0);
  scene3d.add(westWall);

  // Animation loop
  radarVisible = true;
  function animate3D() {
    requestAnimationFrame(animate3D);
    if (!radarVisible) return;
    update3Drones();
    renderer3d.render(scene3d, camera3d);
  }
  animate3D();

  // Handle window resize
  window.addEventListener('resize', () => {
    if (!renderer3d || !is3DMode) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera3d.aspect = w / h;
    camera3d.updateProjectionMatrix();
    renderer3d.setSize(w, h);
  });
}

function updateCameraPosition() {
  if (!camera3d) return;
  const x = cameraDistance * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
  const y = cameraDistance * Math.sin(cameraRotation.x) + 50;
  const z = cameraDistance * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
  camera3d.position.set(x, y, z);
  camera3d.lookAt(0, 0, 0);
}

function update3Drones() {
  if (!scene3d) return;

  // Remove old meshes
  droneMeshes3d.forEach(mesh => {
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) mesh.material.dispose();
    scene3d.remove(mesh);
  });
  droneMeshes3d = [];

  // ===== INFRASTRUCTURE MARKERS =====
  if (typeof infraMarkers !== 'undefined') {
    infraMarkers.forEach(marker => {
      const x = (marker.x - 50) * 2;
      const z = (marker.y - 50) * 2;
      let geometry, material, mesh;
      let color = 0x00ff00;

      if (marker.type === 'critical') {
        color = 0xffff00;
        geometry = new THREE.BoxGeometry(8, 8, 8);
        material = new THREE.MeshPhongMaterial({ color, emissive: 0x884400, emissiveIntensity: 0.3 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 4, z);
      } else if (marker.type === 'mobile') {
        color = 0x00ffff;
        geometry = new THREE.ConeGeometry(5, 8, 4);
        material = new THREE.MeshPhongMaterial({ color, emissive: 0x004488, emissiveIntensity: 0.3 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 4, z);
      } else if (marker.type === 'land') {
        color = 0x00ff00;
        geometry = new THREE.BoxGeometry(6, 6, 6);
        material = new THREE.MeshPhongMaterial({ color, emissive: 0x003300, emissiveIntensity: 0.3 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 3, z);
      } else if (marker.type === 'sea') {
        color = 0x00aaff;
        geometry = new THREE.SphereGeometry(5, 16, 12);
        material = new THREE.MeshPhongMaterial({ color, emissive: 0x002244, emissiveIntensity: 0.3 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 5, z);
      }

      if (mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene3d.add(mesh);
        droneMeshes3d.push(mesh);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        context.fillStyle = '#000';
        context.fillRect(0, 0, 128, 64);
        context.fillStyle = '#' + color.toString(16).padStart(6, '0');
        context.font = 'bold 20px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(marker.label, 64, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, 12, z);
        sprite.scale.set(8, 4, 1);
        scene3d.add(sprite);
        droneMeshes3d.push(sprite);
      }
    });
  }

  // ===== DRONES =====
  if (typeof drones === 'undefined') return;

  drones.forEach((drone, index) => {
    if (drone.mode === 'neutralized') return;

    const status = decideDroneStatus(drone);

    let color = 0x00ff00;
    if (drone.side === 'ally') color = 0x00ccff;
    else if (drone.mode === 'jammed') color = 0x0088ff;
    else if (status.score >= 81) color = 0xff0000;
    else if (status.score >= 61) color = 0xff8800;
    else if (status.score >= 31) color = 0xffff00;

    const geometry = new THREE.SphereGeometry(3, 16, 12);
    const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const x = (drone.x - 50) * 2;
    const z = (drone.y - 50) * 2;
    const y = 5 + Math.abs(Math.sin(Date.now() * 0.001 + index) * 2);
    sphere.position.set(x, y, z);

    const velocityGeom = new THREE.BufferGeometry();
    const velocityMat = new THREE.LineBasicMaterial({ color });
    const headingRad = (drone.heading * Math.PI) / 180;
    const velocityPoints = [
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x + Math.cos(headingRad) * 15, y, z + Math.sin(headingRad) * 15)
    ];
    velocityGeom.setFromPoints(velocityPoints);
    const velocityLine = new THREE.Line(velocityGeom, velocityMat);

    scene3d.add(sphere);
    scene3d.add(velocityLine);
    droneMeshes3d.push(sphere, velocityLine);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleView');
  if (toggleBtn) {
    toggleBtn.onclick = toggleRadarView;
  }
});
