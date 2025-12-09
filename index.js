import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r145/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/jsm/geometries/TextGeometry.js';

// ==================== SCENE SETUP ====================
// Create the main scene with shadow mapping and anti-aliasing
const scene = new THREE.Scene();

// ==================== RENDERER SETUP ====================
// Create renderer with shadows and anti-aliasing enabled
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

// ==================== CAMERAS ====================
// Third Person Camera - for orbital view around the scene
const thirdPersonCamera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    1000 // Far plane
);
thirdPersonCamera.position.set(6, 3, 5);

// First Person Camera - attached to Dark Warrior
const firstPersonCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
firstPersonCamera.position.set(0, 1.8, 0);

// Set initial active camera
let activeCamera = thirdPersonCamera;

// Make third person camera focus on origin (0, 0, 0)
thirdPersonCamera.lookAt(0, 0, 0);

// OrbitControls for third person camera - allows rotating around (0, 0, 0)
const controls = new OrbitControls(thirdPersonCamera, renderer.domElement);
controls.target.set(0, 0, 0); // This is what the camera orbits around
controls.update();

// Make first person camera initially focus forward
firstPersonCamera.lookAt(1, 1.8, 0);

// ==================== LIGHTING ====================
// Ambient Light - provides overall scene illumination
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

// Spot Light - main shadow-casting light from above
const spotLight = new THREE.SpotLight(0xFFFFFF, 1.2);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
spotLight.distance = 1000;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

// Directional Light - additional ambient lighting
const directionalLight = new THREE.DirectionalLight(0xFFFFEE, 0.5);
directionalLight.position.set(5, 2, 8);
scene.add(directionalLight);

// Point Light - for spell effect (will be toggled)
const spellLight = new THREE.PointLight(0xFFD700, 2, 3);
spellLight.position.set(0, 0.5, 0);
spellLight.visible = false;
scene.add(spellLight);

// ==================== GROUND ====================
// Create textured ground plane
const groundGeometry = new THREE.BoxGeometry(25, 2, 25);
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('path/to/ground_texture.jpg'); // Replace with actual path
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    map: groundTexture 
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(0, -1, 0);
ground.receiveShadow = true;
scene.add(ground);

// ==================== SKYBOX ====================
// Create skybox using cube mapping
const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = cubeTextureLoader.load([
    'path/to/px.jpg', // positive x
    'path/to/nx.jpg', // negative x
    'path/to/py.jpg', // positive y
    'path/to/ny.jpg', // negative y
    'path/to/pz.jpg', // positive z
    'path/to/nz.jpg'  // negative z
]);
scene.background = skyboxTexture;

// ==================== DARK WARRIOR ====================
// Variables for Dark Warrior model and controls
let darkWarrior = null;
let spellCircle = null;
let spellActive = false;
const darkWarriorMovement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotateLeft: false,
    rotateRight: false
};
const movementSpeed = 0.1;
const rotationSpeed = 0.05;

// Load Dark Warrior GLTF model
const gltfLoader = new GLTFLoader();
gltfLoader.load('momonga_ainz_ooal_gown/scene.gltf', (gltf) => {
    darkWarrior = gltf.scene;
    darkWarrior.position.set(0, -0.01, 3);
    darkWarrior.scale.set(0.01, 0.01, 0.01);
    darkWarrior.rotation.y = Math.PI / 2;
    
    // Enable shadows for all meshes in the model
    darkWarrior.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    scene.add(darkWarrior);
    createSpellCircle();
});

// Create magical spell circle
function createSpellCircle() {
    spellCircle = new THREE.Group();
    
    // Material for all spell components
    const spellMaterial = new THREE.MeshPhongMaterial({
        color: 0xDAA520,
        emissive: 0xFFCC00,
        emissiveIntensity: 2,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    // Inner Ring
    const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(1, 1.2, 64),
        spellMaterial
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.02;
    spellCircle.add(innerRing);
    
    // Outer Ring
    const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 2, 64),
        spellMaterial
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.02;
    spellCircle.add(outerRing);
    
    // Pointer 1
    const pointer1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 4, 0.01),
        spellMaterial
    );
    pointer1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    pointer1.position.y = 0.01;
    spellCircle.add(pointer1);
    
    // Pointer 2
    const pointer2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 4, 0.01),
        spellMaterial
    );
    pointer2.rotation.set(Math.PI / 2, 0, 0);
    pointer2.position.y = 0.01;
    spellCircle.add(pointer2);
    
    spellCircle.visible = false;
    scene.add(spellCircle);
}

// ==================== HAMSTER ====================
// Create hamster with multiple parts and texture mapping
const hamsterGroup = new THREE.Group();

// Load hamster face textures
const hamsterFrontHappy = textureLoader.load('path/to/hamster_happy.jpg');
const hamsterFrontSad = textureLoader.load('path/to/hamster_sad.jpg');
const hamsterSide = textureLoader.load('path/to/hamster_side.jpg');
const hamsterTopBack = textureLoader.load('path/to/hamster_top.jpg');

let hamsterHappy = true; // Track hamster's current emotion

// Hamster Body with texture mapping
const hamsterBodyMaterials = [
    new THREE.MeshPhongMaterial({ map: hamsterSide }), // right
    new THREE.MeshPhongMaterial({ map: hamsterSide }), // left
    new THREE.MeshPhongMaterial({ map: hamsterTopBack }), // top
    new THREE.MeshPhongMaterial({ map: hamsterTopBack }), // bottom
    new THREE.MeshPhongMaterial({ map: hamsterFrontHappy }), // front
    new THREE.MeshPhongMaterial({ map: hamsterTopBack }) // back
];

const hamsterBody = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    hamsterBodyMaterials
);
hamsterBody.position.set(3, 1, -1);
hamsterBody.rotation.y = Math.PI / 8;
hamsterBody.castShadow = true;
hamsterBody.receiveShadow = true;
hamsterGroup.add(hamsterBody);

// Hamster Tail Main
const tailMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 2.8, 0.6),
    new THREE.MeshPhongMaterial({ color: 0x023020 })
);
tailMain.position.set(2.6, 1.4, -2.25);
tailMain.rotation.y = Math.PI / 8;
tailMain.castShadow = true;
tailMain.receiveShadow = true;
hamsterGroup.add(tailMain);

// Hamster Tail Extension
const tailExtension = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 1.4),
    new THREE.MeshPhongMaterial({ color: 0x023020 })
);
tailExtension.position.set(2.44, 2.8, -2.62);
tailExtension.rotation.set(0, Math.PI / 8, Math.PI / 2);
tailExtension.castShadow = true;
tailExtension.receiveShadow = true;
hamsterGroup.add(tailExtension);

// Hamster Left Ear
const leftEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.7, 128),
    new THREE.MeshPhongMaterial({ color: 0x023020 })
);
leftEar.position.set(4.05, 2.2, -0.6);
leftEar.rotation.z = -Math.PI / 8;
leftEar.castShadow = true;
leftEar.receiveShadow = true;
hamsterGroup.add(leftEar);

// Hamster Right Ear
const rightEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.7, 128),
    new THREE.MeshPhongMaterial({ color: 0x6B6860 })
);
rightEar.position.set(2.5, 2.2, 0);
rightEar.rotation.z = -Math.PI / 8;
rightEar.castShadow = true;
rightEar.receiveShadow = true;
hamsterGroup.add(rightEar);

scene.add(hamsterGroup);

// ==================== TREES ====================
// Create multiple tree instances at different positions
const treePositions = [
    new THREE.Vector3(-5, 1.5, -5),
    new THREE.Vector3(7, 1.5, -6),
    new THREE.Vector3(-8, 1.5, 8)
];

// Load tree trunk texture
const trunkTexture = textureLoader.load('path/to/bark_texture.jpg');

treePositions.forEach(pos => {
    const treeGroup = new THREE.Group();
    
    // Tree Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 3),
        new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            map: trunkTexture 
        })
    );
    trunk.position.copy(pos);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Bottom Leaves
    const bottomLeaves = new THREE.Mesh(
        new THREE.ConeGeometry(3, 4),
        new THREE.MeshStandardMaterial({ color: 0x374F2F })
    );
    bottomLeaves.position.set(pos.x, pos.y + 2.5, pos.z);
    bottomLeaves.castShadow = true;
    bottomLeaves.receiveShadow = true;
    treeGroup.add(bottomLeaves);
    
    // Top Leaves
    const topLeaves = new THREE.Mesh(
        new THREE.ConeGeometry(2.1, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x374F2F })
    );
    topLeaves.position.set(pos.x, pos.y + 4.5, pos.z);
    topLeaves.castShadow = true;
    topLeaves.receiveShadow = true;
    treeGroup.add(topLeaves);
    
    scene.add(treeGroup);
});

// ==================== 3D TEXT ====================
// Load font and create 3D text
const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.145.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeometry = new TextGeometry('OVerlord', {
        font: font,
        size: 1,
        height: 0.2,
        depth: 1
    });
    
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-6, 4, 5);
    textMesh.rotation.y = Math.PI / 2;
    textMesh.castShadow = true;
    textMesh.receiveShadow = true;
    scene.add(textMesh);
});

// ==================== RAYCASTING ====================
// Setup raycaster for hamster clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, activeCamera);
    const intersects = raycaster.intersectObject(hamsterBody);
    
    if (intersects.length > 0) {
        // Toggle hamster face
        hamsterHappy = !hamsterHappy;
        const newFace = hamsterHappy ? hamsterFrontHappy : hamsterFrontSad;
        hamsterBody.material[4].map = newFace;
        hamsterBody.material[4].needsUpdate = true;
    }
}

window.addEventListener('click', onMouseClick);

// ==================== KEYBOARD CONTROLS ====================
// Handle keyboard input for Dark Warrior movement
function onKeyDown(event) {
    switch(event.code) {
        case 'KeyW': darkWarriorMovement.forward = true; break;
        case 'KeyS': darkWarriorMovement.backward = true; break;
        case 'KeyA': darkWarriorMovement.left = true; break;
        case 'KeyD': darkWarriorMovement.right = true; break;
        case 'KeyQ': darkWarriorMovement.rotateLeft = true; break;
        case 'KeyE': darkWarriorMovement.rotateRight = true; break;
        case 'Space':
            event.preventDefault();
            toggleSpell();
            break;
        case 'KeyC':
            // Toggle camera
            activeCamera = (activeCamera === thirdPersonCamera) ? firstPersonCamera : thirdPersonCamera;
            break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW': darkWarriorMovement.forward = false; break;
        case 'KeyS': darkWarriorMovement.backward = false; break;
        case 'KeyA': darkWarriorMovement.left = false; break;
        case 'KeyD': darkWarriorMovement.right = false; break;
        case 'KeyQ': darkWarriorMovement.rotateLeft = false; break;
        case 'KeyE': darkWarriorMovement.rotateRight = false; break;
    }
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// ==================== SPELL TOGGLE ====================
// Toggle spell circle visibility
function toggleSpell() {
    spellActive = !spellActive;
    if (spellCircle) {
        spellCircle.visible = spellActive;
        spellLight.visible = spellActive;
    }
}

// ==================== UPDATE FUNCTIONS ====================
// Update Dark Warrior position and rotation
function updateDarkWarrior() {
    if (!darkWarrior) return;
    
    // Rotation
    if (darkWarriorMovement.rotateLeft) {
        darkWarrior.rotation.y += rotationSpeed;
    }
    if (darkWarriorMovement.rotateRight) {
        darkWarrior.rotation.y -= rotationSpeed;
    }
    
    // Movement relative to rotation
    const direction = new THREE.Vector3();
    
    if (darkWarriorMovement.forward) {
        direction.z -= movementSpeed;
    }
    if (darkWarriorMovement.backward) {
        direction.z += movementSpeed;
    }
    if (darkWarriorMovement.left) {
        direction.x -= movementSpeed;
    }
    if (darkWarriorMovement.right) {
        direction.x += movementSpeed;
    }
    
    // Apply rotation to movement direction
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), darkWarrior.rotation.y);
    darkWarrior.position.add(direction);
    
    // Update spell circle position
    if (spellCircle) {
        spellCircle.position.x = darkWarrior.position.x;
        spellCircle.position.z = darkWarrior.position.z;
        spellCircle.rotation.y += 0.01; // Rotate spell circle
    }
    
    // Update spell light position
    spellLight.position.x = darkWarrior.position.x;
    spellLight.position.z = darkWarrior.position.z;
    
    // Update first person camera
    const cameraOffset = new THREE.Vector3(0, 1.8, 0);
    const cameraTarget = new THREE.Vector3(1, 1.8, 0);
    
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), darkWarrior.rotation.y);
    cameraTarget.applyAxisAngle(new THREE.Vector3(0, 1, 0), darkWarrior.rotation.y);
    
    firstPersonCamera.position.copy(darkWarrior.position).add(cameraOffset);
    firstPersonCamera.lookAt(darkWarrior.position.clone().add(cameraTarget));
}

// ==================== WINDOW RESIZE ====================
// Handle window resize to maintain aspect ratio
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    
    thirdPersonCamera.aspect = aspect;
    thirdPersonCamera.updateProjectionMatrix();
    
    firstPersonCamera.aspect = aspect;
    firstPersonCamera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// ==================== ANIMATION LOOP ====================
// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    updateDarkWarrior();
    controls.update();
    
    renderer.render(scene, activeCamera);
}

animate();