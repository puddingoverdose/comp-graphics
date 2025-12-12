import * as THREE from './Three JS/three.js-r145-compressed/build/three.module.js';
import { OrbitControls } from './Three JS/three.js-r145-compressed/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './Three JS/three.js-r145-compressed/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from './Three JS/three.js-r145-compressed/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './Three JS/three.js-r145-compressed/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();

let thirdPersonCamera;
let firstPersonCamera;
let currentCamera;
let spellEffectLight;

let darkWarrior;
let spellCircle;
let isSpellActive = false;
const movementSpeed = 0.1;
const rotationSpeed = 0.05;
const pressedKeys = {};
const clock = new THREE.Clock();

let hamsterBody;
let isHappyFace = true;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const fov = 75;
const near = 0.1;
const far = 1000;
const aspect = window.innerWidth / window.innerHeight;

thirdPersonCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
thirdPersonCamera.position.set(6, 3, 5);
thirdPersonCamera.lookAt(0, 0, 0);

firstPersonCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
firstPersonCamera.position.set(0, 1.8, 0);

currentCamera = thirdPersonCamera;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(currentCamera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

function createLights() {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xFFFFFF, 1.2, 1000);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    scene.add(spotLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFEE, 0.5);
    directionalLight.position.set(5, 2, 8);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    spellEffectLight = new THREE.PointLight(0xFFD700, 2, 3);
    spellEffectLight.position.set(0, 0.5, 0);
    spellEffectLight.visible = false;
    scene.add(spellEffectLight);
}

function createGround() {
    const grTxtLoader = new THREE.TextureLoader();
    const grTxt = grTxtLoader.load("./assets/textures/grass/rocky_terrain_02_diff_1k.jpg");

    grTxt.wrapS = THREE.RepeatWrapping;
    grTxt.wrapT = THREE.RepeatWrapping;
    grTxt.repeat.set(10, 10);
    grTxt.encoding = THREE.sRGBEncoding;

    const grGeo = new THREE.BoxGeometry(25, 2, 25);
    const grMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: grTxt });
    const grMesh = new THREE.Mesh(grGeo, grMat);
    grMesh.position.set(0, -1, 0);
    grMesh.receiveShadow = true;
    scene.add(grMesh);
}

function createTrees() {
    const treePositions = [
        new THREE.Vector3(-5, 1.5, -5),
        new THREE.Vector3(7, 1.5, -6),
        new THREE.Vector3(-8, 1.5, 8)
    ];

    const textureLoader = new THREE.TextureLoader();
    const trunkTexture = textureLoader.load('assets/textures/tree/chinese_cedar_bark_diff_1k.jpg');
    trunkTexture.encoding = THREE.sRGBEncoding;

    const trunkMaterial = new THREE.MeshStandardMaterial({
        map: trunkTexture,
        color: "#FFFFFF",
    });

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: "#374F2F",
    });

    treePositions.forEach(pos => {
        const trunkGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 32);
        const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
        trunk.position.set(pos.x, 1.5, pos.z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);

        const bottomLeavesGeo = new THREE.ConeGeometry(3, 4, 32);
        const bottomLeaves = new THREE.Mesh(bottomLeavesGeo, leavesMaterial);
        bottomLeaves.position.set(pos.x, 4, pos.z);
        bottomLeaves.castShadow = true;
        bottomLeaves.receiveShadow = true;
        scene.add(bottomLeaves);

        const topLeavesGeo = new THREE.ConeGeometry(2.1, 2.8, 32);
        const topLeaves = new THREE.Mesh(topLeavesGeo, leavesMaterial);
        topLeaves.position.set(pos.x, 6, pos.z);
        topLeaves.castShadow = true;
        topLeaves.receiveShadow = true;
        scene.add(topLeaves);
    });
}

function createSpellCircle() {
    const spellMaterial = new THREE.MeshPhongMaterial({ 
        color: "#DAA520", 
        emissive: "#FFCC00", 
        emissiveIntensity: 2, 
        shininess: 100, 
        transparent: true, 
        opacity: 0.8, 
        side: THREE.DoubleSide 
    });

    const innerRingGeo = new THREE.RingGeometry(1, 1.2, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, spellMaterial);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.02;

    const outerRingGeo = new THREE.RingGeometry(1.8, 2, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, spellMaterial);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.02;

    const pointerGeo = new THREE.BoxGeometry(0.05, 4, 0.01);

    const pointer1 = new THREE.Mesh(pointerGeo, spellMaterial);
    pointer1.position.y = 0.01;
    pointer1.rotation.x = Math.PI / 2;
    pointer1.rotation.z = Math.PI / 2;

    const pointer2 = new THREE.Mesh(pointerGeo, spellMaterial);
    pointer2.position.y = 0.01;
    pointer2.rotation.x = Math.PI / 2;

    spellCircle = new THREE.Group();
    spellCircle.add(innerRing, outerRing, pointer1, pointer2);
    scene.add(spellCircle);

    spellCircle.visible = false;
    spellCircle.add(spellEffectLight);
}

function createWarrior() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        './assets/models/momonga_ainz_ooal_gown/scene.gltf',
        (gltf) => {
            darkWarrior = gltf.scene;
            darkWarrior.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            darkWarrior.position.set(0, -0.01, 3);
            darkWarrior.scale.set(0.01, 0.01, 0.01);
            darkWarrior.rotation.y = Math.PI / 2;
            scene.add(darkWarrior);

            createSpellCircle();
        },

        undefined,
        (error) => {
            console.error('Error loading Dark Warrior GLTF:', error);
        }
    );
}

function createHamster() {
    const textureLoader = new THREE.TextureLoader();
    const happyFaceTexture = textureLoader.load('./assets/textures/hamsuke/front_happy.png');
    const sadFaceTexture = textureLoader.load('./assets/textures/hamsuke/front_sad.png');
    const sideTexture = textureLoader.load('./assets/textures/hamsuke/side.png');
    const topBackTexture = textureLoader.load('./assets/textures/hamsuke/top&back.png');

    happyFaceTexture.encoding = THREE.sRGBEncoding;
    sadFaceTexture.encoding = THREE.sRGBEncoding;
    sideTexture.encoding = THREE.sRGBEncoding;
    topBackTexture.encoding = THREE.sRGBEncoding;

    const bodyGeometry = new THREE.BoxGeometry(2, 2, 2);

    const materials = [
        new THREE.MeshPhongMaterial({ map: sideTexture }),
        new THREE.MeshPhongMaterial({ map: sideTexture }),
        new THREE.MeshPhongMaterial({ map: topBackTexture }),
        new THREE.MeshPhongMaterial({ map: topBackTexture }),
        new THREE.MeshPhongMaterial({ map: happyFaceTexture }),
        new THREE.MeshPhongMaterial({ map: topBackTexture }),
    ];

    hamsterBody = new THREE.Mesh(bodyGeometry, materials);
    hamsterBody.name = "HamsterBody";
    hamsterBody.position.set(3, 1, -1);
    hamsterBody.rotation.y = Math.PI / 8;
    hamsterBody.castShadow = true;
    hamsterBody.receiveShadow = true;
    scene.add(hamsterBody);

    const tailMainGeo = new THREE.BoxGeometry(0.6, 2.8, 0.6);
    const tailMainMat = new THREE.MeshPhongMaterial({ color: "#023020" });
    const tailMain = new THREE.Mesh(tailMainGeo, tailMainMat);
    tailMain.position.set(2.6, 1.4, -2.25);
    tailMain.rotation.y = Math.PI / 8;
    tailMain.castShadow = true;
    tailMain.receiveShadow = true;
    scene.add(tailMain);

    const tailExtGeo = new THREE.BoxGeometry(0.6, 0.6, 1.4);
    const tailExtMat = new THREE.MeshPhongMaterial({ color: "#023020" });
    const tailExt = new THREE.Mesh(tailExtGeo, tailExtMat);
    tailExt.position.set(2.44, 2.8, -2.62);
    tailExt.rotation.y = Math.PI / 8;
    tailExt.rotation.z = Math.PI / 2;
    tailExt.castShadow = true;
    tailExt.receiveShadow = true;
    scene.add(tailExt);

    const earGeo = new THREE.ConeGeometry(0.2, 0.7, 128);
    const leftEarMat = new THREE.MeshPhongMaterial({ color: "#023020" });
    const leftEar = new THREE.Mesh(earGeo, leftEarMat);
    leftEar.position.set(4.05, 2.2, -0.6);
    leftEar.rotation.z = -Math.PI / 8;
    leftEar.castShadow = true;
    leftEar.receiveShadow = true;
    scene.add(leftEar);

    const rightEarMat = new THREE.MeshPhongMaterial({ color: "#6B6860" });
    const rightEar = new THREE.Mesh(earGeo, rightEarMat);
    rightEar.position.set(2.5, 2.2, 0);
    rightEar.rotation.z = Math.PI / 8;
    rightEar.castShadow = true;
    rightEar.receiveShadow = true;
    scene.add(rightEar);
}

function toggleHamsterFace() {
    if (!hamsterBody || !hamsterBody.material || hamsterBody.material.length < 5) return;

    const faceMaterial = hamsterBody.material[4];
    const textureLoader = new THREE.TextureLoader();

    if (isHappyFace) {
        const tex = textureLoader.load('./assets/textures/hamsuke/front_sad.png');
        tex.encoding = THREE.sRGBEncoding;
        faceMaterial.map = tex;
    } else {
        const tex = textureLoader.load('./assets/textures/hamsuke/front_happy.png');
        tex.encoding = THREE.sRGBEncoding;
        faceMaterial.map = tex;
    }

    faceMaterial.needsUpdate = true;
    isHappyFace = !isHappyFace;
}

function onHamsterClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, currentCamera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === 'HamsterBody') {
            toggleHamsterFace();
            break;
        }
    }
}

function createSceneText() {
    const loader = new FontLoader();
    loader.load(
        './Three JS/examples/fonts/helvetiker_bold.typeface.json',
        (font) => {
            const textGeometry = new TextGeometry('OVerlord', {
                font: font,
                size: 1,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.2,
                bevelSize: 0.05,
                bevelOffset: 0,
                bevelSegments: 5
            });

            const textMaterial = new THREE.MeshStandardMaterial({
                color: "#FFFFFF",
            });

            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-6, 4, 5);
            textMesh.rotation.y = Math.PI / 2;
            textMesh.castShadow = true;
            textMesh.receiveShadow = true;
            scene.add(textMesh);
        }
    );
}

function createSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const textureUrls = [
        'assets/skybox/side-3.png',
        'assets/skybox/side-4.png',
        'assets/skybox/top.png',
        'assets/skybox/bottom.png',
        'assets/skybox/side-1.png',
        'assets/skybox/side-2.png'
    ];

    const cubeTexture = loader.load(textureUrls);
    cubeTexture.encoding = THREE.sRGBEncoding;

    scene.background = cubeTexture;
    scene.environment = cubeTexture;
}

function toggleSpell() {
    isSpellActive = !isSpellActive;
    if (spellCircle) {
        spellCircle.visible = isSpellActive;
        console.log("Spell visible:", spellCircle.visible); // Cek status di console
    } else {
        console.warn("SpellCircle belum siap (Model mungkin belum load)");
    }
}

function toggleCamera() {
    if (currentCamera === thirdPersonCamera) {
        currentCamera = firstPersonCamera;
        controls.enabled = false;
    } else {
        currentCamera = thirdPersonCamera;
        controls.enabled = true;
    }
}

function handleMovement(deltaTime) {
    if (!darkWarrior) return;

    if (pressedKeys['w']) {
        darkWarrior.translateZ(movementSpeed * deltaTime * 60);
    }
    if (pressedKeys['s']) {
        darkWarrior.translateZ(-movementSpeed * deltaTime * 60);
    }
    if (pressedKeys['a']) {
        darkWarrior.translateX(movementSpeed * deltaTime * 60);
    }
    if (pressedKeys['d']) {
        darkWarrior.translateX(-movementSpeed * deltaTime * 60);
    }

    if (pressedKeys['q']) {
        darkWarrior.rotation.y += rotationSpeed * deltaTime * 60;
    }
    if (pressedKeys['e']) {
        darkWarrior.rotation.y -= rotationSpeed * deltaTime * 60;
    }

    if (spellCircle) {
        spellCircle.position.x = darkWarrior.position.x;
        spellCircle.position.z = darkWarrior.position.z;
        spellCircle.position.y = darkWarrior.position.y;

        spellCircle.rotation.y = darkWarrior.rotation.y;
    }
    
    if (currentCamera === firstPersonCamera) {
        firstPersonCamera.position.copy(darkWarrior.position);
        firstPersonCamera.position.y += 1.8;
        firstPersonCamera.rotation.copy(darkWarrior.rotation);

        const relativeFocus = new THREE.Vector3(1, 1.8, 0);
        relativeFocus.applyQuaternion(darkWarrior.quaternion);

        const focusPosition = new THREE.Vector3();
        focusPosition.copy(darkWarrior.position).add(relativeFocus);
        firstPersonCamera.lookAt(focusPosition);
    }
}

function onWindowResize() {
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    handleMovement(deltaTime);

    if (currentCamera === thirdPersonCamera) {
        controls.update();
    }

    renderer.render(scene, currentCamera);
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onHamsterClick, false);
window.addEventListener('dblclick', toggleCamera, false);
window.addEventListener('keydown', (event) => {
    pressedKeys[event.key.toLowerCase()] = true;
    if (event.key === ' ') {
        console.log("Spasi terdeteksi! Status SpellCircle:", spellCircle);
        toggleSpell();
    }
}, false);
window.addEventListener('keyup', (event) => {
    pressedKeys[event.key.toLowerCase()] = false;
}, false);

createLights();
createGround();
createTrees();
createWarrior();
createHamster();
createSceneText();
createSkybox();
animate();