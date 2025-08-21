import React, { useEffect, useRef, useContext, useCallback, useState } from 'react';
import * as THREE from 'three';
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { createGlobalStyle, ThemeProvider } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #FFFFFF;
  }
`;

interface MousePosition {
  x: number;
  y: number;
}

interface Computer3DWithVrmProps {
  selectedVrm: number;
}

const Computer3DWithVrm: React.FC<Computer3DWithVrmProps> = ({ selectedVrm }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const vrmCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  
  const { viewer } = useContext(ViewerContext);
  const [isLoading, setIsLoading] = useState(true);

  const AVATAR_SAMPLE_B_VRM_URL = "tard.vrm";
  const AVATAR_SAMPLE_2_VRM_URL = "npc.vrm";
  const AVATAR_SAMPLE_3_VRM_URL = "blank.vrm";
  const AVATAR_SAMPLE_4_VRM_URL = "bot4.vrm";

  const getVrmUrl = (vrmNumber: number) => {
    switch (vrmNumber) {
      case 1:
        return AVATAR_SAMPLE_B_VRM_URL;
      case 2:
        return AVATAR_SAMPLE_2_VRM_URL;
      case 3:
        return AVATAR_SAMPLE_3_VRM_URL;
      case 4:
        return AVATAR_SAMPLE_4_VRM_URL;
      default:
        return AVATAR_SAMPLE_B_VRM_URL;
    }
  };

  const loadVrm = async (url: string) => {
    setIsLoading(true);
    try {
      
      await viewer.loadVrm(url);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading VRM:', error);
      setIsLoading(false);
    }
  };

  const vrmCanvasCallback = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas && viewer) {
        vrmCanvasRef.current = canvas;
        // Set canvas size
        canvas.width = 512;
        canvas.height = 384;
        viewer.setup(canvas);
        
        const initialVrmUrl = getVrmUrl(selectedVrm);
        loadVrm(buildUrl(initialVrmUrl));

        canvas.addEventListener("dragover", (event) => event.preventDefault());
        canvas.addEventListener("drop", (event) => {
          event.preventDefault();
          const files = event.dataTransfer?.files;
          if (!files) return;

          const file = files[0];
          if (file?.name.endsWith(".vrm")) {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            loadVrm(url);
          }
        });
      }
    },
    [viewer, selectedVrm]
  );

  useEffect(() => {
    if (viewer && selectedVrm) {
      const vrmUrl = getVrmUrl(selectedVrm);
      loadVrm(buildUrl(vrmUrl));
    }
  }, [selectedVrm, viewer]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create canvas texture for VRM viewer
    const vrmCanvas = document.createElement('canvas');
    vrmCanvas.width = 512;
    vrmCanvas.height = 384;
    const canvasTexture = new THREE.CanvasTexture(vrmCanvas);
    canvasTexture.flipY = false; // Don't flip the texture

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ff88, 0.5, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Computer group
    const computerGroup = new THREE.Group();
    scene.add(computerGroup);

    // Materials
    const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
    const blackBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const keyboardMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const mouseMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    // Monitor
    const monitorGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(0, 0.35, 0);
    monitor.castShadow = true;
    computerGroup.add(monitor);

    // Screen with VRM viewer texture
    const screenGeometry = new THREE.BoxGeometry(1.8, 1.3, 0.05);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      map: canvasTexture,
      color: 0xffffff
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0.35, 0.08);
    computerGroup.add(screen);

    // Monitor base
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 32);
    const base = new THREE.Mesh(baseGeometry, blackBaseMaterial);
    base.position.set(0, -0.5, 0);
    base.castShadow = true;
    computerGroup.add(base);

    // Monitor stand
    const standGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.3);
    const stand = new THREE.Mesh(standGeometry, baseMaterial);
    stand.position.set(0, -0.15, -0.2);
    stand.castShadow = true;
    computerGroup.add(stand);

    // Simple Razer Gaming Keyboard - Direct Replacement
    const keyboardGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.4);

    // Main keyboard with Razer black
    const kbMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0a0a0a,
      shininess: 60
    });

    const keyboard = new THREE.Mesh(keyboardGeometry, kbMaterial);
    keyboard.position.set(0, -0.565, 0.8);
    keyboard.castShadow = true;

    // Green underglow strip
    const glowGeom = new THREE.BoxGeometry(1.15, 0.004, 0.02);
    const glowMat = new THREE.MeshPhongMaterial({ 
      color: 0x1DA1F2,
      emissive: 0x1DA1F2
    });
    const bottomGlow = new THREE.Mesh(glowGeom, glowMat);
    bottomGlow.position.set(0, 0.027, 0.19);
    keyboard.add(bottomGlow);

    // Keys
    const keyGeom = new THREE.BoxGeometry(0.04, 0.008, 0.04);
    const keyMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });

    // Add keys in simple grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 15; col++) {
        const key = new THREE.Mesh(keyGeom, keyMat);
        key.position.set(-0.52 + (col * 0.075), 0.029, -0.14 + (row * 0.07));
        key.castShadow = true;
        keyboard.add(key);
      }
    }

    // Spacebar
    const spaceGeom = new THREE.BoxGeometry(0.3, 0.004, 0.035);
    const spacebar = new THREE.Mesh(spaceGeom, keyMat);
    spacebar.position.set(0, 0.04, 0.16);
    spacebar.castShadow = true;
    keyboard.add(spacebar);

    // Simple animation
    const animateKB = () => {
      const t = Date.now() * 0.002;
      const glow = (Math.sin(t) + 1) * 0.3;
      bottomGlow.material.emissive.setHSL(0.33, 1, glow);
      requestAnimationFrame(animateKB);
    };
    animateKB();

    computerGroup.add(keyboard);

    // Mouse
    const mouseGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.25);
    const mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
    mouseMesh.position.set(0.8, -0.555, 0.8);
    mouseMesh.castShadow = true;
    computerGroup.add(mouseMesh);

    // Mouse scroll wheel
    const scrollWheelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8);
    const scrollWheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const scrollWheelMesh = new THREE.Mesh(scrollWheelGeometry, scrollWheelMaterial);
    scrollWheelMesh.position.set(0.8, -0.525, 0.77); // Positioned on top of mouse, slightly forward
    scrollWheelMesh.rotation.x = Math.PI / 2; // Rotate to align with mouse orientation
    scrollWheelMesh.castShadow = true;
    computerGroup.add(scrollWheelMesh);

    // Power button
    const powerButtonGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16);
    const powerButtonMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const powerButton = new THREE.Mesh(powerButtonGeometry, powerButtonMaterial);
    powerButton.position.set(0.8, 0.3, 0.08);
    powerButton.rotation.x = Math.PI / 2;
    computerGroup.add(powerButton);

    // Floor (Carbon Fiber Desk)
    const floorGeometry = new THREE.PlaneGeometry(15, 7);
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, 256, 256);
      
      for (let y = 0; y < 256; y += 4) {
          for (let x = 0; x < 256; x += 4) {
              if ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0) {
                  ctx.fillStyle = '#1a1a1a';
              } else {
                  ctx.fillStyle = '#333333';
              }
              ctx.fillRect(x, y, 4, 4);
          }
      }
      
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 256; i += 4) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(256, i);
          ctx.stroke();
      }
      
      for (let i = 0; i < 256; i += 4) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
      }
    }
    
    const carbonTexture = new THREE.CanvasTexture(canvas);
    carbonTexture.wrapS = THREE.RepeatWrapping;
    carbonTexture.wrapT = THREE.RepeatWrapping;
    carbonTexture.repeat.set(8, 8);
    
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        map: carbonTexture,
        color: 0x888888
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    floor.receiveShadow = true;
    scene.add(floor);

    // Position camera
    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0, 0);

    // Mouse interaction
    const mouse: MousePosition = { x: 0, y: 0 };
    let targetCameraX = 0;
    let targetCameraY = 1;

    const onMouseMove = (event: MouseEvent): void => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const radius = 3;
        targetCameraX = Math.sin(mouse.x * 0.15) * radius;
        targetCameraY = 1 + mouse.y * 0.1;
    };

    window.addEventListener('mousemove', onMouseMove);

    const onWindowResize = (): void => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // Animation loop
    const animate = (): void => {
        animationRef.current = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Update VRM viewer canvas texture
        if (vrmCanvasRef.current && canvasTexture) {
          const ctx = vrmCanvas.getContext('2d');
          if (ctx) {
            // Clear the canvas first to prevent ghosting
            ctx.clearRect(0, 0, 512, 384);
            
            // Save context state
            ctx.save();
            
            // Flip the image vertically
            ctx.scale(1, -1);
            ctx.translate(0, -384);
            
            // Copy the VRM canvas content to our texture canvas
            ctx.drawImage(vrmCanvasRef.current, 0, 0, 512, 384);
            
            // Restore context state
            ctx.restore();
            
            canvasTexture.needsUpdate = true;
          }
        }

        // Smooth camera movement
        camera.position.x += (targetCameraX - camera.position.x) * 0.05;
        camera.position.y += (targetCameraY - camera.position.y) * 0.05;
        camera.position.z = Math.sqrt(9 - camera.position.x * camera.position.x);
        
        camera.lookAt(0, 0, 0);

        // Gentle floating animation
        computerGroup.position.y = Math.sin(time) * 0.005;

        // Power button glow
        const powerGlow = 0.5 + Math.sin(time * 5) * 0.3;
        powerButton.material.emissive.setHSL(0.33, 1, powerGlow * 0.5);

        renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (renderTargetRef.current) {
        renderTargetRef.current.dispose();
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative">
      <GlobalStyles />
      <div 
        ref={mountRef} 
        className="w-full h-screen bg-black"
      />
      
      {/* Hidden VRM Canvas - renders to texture */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <canvas 
          ref={vrmCanvasCallback} 
          width={512} 
          height={384}
          style={{ width: '512px', height: '384px' }}
        />
        
        {/* Loading Overlay for VRM */}
        {isLoading && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "512px",
            height: "384px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10
          }}>
            <div style={{
              width: "30px",
              height: "30px",
              border: "3px solid #333",
              borderTop: "3px solid #1D9BF0",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Computer3DWithVrm;