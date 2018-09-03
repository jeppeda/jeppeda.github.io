window.onload = function() {  
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvas'), antialias: true});
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0,200,0)

//controls = new THREE.FirstPersonControls( camera );
//controls.movementSpeed = 1000;
//controls.lookSpeed = 0.1;

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x030303 );
scene.fog = new THREE.FogExp2( 0x070707, 0.0007 );

var light = new THREE.AmbientLight(0xE0E0E0, 0.5);
scene.add(light);

var light1 = new THREE.PointLight(0xCDCDCD, 0.9);
scene.add(light1);


var light3 = new THREE.PointLight(0x8CA785, 0.7);
light3.position.z = -1400;
light3.position.y = 400;
scene.add(light3);

let heightMap = [];
let heightMapSize = 10;
let heightMapMax = 800;
let worldSize = 4000;
let worldUnitSize = worldSize/heightMapSize;
for(let i = 0; i <= heightMapSize; i++) {
	let row = [];
	for(let j = 0; j <= heightMapSize; j++) {
		row.push(Math.floor(Math.random()*heightMapMax)-300);
	}
	heightMap.push(row);
}

let divide = map => {
	let between = (n1, n2) => (n1+n2)/2
							+(Math.abs(n1-n2)*Math.random())/2
							-Math.abs(n1-n2)/2;
	const size = map.length;
	let newMap = [];
	for(let i = 0; i < size; i++) {
		let row1 = [];
		let row2 = [];
		for(let j = 0; j < size; j++) {
			row1.push(map[i][j]);
			if(map[i][j+1]) {
				row1.push(between(map[i][j],map[i][j+1]));
			}
			if(map[i+1]) {
				row2.push(between(map[i][j],map[i+1][j]));
				if(map[i+1][j+1]) {
					row2.push(between(map[i+1][j],map[i+1][j+1]));
				}
			}	
		}
		newMap.push(row1);
		if(row2.length>0) {
			newMap.push(row2);
		}
	}
	return newMap;
}

let newHeightMap = divide(heightMap);
worldUnitSize /= 2;
newHeightMap = divide(newHeightMap);
worldUnitSize /= 2;
newHeightMap = divide(newHeightMap);
worldUnitSize /= 2;
newHeightMap = divide(newHeightMap);
worldUnitSize /= 2;

let v = [];
let mapX = 0;
let mapZ = 0;

let verticesOfHeightMap = heightMap => {
	let vert = [];
	for(let i = 0; i < heightMap.length-1; i++) {
		for(let j = 0; j < heightMap.length-1; j++) {
			vert = vert.concat([
				mapX*worldUnitSize - worldSize/2, heightMap[mapX][mapZ], mapZ*worldUnitSize - worldSize/2,
				(mapX+1)*worldUnitSize - worldSize/2, heightMap[mapX+1][mapZ], mapZ*worldUnitSize - worldSize/2,
				(mapX+1)*worldUnitSize - worldSize/2, heightMap[mapX+1][mapZ+1], (mapZ+1)*worldUnitSize - worldSize/2,

				(mapX+1)*worldUnitSize - worldSize/2, heightMap[mapX+1][mapZ+1], (mapZ+1)*worldUnitSize - worldSize/2,
				mapX*worldUnitSize - worldSize/2, heightMap[mapX][mapZ+1], (mapZ+1)*worldUnitSize - worldSize/2,
				mapX*worldUnitSize - worldSize/2, heightMap[mapX][mapZ], mapZ*worldUnitSize - worldSize/2
			]);
			mapX++;
		}
		mapX = 0;
		mapZ++;
	}
	return vert;
}
v = verticesOfHeightMap(newHeightMap);

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


var material = new THREE.MeshLambertMaterial({
	color: 0xF3FFE2, 
	//map: new THREE.TextureLoader().load('wave.png'),
	normalMap: new THREE.TextureLoader().load('wave.png')
});
//material.shading = THREE.FlatShading;
world.computeVertexNormals();
var mesh = new THREE.Mesh(world, material);
mesh.position.set(0, -200, -2000);
mesh.rotation.x = Math.PI;

var geometry = new THREE.CubeGeometry(100, 100, 100);
var mesh2 = new THREE.Mesh(geometry, material);
mesh2.position.set(0, 0, -1000);


var light2 = new THREE.DirectionalLight(0xffffff, 5, 500);
light2.target = mesh;
scene.add(light2);

scene.add(mesh);
//scene.add(mesh2);
requestAnimationFrame(render);

function render() {
	//controls.update( clock.getDelta() );
    //mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.001;
	light2.position.z -= 1;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
}