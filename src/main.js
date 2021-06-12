import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';
import gsap from 'gsap';

const gui = new dat.GUI();

//scene
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
let conf = { color : '#000000' }; 
scene.scene.background.set(conf.color);
scene.addOrbitControl();
scene.addFog(1,100,conf.color);

//fog GUI
const fogFolder = gui.addFolder('FOG');
fogFolder.add(scene.scene.fog, 'near').min(1).max(100).step(0.01).listen();
fogFolder.add(scene.scene.fog, 'far').min(1).max(100).step(0.01).listen();
fogFolder.addColor(conf, 'color').onChange((color)=>{
	scene.scene.fog.color.set(color);
	scene.scene.background.set(color);
});
const axesHelper = new THREE.AxesHelper(5);

//lights
const directionalLight = new THREE.DirectionalLight(0xFFFFFF,1);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);

const ambiantLight = new THREE.AmbientLight(0xFFFFFF,1);
scene.add(ambiantLight);

const parameters = {};
parameters.count = 1000;
parameters.size = 0.02;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 3;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = '#ffff44';
parameters.outsideColor = '#44ffff';

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {

	const { radius , branches , spin , randomness , randomnessPower , insideColor , outsideColor } = parameters;

	if(points !== null){
		geometry.dispose();
		material.dispose();
		scene.scene.remove(points);
	}

	geometry = new THREE.BufferGeometry();

	const position = new Float32Array(parameters.count * 3);
	const colors = new Float32Array(parameters.count * 3);

	const colorInside = new THREE.Color(insideColor);
	const colorOutside = new THREE.Color(outsideColor);


	for(let i = 0; i < parameters.count; i++){

		/**
		 * Position
		 */
		const i3 = i * 3

		const randomRadius = Math.random() * radius;
		const spinAngle = randomRadius * spin;

		const branchAngle = (i % branches) / branches * Math.PI * 2;

		const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() <  0.5 ? 1 : -1)  * randomness * randomRadius;
		const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() <  0.5 ? 1 : -1)  * randomness * randomRadius;
		const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() <  0.5 ? 1 : -1)  * randomness * randomRadius;
		
		position[i3    ] = (Math.cos(branchAngle + spinAngle) * randomRadius) + randomX;
		position[i3 + 1] = randomY;
		position[i3 + 2] = (Math.sin(branchAngle + spinAngle) * randomRadius) + randomZ;

		/** 
		 * Color
		 */
		const mixedColor = colorInside.clone();
		mixedColor.lerp(colorOutside, randomRadius / radius);

		colors[i3    ] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}

	geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));


	/**
	 * 	Material
	 */

	material = new THREE.PointsMaterial({
		 size:parameters.size,
		 sizeAttenuation:true,
		 depthWrite:false,
		 blending:THREE.AdditiveBlending,
		 vertexColors:true
	});
	


	/**
	 * 	Points
	 */

	points = new THREE.Points(geometry,material);
	scene.add(points);
	
};

generateGalaxy();
const particlesGui = gui.addFolder('Particles');
particlesGui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'branches').min(1).max(10).step(1).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'spin').min(1).max(10).step(1).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'randomness').min(0.1).max(2).step(0.01).onFinishChange(generateGalaxy);
particlesGui.add(parameters, 'randomnessPower').min(1).max(5).step(0.01).onFinishChange(generateGalaxy);
particlesGui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
particlesGui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

const clock = new THREE.Clock();

const animate = () => {
	const elapsedTime = clock.getElapsedTime();

	scene.onUpdate();
	scene.onUpdateStats();
	requestAnimationFrame( animate );
};

animate();