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


let world = new THREE.BufferGeometry();
let vertices = new Float32Array([
    -100, -100, 0,
    100, -100, 0,
    100, 100, 0,

    -100, 100, 0,
    -100, -100, 0,
    100, 100, 0,
]);
world.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

//var geometry = new THREE.CubeGeometry(100, 100, 100);
var material = new THREE.MeshLambertMaterial({color: 0xF3FFE2});
var mesh = new THREE.Mesh(world, material);
mesh.position.set(0, 0, -1000);

scene.add(mesh);
requestAnimationFrame(render);

function render() {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
}