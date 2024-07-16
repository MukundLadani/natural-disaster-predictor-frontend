import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getFresnelMat } from './getFresnelMat';
import getStarfield from './getStarfield';

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.css'],
})
export class EarthComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', { static: false })
  rendererContainer!: ElementRef;

  renderer = new THREE.WebGLRenderer();
  scene: any;
  camera: any;
  mesh: any;
  lightsMesh: any;
  cloudsMesh: any;
  glowMesh: any;
  earthMesh: any;
  stars: any;
  earthSurface = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

  constructor() {
    // scene and camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1c2e4a);
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    const detail = 15;
    this.camera.position.z = 4;
    const geometry = new THREE.IcosahedronGeometry(1, detail);

    // light
    this.scene.add(new THREE.AmbientLight(0x333333));

    //Light direction
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(-2, 0.8, 1.5);
    this.scene.add(sunLight);

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
    this.scene.add(earthGroup);
    new OrbitControls(this.camera, this.renderer.domElement);

    const manager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(manager);

    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load('assets/textures/00_earthmap1k.jpg'),
      specularMap: textureLoader.load('assets/textures/02_earthspec1k.jpg'),
      bumpMap: textureLoader.load('assets/textures/01_earthbump1k.jpg'),
      bumpScale: 0.04,
    });

    const lightsMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load('assets/textures/03_earthlights1k.jpg'),
      blending: THREE.AdditiveBlending,
    });

    const cloudsMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load('assets/textures/04_earthcloudmap.jpg'),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      alphaMap: textureLoader.load('assets/textures/05_earthcloudmaptrans.jpg'),
      // alphaTest: 0.3,
    });

    const fresnelMat = getFresnelMat();
    this.glowMesh = new THREE.Mesh(geometry, fresnelMat);
    this.glowMesh.scale.setScalar(1.001);

    manager.onLoad = () => {
      // call back

      this.earthMesh = new THREE.Mesh(geometry, material);
      earthGroup.add(this.earthMesh);

      this.lightsMesh = new THREE.Mesh(geometry, lightsMat);
      earthGroup.add(this.lightsMesh);

      this.cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
      this.cloudsMesh.scale.setScalar(1.003);
      earthGroup.add(this.cloudsMesh);

      earthGroup.add(this.glowMesh);
    };

    this.stars = getStarfield({ numStars: 5000 });
    this.scene.add(this.stars);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.animate();
  }

  animate() {
    // Rotate the mesh
    window.requestAnimationFrame(() => this.animate());
    if (this.earthMesh) {
      // this.mesh.rotation.x += 0.01;
      this.earthMesh.rotation.y += 0.002;
    }
    if (this.lightsMesh) {
      this.lightsMesh.rotation.y += 0.002;
    }
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += 0.0023;
    }
    if (this.glowMesh) {
      this.glowMesh.rotation.y += 0.002;
    }
    if (this.stars) {
      this.stars.rotation.y -= 0.0002;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
