import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, output, ViewChild } from "@angular/core";
import { gsap } from "gsap";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

@Component({
  standalone: true,
  selector: "raijin-3d",
  template: `<canvas #raijinCanvas id="raijin-canvas" class="!w-full !h-full"></canvas>`,
})
export class Raijin3DComponent {
  @ViewChild("raijinCanvas", { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  controls!: OrbitControls;

  loadingEnd = output();

  constructor() {}

  async ngOnInit() {
    await this.loadScene();
  }

  async loadScene() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      this.loadingEnd.emit();
    };

    const offsetX = height > width ? 0 : 2.5;
    const offsetZ = height > width ? 0 : 1.5;

    const canvas = this.rendererCanvas.nativeElement;
    this.scene = new THREE.Scene();

    // Add lightning and camera
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 50);
    pointLight.position.y = 8;
    this.scene.add(pointLight);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(5.74, 7.11, -8.45);
    this.camera.rotation.set(-2.44, 0.48, 2.77, "XYZ");

    this.scene.add(this.camera);

    // Add ambient (lines)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 500), material);
    line.position.x = offsetX;
    line.rotation.set(Math.PI / 2, 0, 0);
    this.scene.add(line);

    const marker1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), material);
    marker1.rotation.set(Math.PI / 2, 0, 0);
    marker1.position.set(offsetX + 3, 0, offsetZ + 10);
    this.scene.add(marker1);

    const marker2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), material);
    marker2.rotation.set(Math.PI / 2, 0, 0);
    marker2.position.set(offsetX + 3, 0, offsetZ - 10);
    this.scene.add(marker2);

    // Add debug grid
    // const grid = new THREE.GridHelper(50, 30);
    // const axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(grid, axesHelper);

    // Add Raijin Model
    const loader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath("draco/");
    loader.setDRACOLoader(dracoLoader);

    const model = await loader.loadAsync("models/Raijin.glb");
    model.scene.position.x = offsetX;
    model.scene.position.z = offsetZ;
    this.scene.add(model.scene);

    // Add camera control
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.minDistance = 2;
    this.controls.maxDistance = 70;
    this.controls.maxTargetRadius = 5;
    this.controls.update();

    // Render everything
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(width, height);

    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  resetView() {
    gsap.to(this.camera.position, {
      duration: 2,
      x: 5.74,
      y: 7.11,
      z: -8.45,
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      },
    });

    gsap.to(this.controls.target, {
      duration: 2,
      x: 0,
      y: 0,
      z: 0,
      onUpdate: () => {
        this.controls.update();
      },
    });
  }

  @HostListener("window:resize")
  handleRedize() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
