import './styles.scss';
import * as THREE from 'three';
// import { OBJLoader } from './js/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

(() => {
    /* Tamaño de la escena */
    const sceneSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    /* Tamaño del plano de la ciudad */
    const planeSize = 22;
    /* Numero de parkings */
    const nParkings = 5;
    /* Tamaño del parking */
    const parkingSize = 1;

    /* Creación de la escena y asignación del color de fondo */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEAECEE);

    /* Creación de la camara y posicionamiento de la misma --> position.set(PosicionX PosicionY PosicionZ) */
    const camera = new THREE.PerspectiveCamera(45, sceneSize.width / sceneSize.height, 0.1, 100);
    camera.position.set(0, 7, 25);

    /* Creación del render dentro del body */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(sceneSize.width, sceneSize.height);
    document.body.appendChild(renderer.domElement);

    /* Controles --> Eliminar al pasar a producción */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    /* Creación de las geometrias necesarias (box para los parkings y plane para la ciudad) */
    const boxGeometry = new THREE.BoxGeometry(parkingSize, parkingSize, parkingSize);
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

    /* Creación del loader para poder cargar los assets correspondientes */
    const loader = new THREE.TextureLoader();

    /* Creación de las texturas */
    const textureParking = loader.load('./assets/parking.png');
    const textureCity = loader.load('./assets/city.jpg');
    textureCity.wrapS = THREE.RepeatWrapping;
    textureCity.wrapT = THREE.RepeatWrapping;
    textureCity.magFilter = THREE.NearestFilter;
    textureCity.repeat.set(2, 2);

    /* Creación de los materiales en función de las texturas previamente creadas */
    const materialParking = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textureParking, });
    const materialCity = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textureCity, side: THREE.DoubleSide, })

    /* Random para generar la posicion de los parkings */
    const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    /* Creación de los cubos de parking en función de las geometrias y meteriales */
    for(let i = 0; i < nParkings; i++) {
        const cube = new THREE.Mesh(boxGeometry, materialParking);
        cube.position.x = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);
        cube.position.z = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);
        cube.position.y = 0.5; // Se eleva un poco cada cubo para evitar que atraviese el plano
        scene.add(cube);
    }
    
    /* Creación del plano de la ciudad en función de las geometrias y meteriales */
    const plane = new THREE.Mesh(planeGeometry, materialCity);
    plane.rotation.x = Math.PI * -.5; // Rotamos el plano en el eje X para que quede completamente horizontal
    scene.add(plane);

    /* Creación del vehículo a traves del archivo OBJ */
    // const objLoader = new OBJLoader();
    // objLoader.load('./assets/car.obj', (root) => {
    //     scene.add(root);
    // });

    /* Redimensión de los elementos en función del tamaño de ventana */
    window.addEventListener('resize', () => {
        sceneSize.width = window.innerWidth;
        sceneSize.height = window.innerHeight;

        camera.aspect = sceneSize.width / sceneSize.height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(sceneSize.width, sceneSize.height);
    });

    /* Renderización de la escena y la cámara en cada frame */
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
})()
