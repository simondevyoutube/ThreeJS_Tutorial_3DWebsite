import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class Website3DDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.physicallyCorrectLights = true;
    this._threejs.toneMapping = THREE.ACESFilmicToneMapping;
    this._threejs.outputEncoding = THREE.sRGBEncoding;

    const modelDiv = document.getElementById('model');
    modelDiv.appendChild(this._threejs.domElement);

    this._threejs.setSize(modelDiv.offsetWidth, modelDiv.offsetHeight);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = modelDiv.offsetWidth / modelDiv.offsetHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(15, 15, 20);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF);
    this._scene.add(light);

    this._controls = new OrbitControls(
        this._camera, this._threejs.domElement);
    this._controls.target.set(0, 10, 0);
    this._controls.update();

    this._LoadAnimatedModelAndPlay(
        './resources/zombie/', 'mremireh_o_desbiens.fbx',
        'Silly Dancing.fbx', new THREE.Vector3(0, 0, 0));

    this._LoadAnimatedModelAndPlay(
        './resources/zombie/', 'mremireh_o_desbiens.fbx',
        'Silly Dancing.fbx', new THREE.Vector3(-20, 0, -20));

    this._LoadAnimatedModelAndPlay(
        './resources/zombie/', 'mremireh_o_desbiens.fbx',
        'Silly Dancing.fbx', new THREE.Vector3(20, 0, -20));
  
    this._mixers = [];
    this._previousRAF = null;

    this._scrollAmount = 0.0;
    this._RAF();
  }

  _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });
      fbx.position.copy(offset);

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
  }

  OnScroll(pos) {
    const a = 15;
    const b = -15;
    const amount = Math.min(pos / 500.0, 1.0);
    this._camera.position.set(a + amount * (b - a), 15, 20);
    this._controls.update();
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Website3DDemo();
});

window.addEventListener('scroll', (e) => {
  _APP.OnScroll(window.scrollY);
});