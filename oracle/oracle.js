window.onload = function() {  
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvas'), antialias: true});
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);

var scene = new THREE.Scene();

var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light1);

let heightMap = [];
let heightMapSize = 3;
let heightMapMax = 500;
let worldSize = 1000;
let worldUnitSize = worldSize/heightMapSize;
for(let i = 0; i <= heightMapSize; i++) {
	let row = [];
	for(let j = 0; j <= heightMapSize; j++) {
		row.push(Math.floor(Math.random()*heightMapMax)-300);
	}
	heightMap.push(row);
}

let v = [];
let mapX = 0;
let mapZ = 0;

for(let i = 0; i < heightMapSize; i++) {
	for(let j = 0; j < heightMapSize; j++) {
		v = v.concat([
			mapX*worldUnitSize, heightMap[mapX][mapZ], mapZ*worldUnitSize,
			(mapX+1)*worldUnitSize, heightMap[mapX+1][mapZ], mapZ*worldUnitSize,
			(mapX+1)*worldUnitSize, heightMap[mapX+1][mapZ+1], (mapZ+1)*worldUnitSize,

			(mapX+1)*worldUnitSize, heightMap[mapX+1][mapZ+1], (mapZ+1)*worldUnitSize,
			mapX*worldUnitSize, heightMap[mapX][mapZ+1], (mapZ+1)*worldUnitSize,
			mapX*worldUnitSize, heightMap[mapX][mapZ], mapZ*worldUnitSize
		]);
		mapX++;
	}
	mapX = 0;
	mapZ++;
}
console.log('v', v);

let world = new THREE.BufferGeometry();
let vertices = new Float32Array([
    0, 0, 0,
    100, 0, 0,
    100, 0, 100,

	100, 0, 100,
    0, 0, 100,
    0, 0, 0
]);
vertices = new Float32Array(v);
world.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

//var geometry = new THREE.CubeGeometry(100, 100, 100);
var material = new THREE.MeshLambertMaterial({color: 0xF3FFE2});
var mesh = new THREE.Mesh(world, material);
mesh.position.set(0, 0, -1000);

scene.add(mesh);
requestAnimationFrame(render);

function render() {
    //mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
}