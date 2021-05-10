import './styles.scss';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';

(async() => {
    /* Tamaño de la escena */
    const sceneSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    /* Tamaño del plano de la ciudad */
    const planeSize = 22;

    /* Posición cámara principal */
    const mainCameraPosition = Object.freeze({
        x: 0,
        y: 5,
        z: 25,
    });

    /* Tipos de cámara */
    const CameraType = Object.freeze({
        MainCamera: 'MainCamera',
        FirstPersonCamera: 'FirstPersonCamera',
    });

    /* Posición de la cámara */
    let selectedCamera = CameraType.MainCamera;

    /* Tamaño del parking */
    const parkingSize = 1;

    /* Array de parkings */
    let parkings = [];

    /* Vehículo */
    let car;

    /* Dirección del vehículo */
    let carDirection = 0;

    /* Velocidad del vehículo */
    const carSpeed = 0.05;

    /* Ángulo del coche */
    let carAngle = 180;

    /* */
    const carStartingPosition = Object.freeze({
        x: -1,
        y: 0,
        z: 10.5,
    });

    /* Ángulo de la cámara en primera persona*/
    let firstPersonCameraAngle = 0;

    /* Controlador de teclas pulsadas */
    let keyPressedController = [];

    /* */
    let textsParkingsPlaces = [];

    /* */
    let parkingsNames = [];

    /* Cámara y posicionamiento inicial de la misma */
    const camera = new THREE.PerspectiveCamera(45, sceneSize.width / sceneSize.height, 0.1, 1000);
    camera.position.set(mainCameraPosition.x, mainCameraPosition.y, mainCameraPosition.z);

    /* Escena y asignación del color de fondo */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEAECEE); // Mismo color de fondo de todas las prácticas

    /* Luz ambiental de la escena */
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    /* Punto de luz */
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
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

    /* Forma geométrica del parking */
    const boxGeometry = new THREE.BoxGeometry(parkingSize, parkingSize, parkingSize);

    /* Forma geométrica del plano */
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

    /* Cargador de texturas */
    const textureLoader = new THREE.TextureLoader();

    /* Textura del parking */
    const parkingTexture = textureLoader.load('./assets/parking.png');

    /* Textura del plano */
    const planeTexture = textureLoader.load('./assets/city.jpg');
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.magFilter = THREE.NearestFilter;
    planeTexture.repeat.set(2, 2);

    /* Material del parking */
    const parkingMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: parkingTexture,});

    /* Material del plano */
    const planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: planeTexture, side: THREE.DoubleSide,});

    /* Número aleatorio entre un rango definido */
    const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    /* Datos de los parkings */
    const response = await fetch('assets/parkings.json');
    const parkingsData = await response.json();

    /* */
    const fontLoader = new THREE.FontLoader();

    /* */
    const materialTextParkingPlace = (freePlaces, totalPlaces) => {
        const textRed = 0xF44336;
        const textOrange = 0xFF9800;
        const textYellow = 0xFFEB3B;
        const textGreen = 0x4CAF50;
        let color;

        if(100 * freePlaces / totalPlaces >= 0 && 100 * freePlaces / totalPlaces < 25) {
            color = textRed;
        } else if(100 * freePlaces / totalPlaces >= 25 && 100 * freePlaces / totalPlaces < 50) {
            color = textOrange;
        } else if(100 * freePlaces / totalPlaces >= 50 && 100 * freePlaces / totalPlaces < 75) {
            color = textYellow;
        } else if(100 * freePlaces / totalPlaces >= 75 && 100 * freePlaces / totalPlaces <= 100) {
            color = textGreen;
        }
        
        return new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });
    };

    /* */
    const textParkingPlaces = (font, nFreePlaces, nTotalPlaces, randomXPosition, randomZPosition, index, nRemove) => {
        const freePlaces = nFreePlaces;
        const shapesParkingPlaces = font.generateShapes(freePlaces, 0.25);
        const geometryTextParkingPlaces = new THREE.ShapeGeometry(shapesParkingPlaces);
        geometryTextParkingPlaces.computeBoundingBox();
        const textParkingPlaces = new THREE.Mesh(geometryTextParkingPlaces, materialTextParkingPlace(nFreePlaces, nTotalPlaces));

        textParkingPlaces.position.x = randomXPosition - nFreePlaces.length / (planeSize / 2);
        textParkingPlaces.position.z = randomZPosition;
        textParkingPlaces.position.y = parkingSize + 0.25;

        textsParkingsPlaces.splice(index, nRemove, textParkingPlaces);
        scene.add(textParkingPlaces);
    }

    /* */
    for(let i = 0; i < parkingsData.resources.length; i++) {

        let randomXPosition = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);
        let randomZPosition = random(-(planeSize - parkingSize) / 2, (planeSize - parkingSize) / 2);

        fontLoader.load('assets/helvetiker_regular.typeface.json', (font) => {
            const textColor = 0x5850EC;

            const textMaterial = new THREE.MeshBasicMaterial({
                color: textColor,
                side: THREE.DoubleSide
            });

            const parkingName = parkingsData.resources[i].nombre;
            const textShape = font.generateShapes(parkingName, 0.25);
            const textNameGeometry = new THREE.ShapeGeometry(textShape);
            textNameGeometry.computeBoundingBox();
            const textName = new THREE.Mesh(textNameGeometry, textMaterial);

            textName.position.x = randomXPosition - parkingsData.resources[i].nombre.length / (planeSize / 2);
            textName.position.z = randomZPosition;
            textName.position.y = parkingSize + 0.55;

            parkingsNames.push(textName);
            scene.add(textName);

            textParkingPlaces(font, parkingsData.resources[i].plazaslib, parkingsData.resources[i].plazastot, randomXPosition, randomZPosition, i, 0);
        } ); 

        const parking = new THREE.Mesh(boxGeometry, parkingMaterial);

        parking.position.x = randomXPosition;
        parking.position.z = randomZPosition;
        parking.position.y = 0.51; // Se eleva un poco cada cubo para evitar que atraviese el plano

        parkings.push(parking);
        scene.add(parking);
    }

    /* Plano de la escena */
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI * -.5; // Rotación de 90º sobre el eje 'X' para colocar el plano horizontal
    scene.add(plane);

    /* Cargar del vehículo mediante el fichero OBJ y su textura mediante el fichero MTL correspondiente */
    new MTLLoader().load('./assets/Car.mtl', (materials) => {
        materials.preload();
        new OBJLoader().setMaterials(materials).load('./assets/Car.obj', (object) => {
            car = object;
            car.scale.set(0.01, 0.01, 0.01);
            car.position.set(carStartingPosition.x, carStartingPosition.y, carStartingPosition.z);
            car.rotation.y = Math.PI;
            scene.add(car);
        });
    } );

    /* Registra el evento 'resize' producido cuando se cambia el tamaño de ventana */
    window.addEventListener('resize', () => {
        sceneSize.width = window.innerWidth;
        sceneSize.height = window.innerHeight;

        camera.aspect = sceneSize.width / sceneSize.height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(sceneSize.width, sceneSize.height);
    });

    /* Registra el evento 'keydown' producido cuando se presiona una tecla */
    document.addEventListener('keydown', (event) => {
        if(event.code === 'ArrowUp') {
            carDirection = 1;
            keyPressedController[event.code] = true;
        }

        if(event.code === 'ArrowDown') {
            carDirection = -1;
            keyPressedController[event.code] = true;
        }

        if(keyPressedController['ArrowUp'] === true && event.code === 'ArrowRight') {
            carAngle -= 1;
            firstPersonCameraAngle -= 1;
        } else if(keyPressedController['ArrowDown'] === true && event.code === 'ArrowRight') {
            carAngle += 1;
            firstPersonCameraAngle += 1;
        }

        if(keyPressedController['ArrowUp'] === true && event.code === 'ArrowLeft') {
            carAngle += 1;
            firstPersonCameraAngle += 1;
        } else if(keyPressedController['ArrowDown'] === true && event.code === 'ArrowLeft') {
            carAngle -= 1;
            firstPersonCameraAngle -= 1;
        }

        if(event.code === 'KeyC') {
            if(camera.position.z !== car.position.z) {
                selectedCamera = CameraType.FirstPersonCamera;
            } else {
                selectedCamera = CameraType.MainCamera;
                camera.position.set(mainCameraPosition.x, mainCameraPosition.y, mainCameraPosition.z);
                camera.rotation.y = 0;
            }
        }
    });

    /* Registra el evento 'keyup' producido cuando se levanta una tecla */
    document.addEventListener('keyup', (event) => {
        if(event.code === 'ArrowUp' || event.code === 'ArrowDown') {
            keyPressedController[event.code] = false;
        }
    })

    /* Controlador del vehículo */
    const carController = () => {
        /* Actualización de la posición del vehículo en los ejes 'X' y 'Z', y rotación del mismo en el eje 'Y' */
        if(keyPressedController['ArrowUp'] === true || keyPressedController['ArrowDown'] === true) {
            car.position.z += (carSpeed * carDirection) * Math.cos(Math.PI / 180 * carAngle);
            car.position.x += (carSpeed * carDirection) * Math.sin(Math.PI / 180 * carAngle);
            car.rotation.y = Math.PI / 180 * carAngle;
        }
    };

    /* */
    const collisionControler = () => {
        if(car) {
            parkings.forEach((parking, index) => {
                if(parking.position.x - parkingSize / 2 <= car.position.x && parking.position.x + parkingSize / 2 >= car.position.x && parking.position.z - parkingSize / 2 <= car.position.z && parking.position.z + parkingSize / 2 >= car.position.z) {
                    /* */
                    scene.remove(textsParkingsPlaces[index]);
                    // /* */
                    car.position.set(carStartingPosition.x, carStartingPosition.y, carStartingPosition.z);
                    carAngle = 180;
                    carDirection = 0;
                    firstPersonCameraAngle = 0;

                    parkingsData.resources[index].plazaslib--;

                    if(parkingsData.resources[index].plazaslib == 0) {
                        scene.remove(parking);
                        scene.remove(parkingsNames[index]);
                        parkings.splice(index, 1);
                        return;
                    }
                    
                    /* */
                    fontLoader.load('assets/helvetiker_regular.typeface.json', (font) => {
                        textParkingPlaces(font, parkingsData.resources[index].plazaslib + "", parkingsData.resources[index].plazastot, parking.position.x, parking.position.z, index, 1);
                    });
                }
            })
        }
    };

    /* Actualización de la posición de la cámara en función de la seleccionada*/
    const cameraController = () => {
        if(selectedCamera === CameraType.FirstPersonCamera) {
            camera.position.set(car.position.x, car.position.y + 0.4, car.position.z);
            camera.rotation.y = Math.PI / 180 * firstPersonCameraAngle;
        }
    };

    const parkingsController = () => {
        /* Rotación de todos los parkings sobre el eje 'Y' */
        parkings.forEach(parking => {
            parking.rotation.y += 0.01;
        })
    }

    /* Renderización de la escena */
    const render = () => {
        carController();
        collisionControler();
        cameraController();
        parkingsController();

        renderer.render(scene, camera);
    };

    /* Animación de la escena */
    const animate = () => {
        /* Solicita que el navegador programe el repintado de la ventana para el próximo ciclo de animación */
        requestAnimationFrame(animate);
        render();
    };

    animate();
})()
