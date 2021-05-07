import './styles.scss';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

(() => {
    /* Tamaño de la escena */
    const sceneSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    /* Tamaño del plano de la ciudad */
    const planeSize = 22;

    /* Numero de parkings */
    const nParkings = 5;

    /* Array de parkings */
    let parkings = [];

    /* Tamaño del parking */
    const parkingSize = 1;

    /* Objecto vehiculo */
    let car = null;

    /* Posicion camara arriba */
    const mainCameraPosition = {
        x: 0,
        y: 5,
        z: 25,
    }

    /* Tipos de camara */
    const CameraType = Object.freeze({
        MainCamera: 'MainCamera',
        SecondaryCamera: 'SecondaryCamera',
    })

    /* Posicion de la camara */
    let cameraPosition = CameraType.MainCamera;

    /* Creación de la camara y posicionamiento de la misma --> position.set(PosicionX PosicionY PosicionZ) */
    const camera = new THREE.PerspectiveCamera(45, sceneSize.width / sceneSize.height, 0.1, 1000);
    camera.position.set(mainCameraPosition.x, mainCameraPosition.y, mainCameraPosition.z);

    /* Creación de la escena y asignación del color de fondo */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEAECEE); // Mismo color de fondo de todas las prácticas

    /* */
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add(ambientLight);

    /* */
    const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add(pointLight);
    scene.add(camera);

    /* Creación del render dentro del body */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(sceneSize.width, sceneSize.height);
    document.body.appendChild(renderer.domElement);

    /* Creación de las geometrias necesarias (box para los parkings y plane para la ciudad) */
    const boxGeometry = new THREE.BoxGeometry(parkingSize, parkingSize, parkingSize);
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

    /* Creación del loader para poder cargar los assets correspondientes */
    const textureLoader = new THREE.TextureLoader();

    /* Creación de las texturas */
    const textureParking = textureLoader.load('./assets/parking.png');
    const textureCity = textureLoader.load('./assets/city.jpg');
    textureCity.wrapS = THREE.RepeatWrapping;
    textureCity.wrapT = THREE.RepeatWrapping;
    textureCity.magFilter = THREE.NearestFilter;
    textureCity.repeat.set(2, 2);

    /* Creación de los materiales en función de las texturas previamente creadas */
    const materialParking = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textureParking, });
    const materialCity = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textureCity, side: THREE.DoubleSide, });

    /* Random para generar la posicion de los parkings */
    const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    /* Creación de los cubos de parking en función de las geometrias y meteriales */
    for(let i = 0; i < nParkings; i++) {
        const parking = new THREE.Mesh(boxGeometry, materialParking);

        let xPosition = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);
        let zPosition = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);

        parking.position.x = xPosition;
        parking.position.z = zPosition;
        parking.position.y = 0.51; // Se eleva un poco cada cubo para evitar que atraviese el plano

        parkings.push(parking);
        scene.add(parking);
    }
    
    /* Creación del plano de la ciudad en función de las geometrias y meteriales */
    const plane = new THREE.Mesh(planeGeometry, materialCity);
    plane.rotation.x = Math.PI * -.5; // Rotamos el plano en el eje X para que quede completamente horizontal
    scene.add(plane);

    /* Creación del vehículo a traves del archivo OBJ */
    const loadModel = () => {
        car.traverse((child) => {
            if(child.isMesh) {
                child.material.map = textureCar;
            }
        });
        scene.add(car);
    }

    const manager = new THREE.LoadingManager(loadModel);
    const TextureLoaderCar = new THREE.TextureLoader(manager);
    const textureCar = TextureLoaderCar.load('./assets/Car.png');
    
    const objLoader = new OBJLoader(manager);
    objLoader.load('./assets/Car.obj', (object) => {
        car = object;
        car.scale.set(0.01, 0.01, 0.01);
        car.position.set(-1, 0, 10.5);
        car.rotation.y = Math.PI;
    });

    /* Redimensión de los elementos en función del tamaño de ventana */
    window.addEventListener('resize', () => {
        sceneSize.width = window.innerWidth;
        sceneSize.height = window.innerHeight;

        camera.aspect = sceneSize.width / sceneSize.height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(sceneSize.width, sceneSize.height);
    });

    /* */
    document.addEventListener('keydown', (event) => {
        if(event.code === 'ArrowUp') {
            car.position.z -= 0.1;
        }
        if(event.code === 'ArrowDown') {
            car.position.z += 0.1;
        }
        if(event.code === 'ArrowRight') {
            car.position.x += 0.1;
        }
        if(event.code === 'ArrowLeft') {
            car.position.x -= 0.1;
        }
        if(event.code === 'Space' ) {
            if(camera.position.z !== car.position.z) {
                cameraPosition = CameraType.SecondaryCamera;
            } else {
                cameraPosition = CameraType.MainCamera;
                camera.position.set(mainCameraPosition.x, mainCameraPosition.y, mainCameraPosition.z);
            }
        }
    });

    /* Renderización de la escena y la cámara en cada frame */
    const animate = () => {
        requestAnimationFrame(animate);

        if(cameraPosition === CameraType.SecondaryCamera) {
            camera.position.set(car.position.x, car.position.y + 0.4, car.position.z);
        }

        parkings.forEach(parking => parking.rotation.y += 0.01);

        renderer.render(scene, camera);
    };

    animate();
})()
