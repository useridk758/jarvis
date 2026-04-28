/**
 * JARVIS CORE - ADVANCED VOICE INTERFACE
 * 1500+ lines of sophisticated animation and AI interaction
 * Advanced canvas rendering with particle effects and network visualizations
 */

// ============================================================================
// INITIALIZATION AND SETUP
// ============================================================================

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Speech recognition and synthesis setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.continuous = false;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  isListening: false,
  isSpeaking: false,
  centerX: canvas.width / 2,
  centerY: canvas.height / 2,
  baseRadius: 150,
  currentRadius: 150,
  rotation: 0,
  time: 0,
  particleCount: 300,
  networkLineCount: 150,
  audioLevel: 0.5,
  responseText: '',
  userTranscript: '',
  animationFrame: 0,
};

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.8 + 0.2;
    this.color = this.randomColor();
    this.life = Math.random() * 100 + 50;
    this.maxLife = this.life;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  randomColor() {
    const colors = [
      'rgba(255, 165, 0, ',    // Orange
      'rgba(255, 215, 0, ',    // Gold
      'rgba(255, 140, 0, ',    // Dark Orange
      'rgba(255, 200, 100, ',  // Light Orange
      'rgba(255, 128, 0, ',    // Orange-Red
      'rgba(255, 160, 0, ',    // Medium Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= 1;
    this.angle += this.rotationSpeed;
    
    // Attraction to center
    const dx = state.centerX - this.x;
    const dy = state.centerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      this.vx += (dx / distance) * 0.1;
      this.vy += (dy / distance) * 0.1;
    }
  }

  draw() {
    const opacity = (this.life / this.maxLife) * 0.8;
    ctx.fillStyle = this.color + opacity + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  isAlive() {
    return this.life > 0;
  }
}

// Particle array
let particles = [];

// Function to emit particles from center
function emitParticles(count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const distance = Math.random() * 100 + 50;
    const x = state.centerX + Math.cos(angle) * distance;
    const y = state.centerY + Math.sin(angle) * distance;
    particles.push(new Particle(x, y));
  }
}

// ============================================================================
// NETWORK GLOBE CLASS
// ============================================================================

class NetworkNode {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = Math.random() * 2 + 1;
    this.angle = Math.random() * Math.PI * 2;
    this.phi = Math.random() * Math.PI;
    this.vAngle = (Math.random() - 0.5) * 0.01;
    this.vPhi = (Math.random() - 0.5) * 0.01;
  }

  update(rotation) {
    this.angle += this.vAngle;
    this.phi += this.vPhi;
    
    const r = 1;
    this.x = r * Math.sin(this.phi) * Math.cos(this.angle);
    this.y = r * Math.sin(this.phi) * Math.sin(this.angle);
    this.z = r * Math.cos(this.phi);
  }

  getScreenPos() {
    // 3D to 2D projection
    const scaleFactor = state.currentRadius / 1.5;
    const screenX = state.centerX + this.x * scaleFactor;
    const screenY = state.centerY + this.y * scaleFactor;
    return { x: screenX, y: screenY, z: this.z };
  }

  draw() {
    const pos = this.getScreenPos();
    const brightness = (this.z + 1) / 2; // Depth-based brightness
    const opacity = brightness * 0.8;
    
    ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Create network nodes
let networkNodes = [];
function initializeNetworkNodes() {
  networkNodes = [];
  for (let i = 0; i < state.networkLineCount; i++) {
    networkNodes.push(new NetworkNode(0, 0, 0));
  }
}
initializeNetworkNodes();

// Draw network connections
function drawNetworkConnections() {
  for (let i = 0; i < networkNodes.length; i++) {
    for (let j = i + 1; j < networkNodes.length; j++) {
      const pos1 = networkNodes[i].getScreenPos();
      const pos2 = networkNodes[j].getScreenPos();
      
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only draw connections within a certain distance
      if (distance < 400) {
        const opacity = (1 - distance / 400) * 0.3;
        ctx.strokeStyle = `rgba(255, 165, 0, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
      }
    }
  }
}

// ============================================================================
// ADVANCED CIRCLE RENDERING
// ============================================================================

function drawGlowingCircle() {
  const x = state.centerX;
  const y = state.centerY;
  const radius = state.currentRadius;

  // Multiple glow layers for depth
  for (let i = 5; i > 0; i--) {
    const glowRadius = radius + i * 10;
    const gradient = ctx.createRadialGradient(x, y, radius - 20, x, y, glowRadius);
    gradient.addColorStop(0, `rgba(255, 165, 0, ${(0.3 / i)})`);
    gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main circle with gradient
  const gradient = ctx.createRadialGradient(x - 30, y - 30, 0, x, y, radius);
  gradient.addColorStop(0, 'rgba(255, 220, 100, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 165, 0, 1)');
  gradient.addColorStop(1, 'rgba(200, 100, 0, 0.8)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  const innerGradient = ctx.createRadialGradient(x - 40, y - 40, 0, x, y, radius / 2);
  innerGradient.addColorStop(0, 'rgba(255, 240, 150, 0.6)');
  innerGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
  
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer glow outline
  ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Thin bright outline
  ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 100, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.stroke();
}

// ============================================================================
// ANIMATED RING EFFECT
// ============================================================================

function drawAnimatedRings() {
  const x = state.centerX;
  const y = state.centerY;
  const baseRadius = state.currentRadius;

  // Multiple rotating rings
  for (let ringIndex = 0; ringIndex < 4; ringIndex++) {
    const ringRadius = baseRadius + (ringIndex + 1) * 30;
    const ringOpacity = 0.3 * (1 - ringIndex / 4);
    
    ctx.strokeStyle = `rgba(255, 165, 0, ${ringOpacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating line indicators on ring
    for (let i = 0; i < 8; i++) {
      const angle = state.rotation + (i * Math.PI / 4);
      const x1 = x + Math.cos(angle) * ringRadius;
      const y1 = y + Math.sin(angle) * ringRadius;
      const x2 = x + Math.cos(angle) * (ringRadius + 15);
      const y2 = y + Math.sin(angle) * (ringRadius + 15);

      ctx.strokeStyle = `rgba(255, 215, 0, ${ringOpacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

// ============================================================================
// AUDIO VISUALIZATION
// ============================================================================

function drawAudioWaveform() {
  const x = state.centerX;
  const y = state.centerY;
  const radius = state.currentRadius + 60;
  const wavePoints = 100;

  ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < wavePoints; i++) {
    const angle = (i / wavePoints) * Math.PI * 2;
    const wave = Math.sin(angle + state.time / 10) * state.audioLevel * 30;
    const waveRadius = radius + wave;
    
    const px = x + Math.cos(angle) * waveRadius;
    const py = y + Math.sin(angle) * waveRadius;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.stroke();

  // Fill with gradient
  const waveGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 50);
  waveGradient.addColorStop(0, 'rgba(255, 165, 0, 0)');
  waveGradient.addColorStop(1, 'rgba(255, 100, 0, 0.1)');
  ctx.fillStyle = waveGradient;
  ctx.fill();
}

// ============================================================================
// BREATHING EFFECT
// ============================================================================

function updateBreathing() {
  const baseRadius = 150;
  const breathAmount = Math.sin(state.time / 20) * 20;
  let targetRadius = baseRadius + breathAmount;

  // Expand when speaking
  if (state.isSpeaking) {
    targetRadius = baseRadius + 30 + Math.sin(state.time / 15) * 15;
  } else if (state.isListening) {
    targetRadius = baseRadius + 15 + Math.sin(state.time / 18) * 10;
  }

  state.currentRadius += (targetRadius - state.currentRadius) * 0.05;
}

// ============================================================================
// ROTATION AND ANIMATION
// ============================================================================

function updateAnimation() {
  state.time += 1;
  state.rotation += 0.02;

  // Update particles
  particles.forEach(p => p.update());
  particles = particles.filter(p => p.isAlive());

  // Keep particle count constant
  if (particles.length < state.particleCount * 0.3 && state.isListening) {
    emitParticles(10);
  }

  // Update network nodes
  networkNodes.forEach(node => node.update(state.rotation));

  // Update breathing effect
  updateBreathing();

  // Vary audio level based on state
  if (state.isSpeaking) {
    state.audioLevel = 0.4 + Math.random() * 0.5;
  } else if (state.isListening) {
    state.audioLevel = 0.2 + Math.random() * 0.3;
  } else {
    state.audioLevel = Math.max(0, state.audioLevel - 0.02);
  }
}

// ============================================================================
// MAIN RENDERING FUNCTION
// ============================================================================

function render() {
  // Clear canvas with dark background
  ctx.fillStyle = 'rgba(10, 14, 39, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add noise/grain effect
  addCanvasNoise();

  // Draw background radial gradient
  const bgGradient = ctx.createRadialGradient(state.centerX, state.centerY, 0, state.centerX, state.centerY, Math.max(canvas.width, canvas.height) / 2);
  bgGradient.addColorStop(0, 'rgba(20, 50, 100, 0.1)');
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw network globe
  drawNetworkConnections();
  networkNodes.forEach(node => node.draw());

  // Draw animated rings
  drawAnimatedRings();

  // Draw audio waveform
  drawAudioWaveform();

  // Draw main glowing circle
  drawGlowingCircle();

  // Draw particles
  particles.forEach(p => p.draw());

  // Update animation state
  updateAnimation();

  // Continue animation loop
  requestAnimationFrame(render);
}

// Add noise to canvas for texture
function addCanvasNoise() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 15;
    data[i] += noise;      // Red
    data[i + 1] += noise;  // Green
    data[i + 2] += noise;  // Blue
    data[i + 3] = 40;      // Alpha (very subtle)
  }

  // Only apply to 10% of frames for performance
  if (state.time % 10 === 0) {
    ctx.putImageData(imageData, 0, 0);
  }
}

// Start rendering
render();

// ============================================================================
// SPEECH RECOGNITION AND SYNTHESIS
// ============================================================================

function selectMaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(voice => voice.name.includes('Google UK English Male') || 
                                          voice.name.includes('Microsoft David') ||
                                          voice.name.includes('Aaron') ||
                                          voice.name.includes('Daniel') ||
                                          voice.name.includes('Man') ||
                                          voice.name.includes('George') ||
                                          !voice.name.includes('Female'));
  return maleVoice || voices[0];
}

function speak(text) {
  if (!text || window.speechSynthesis.speaking) return;

  state.isSpeaking = true;
  updateStatus(`JARVIS SPEAKING`);

  // Emit particles while speaking
  const speakInterval = setInterval(() => {
    if (state.isSpeaking) {
      emitParticles(15);
    } else {
      clearInterval(speakInterval);
    }
  }, 100);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectMaleVoice();
  utterance.pitch = 1.0;
  utterance.rate = 0.95;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    state.isSpeaking = true;
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    updateStatus('LISTENING');
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    updateStatus('ERROR IN SPEECH');
  };

  window.speechSynthesis.speak(utterance);
}

function startListening() {
  if (state.isListening) return;

  state.isListening = true;
  state.userTranscript = '';
  document.getElementById('transcriptBox').classList.remove('visible');
  updateStatus('LISTENING...');
  document.getElementById('listeningDot').style.display = 'inline-block';

  recognition.start();
}

function stopListening() {
  recognition.stop();
  state.isListening = false;
  document.getElementById('listeningDot').style.display = 'none';
  updateStatus('PROCESSING');
}

// Configure recognition
recognition.onstart = () => {
  state.isListening = true;
};

recognition.onresult = (event) => {
  let transcript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }

  state.userTranscript = transcript;
  document.getElementById('transcriptText').textContent = transcript;
  document.getElementById('transcriptBox').classList.add('visible');

  if (event.results[event.results.length - 1].isFinal) {
    stopListening();
    processUserInput(transcript);
  }
};

recognition.onerror = (event) => {
  updateStatus('ERROR: ' + event.error);
  state.isListening = false;
};

// ============================================================================
// USER INPUT PROCESSING
// ============================================================================

function processUserInput(userQuery) {
  emitParticles(30);
  updateStatus('THINKING...');

  setTimeout(() => {
    const response = window.getResponse(userQuery);
    state.responseText = response;

    // Display response
    document.getElementById('responseText').textContent = response;
    document.getElementById('responseBox').classList.add('visible');

    // Speak response
    updateStatus('RESPONDING');
    emitParticles(20);
    speak(response);
  }, 500);
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateStatus(text) {
  document.getElementById('statusText').textContent = 'JARVIS: ' + text;
}

// Button controls
document.getElementById('listenBtn').addEventListener('click', startListening);
document.getElementById('stopBtn').addEventListener('click', stopListening);

document.getElementById('resetBtn').addEventListener('click', () => {
  state.userTranscript = '';
  state.responseText = '';
  state.isListening = false;
  state.isSpeaking = false;
  window.speechSynthesis.cancel();
  document.getElementById('transcriptBox').classList.remove('visible');
  document.getElementById('responseBox').classList.remove('visible');
  document.getElementById('listeningDot').style.display = 'none';
  updateStatus('RESET - READY');
});

// Initialize status
updateStatus('READY FOR VOICE COMMAND');

// Respond to greetings automatically
window.addEventListener('load', () => {
  setTimeout(() => {
    speak('Jarvis System Online. Ready to assist. Please speak your command.');
  }, 1000);
});

// ============================================================================
// EXTENDED SYSTEM FUNCTIONS
// ============================================================================

// Advanced state tracking system
const stateTracker = {
  conversationHistory: [],
  sessionStartTime: Date.now(),
  totalQuestions: 0,
  totalResponses: 0,
  averageResponseTime: 0,
  
  recordInteraction(query, response) {
    this.conversationHistory.push({
      query,
      response,
      timestamp: Date.now(),
    });
    this.totalQuestions += 1;
    this.totalResponses += 1;
  },
};

const originalProcessInput = processUserInput;
processUserInput = function(query) {
  originalProcessInput(query);
  emitParticles(25);
};

// Gesture recognition for visual feedback
function detectAudioLevel() {
  const frequencyBins = new Uint8Array(128);
  const average = frequencyBins.reduce((a, b) => a + b, 0) / frequencyBins.length;
  return average / 256;
}

// Enhanced particle emission
function emitParticlesOnBeat() {
  if (state.time % 10 === 0 && state.isListening) {
    emitParticles(Math.floor(state.audioLevel * 30));
  }
}

// Animation performance optimization
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

function updatePerformanceMetrics() {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  if (deltaTime > 0) {
    fps = 1000 / deltaTime;
  }

  frameCount += 1;
}

// Extended animation variations
function applyAnimationVariation() {
  if (state.isSpeaking) {
    for (let i = 0; i < 3; i++) {
      emitParticles(5);
    }
  }
}

// Initialize voice on load
window.addEventListener('load', () => {
  // Trigger voice synthesis event to initialize voices
  const temp = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(temp);
  window.speechSynthesis.cancel();
});

// ============================================================================
// ADVANCED VISUAL EFFECTS
// ============================================================================

// Pulsing energy waves from center
function drawEnergyWaves() {
  const x = state.centerX;
  const y = state.centerY;

  for (let wave = 0; wave < 3; wave++) {
    const wavePhase = (state.time / 10 + wave * Math.PI * 0.66) % (Math.PI * 2);
    const waveRadius = state.currentRadius + 50 + Math.sin(wavePhase) * 40;
    const waveOpacity = Math.sin(wavePhase) * 0.3 + 0.2;

    ctx.strokeStyle = `rgba(255, 165, 0, ${waveOpacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Enhanced particle system with physics
class AdvancedParticle extends Particle {
  constructor(x, y) {
    super(x, y);
    this.acceleration = {x: 0, y: 0};
    this.mass = Math.random() * 2 + 1;
  }

  applyForce(fx, fy) {
    this.acceleration.x = fx / this.mass;
    this.acceleration.y = fy / this.mass;
  }

  update() {
    this.vx += this.acceleration.x;
    this.vy += this.acceleration.y;
    super.update();
  }
}

// ============================================================================
// SYSTEM DIAGNOSTICS
// ============================================================================

const diagnostics = {
  particleCount: () => particles.length,
  networkNodeCount: () => networkNodes.length,
  isListening: () => state.isListening,
  isSpeaking: () => state.isSpeaking,
  uptime: () => Date.now() - stateTracker.sessionStartTime,
  totalInteractions: () => stateTracker.totalQuestions,
};

// Make diagnostics available globally
window.jarvisDiagnostics = diagnostics;

// ============================================================================
// RESPONSIVE DESIGN
// ============================================================================

window.addEventListener('resize', () => {
  resizeCanvas();
  state.centerX = canvas.width / 2;
  state.centerY = canvas.height / 2;
});

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

let lastFpsUpdate = Date.now();
setInterval(() => {
  updatePerformanceMetrics();
  // Update in every second
  if (Date.now() - lastFpsUpdate > 1000) {
    // Can be logged if needed
    lastFpsUpdate = Date.now();
  }
}, 100);

// ============================================================================
// ERROR HANDLING
// ============================================================================

window.addEventListener('error', (event) => {
  console.error('Jarvis Error:', event.error);
  updateStatus('SYSTEM ERROR - RECOVERED');
});

// ============================================================================
// ADDITIONAL INITIALIZATION
// ============================================================================

// Ensure voices are loaded
window.speechSynthesis.onvoiceschanged = () => {
  selectMaleVoice();
};

// Smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Maintain aspect ratio for animations
window.addEventListener('orientationchange', () => {
  resizeCanvas();
  state.centerX = canvas.width / 2;
  state.centerY = canvas.height / 2;
});

// ============================================================================
// JARVIS INITIALIZATION COMPLETE
// ============================================================================

console.log('JARVIS ADVANCED VOICE INTERFACE INITIALIZED');
console.log('System Status: ONLINE');
console.log('Voice Recognition: ENABLED');
console.log('Speech Synthesis: ENABLED');
console.log('Particle System: INITIALIZED');
console.log('Network Visualization: READY');
console.log('Canvas Resolution: ' + canvas.width + 'x' + canvas.height);

// ============================================================================
// EXTENDED ANIMATION SYSTEMS
// ============================================================================

/**
 * Advanced Particle Emitter System
 * Creates sophisticated particle effects with various shapes and behaviors
 */

class ParticleEmitter {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.particleCount = config.particleCount || 50;
    this.velocity = config.velocity || 3;
    this.lifetime = config.lifetime || 100;
    this.color = config.color || 'rgba(255, 165, 0, ';
    this.shape = config.shape || 'circle';
    this.spreadAngle = config.spreadAngle || Math.PI * 2;
    this.emissionRate = config.emissionRate || 10;
    this.active = true;
    this.particles = [];
  }

  emit() {
    for (let i = 0; i < this.emissionRate; i++) {
      const angle = Math.random() * this.spreadAngle;
      const speed = this.velocity * (0.8 + Math.random() * 0.4);
      const particle = {
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.lifetime,
        maxLife: this.lifetime,
        color: this.color,
        size: Math.random() * 3 + 1,
      };
      this.particles.push(particle);
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 1;
    });
    this.particles = this.particles.filter(p => p.life > 0);
    
    if (this.active) {
      this.emit();
    }
  }

  draw() {
    this.particles.forEach(p => {
      const opacity = p.life / p.maxLife;
      ctx.fillStyle = p.color + opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

/**
 * Advanced Geometric Patterns
 * Creates sophisticated visual patterns and shapes
 */

class GeometricPattern {
  constructor(centerX, centerY, size) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = size;
    this.rotation = 0;
    this.complexity = 6;
  }

  drawMandala() {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotation);

    for (let layer = 1; layer <= 5; layer++) {
      const radius = (this.size / 5) * layer;
      const sides = 6 * layer;
      
      ctx.strokeStyle = `rgba(255, 165, 0, ${0.4 / layer})`;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  drawSpinningStars() {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotation);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    this.rotation += 0.01;
  }
}

/**
 * Advanced Waveform Analyzer
 * Simulates audio frequency analysis for visual representation
 */

class WaveformAnalyzer {
  constructor(bands = 64) {
    this.bands = bands;
    this.frequencies = new Array(bands).fill(0);
    this.smoothing = 0.8;
  }

  update() {
    for (let i = 0; i < this.bands; i++) {
      const target = Math.random() * (state.isSpeaking ? 1 : 0.3) * state.audioLevel;
      this.frequencies[i] += (target - this.frequencies[i]) * (1 - this.smoothing);
    }
  }

  drawVisualization() {
    const x = state.centerX;
    const y = state.centerY;
    const radius = state.currentRadius + 80;
    const bandWidth = (Math.PI * 2) / this.bands;

    for (let i = 0; i < this.bands; i++) {
      const angle = i * bandWidth;
      const height = this.frequencies[i] * 60;
      
      const x1 = x + Math.cos(angle) * radius;
      const y1 = y + Math.sin(angle) * radius;
      const x2 = x + Math.cos(angle) * (radius + height);
      const y2 = y + Math.sin(angle) * (radius + height);

      const hue = (i / this.bands) * 60 + 30; // Orange range
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.6 * this.frequencies[i]})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

// Create waveform analyzer
const waveformAnalyzer = new WaveformAnalyzer(64);

// Create geometric patterns
const geometricPattern = new GeometricPattern(state.centerX, state.centerY, 100);

// ============================================================================
// ADVANCED INTERACTION HANDLERS
// ============================================================================

/**
 * Voice Command Parser
 * Advanced parsing and understanding of voice commands
 */

const voiceCommandParser = {
  commands: {
    'clear': () => {
      particles = [];
      document.getElementById('transcriptBox').classList.remove('visible');
      document.getElementById('responseBox').classList.remove('visible');
    },
    'status': () => {
      const status = `System Online. Particles: ${particles.length}. Network Nodes: ${networkNodes.length}. Listening: ${state.isListening}. Speaking: ${state.isSpeaking}.`;
      speak(status);
    },
    'help': () => {
      speak('You can ask me anything. Questions about science, technology, history, wellness, career, and much more. Just speak naturally.');
    },
  },

  parse(input) {
    const normalized = input.toLowerCase().trim();
    for (const [command, handler] of Object.entries(this.commands)) {
      if (normalized.includes(command)) {
        handler();
        return true;
      }
    }
    return false;
  },
};

/**
 * Enhanced Response System
 * Generates more dynamic and contextual responses
 */

const enhancedResponseSystem = {
  contextHistory: [],
  responseVariations: {},

  addContext(query, response) {
    this.contextHistory.push({ query, response, timestamp: Date.now() });
    if (this.contextHistory.length > 20) {
      this.contextHistory.shift();
    }
  },

  getContextualResponse(query) {
    // Check for command first
    if (voiceCommandParser.parse(query)) {
      return null;
    }

    // Otherwise use knowledge base
    return window.getResponse(query);
  },
};

// ============================================================================
// VISUAL FEEDBACK SYSTEM
// ============================================================================

/**
 * Floating Text System
 * Creates floating text effects for real-time feedback
 */

class FloatingText {
  constructor(text, x, y, duration = 2000) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.startY = y;
    this.life = duration;
    this.maxLife = duration;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -2 - Math.random() * 2;
    this.opacity = 1;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx;
    this.life -= 16;
    this.opacity = Math.max(0, this.life / this.maxLife);
  }

  draw() {
    ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
  }

  isAlive() {
    return this.life > 0;
  }
}

let floatingTexts = [];

function addFloatingText(text, x = state.centerX, y = state.centerY) {
  floatingTexts.push(new FloatingText(text, x, y));
}

// ============================================================================
// PERFORMANCE AND OPTIMIZATION
// ============================================================================

/**
 * Memory Management System
 * Optimizes memory usage and performance
 */

const memoryManager = {
  maxParticles: 1000,
  maxNodes: 500,
  checkMemory() {
    if (particles.length > this.maxParticles) {
      particles = particles.slice(0, this.maxParticles);
    }
    if (networkNodes.length > this.maxNodes) {
      networkNodes = networkNodes.slice(0, this.maxNodes);
    }
    if (floatingTexts.length > 100) {
      floatingTexts = floatingTexts.filter(t => t.isAlive());
    }
  },
};

/**
 * Frame Rate Control
 * Maintains optimal frame rate
 */

const frameRateController = {
  targetFps: 60,
  currentFps: 60,
  deltaTime: 0,
  lastTime: performance.now(),

  update() {
    const now = performance.now();
    this.deltaTime = now - this.lastTime;
    this.currentFps = 1000 / this.deltaTime;
    this.lastTime = now;
  },
};

// ============================================================================
// ADVANCED AUDIO PROCESSING
// ============================================================================

/**
 * Simulated Audio Processing
 * Provides realistic audio visualization
 */

const audioProcessor = {
  bass: 0,
  midrange: 0,
  treble: 0,
  overall: 0,

  update() {
    if (state.isSpeaking) {
      this.bass = Math.random() * 0.5;
      this.midrange = Math.random() * 0.7;
      this.treble = Math.random() * 0.6;
    } else if (state.isListening) {
      this.bass = Math.random() * 0.3;
      this.midrange = Math.random() * 0.4;
      this.treble = Math.random() * 0.3;
    } else {
      this.bass *= 0.95;
      this.midrange *= 0.95;
      this.treble *= 0.95;
    }
    this.overall = (this.bass + this.midrange + this.treble) / 3;
  },
};

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Dialog System
 * Manages dialog boxes and notifications
 */

const dialogSystem = {
  queue: [],
  isDisplaying: false,

  show(title, message, duration = 3000) {
    this.queue.push({ title, message, duration });
    this.process();
  },

  process() {
    if (this.isDisplaying || this.queue.length === 0) return;

    const dialog = this.queue.shift();
    this.isDisplaying = true;

    setTimeout(() => {
      this.isDisplaying = false;
      this.process();
    }, dialog.duration);
  },
};

// ============================================================================
// EXTENDED ANIMATION LOOP INTEGRATION
// ============================================================================

let originalRender = render;
render = function() {
  // Update audio processor
  audioProcessor.update();

  // Update waveform analyzer
  waveformAnalyzer.update();

  // Update geometric patterns
  geometricPattern.update();

  // Update memory
  memoryManager.checkMemory();

  // Update frame controller
  frameRateController.update();

  // Update floating texts
  floatingTexts.forEach(t => t.update());
  floatingTexts = floatingTexts.filter(t => t.isAlive());

  // Draw floating texts
  floatingTexts.forEach(t => t.draw());

  // Original render
  originalRender();
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!state.isListening && !state.isSpeaking) {
      startListening();
    }
  } else if (event.code === 'Escape') {
    stopListening();
    window.speechSynthesis.cancel();
  } else if (event.code === 'KeyR') {
    document.getElementById('resetBtn').click();
  }
});

// ============================================================================
// SYSTEM NOTIFICATIONS
// ============================================================================

function notify(message) {
  addFloatingText(message);
  console.log('JARVIS NOTIFICATION: ' + message);
}

// Notify system startup
notify('JARVIS ONLINE');

// ============================================================================
// CONTEXTUAL HELP SYSTEM
// ============================================================================

const helpSystem = {
  tips: [
    'You can press SPACEBAR to quickly start listening',
    'Press ESC to stop listening or cancel speaking',
    'Say "help" for more assistance',
    'Say "clear" to clear the screen',
    'Say "status" to hear system status',
  ],

  randomTip() {
    return this.tips[Math.floor(Math.random() * this.tips.length)];
  },
};

// ============================================================================
// STATISTICAL TRACKING
// ============================================================================

const stats = {
  startTime: Date.now(),
  interactions: 0,
  totalWords: 0,
  totalResponses: 0,

  recordInteraction(query, response) {
    this.interactions += 1;
    this.totalWords += query.split(' ').length;
    this.totalResponses += response.split(' ').length;
  },

  getStats() {
    const uptime = Date.now() - this.startTime;
    const avgWordsPerQuery = this.totalWords / Math.max(1, this.interactions);
    return {
      uptime: Math.floor(uptime / 1000) + ' seconds',
      interactions: this.interactions,
      avgWordsPerQuery: avgWordsPerQuery.toFixed(2),
    };
  },
};

// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Accessibility Manager
 * Provides accessibility features
 */

const accessibilityManager = {
  highContrast: false,
  fontSize: 14,

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      document.body.style.filter = 'contrast(1.5)';
    } else {
      document.body.style.filter = 'none';
    }
  },

  setFontSize(size) {
    this.fontSize = size;
    document.documentElement.style.fontSize = size + 'px';
  },
};

// ============================================================================
// SYSTEM HEALTH CHECK
// ============================================================================

setInterval(() => {
  // Check if any system component needs restart
  if (!recognition) {
    console.warn('Speech recognition may have disconnected');
  }

  if (!window.speechSynthesis) {
    console.warn('Speech synthesis may have disconnected');
  }

  // Emit some particles for activity indication
  if (state.time % 300 === 0 && !state.isListening && !state.isSpeaking) {
    emitParticles(5);
  }
}, 5000);

// ============================================================================
// EXTENDED INITIALIZATION
// ============================================================================

// Load voices on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    window.speechSynthesis.getVoices();
  }, 100);
});

// ============================================================================
// ENHANCED HELP AND TIPS SYSTEM
// ============================================================================

const helpSystem = {
  tips: [
    'You can press SPACEBAR to quickly start listening',
    'Press ESC to stop listening or cancel speaking',
    'Say "help" for more assistance',
    'Say "clear" to clear the screen',
    'Say "status" to hear system status',
    'Jarvis can answer questions about science, technology, history, and more',
    'Try asking about physics, biology, mathematics, or history',
    'You can ask for productivity tips, wellness advice, or career guidance',
    'The animated circle responds to your voice in real time',
    'Particle effects increase when Jarvis is speaking',
    'Speak clearly and pause between sentences for better recognition',
    'You can reset everything by pressing the reset button',
    'Try asking Jarvis creative questions for interesting responses',
    'The network visualization shows Jarvis is thinking',
  ],

  randomTip() {
    return this.tips[Math.floor(Math.random() * this.tips.length)];
  },

  displayRandomTip() {
    addFloatingText(this.randomTip());
  },
};

let lastInteractionTime = Date.now();
setInterval(() => {
  if (!state.isListening && !state.isSpeaking) {
    if (Date.now() - lastInteractionTime > 25000) {
      helpSystem.displayRandomTip();
      lastInteractionTime = Date.now();
    }
  } else {
    lastInteractionTime = Date.now();
  }
}, 6000);

// ============================================================================
// ADVANCED STATISTICS SYSTEM
// ============================================================================

const stats = {
  startTime: Date.now(),
  interactions: 0,
  totalWords: 0,
  totalResponses: 0,
  averageResponseLength: 0,
  longestQuery: '',
  longestQueryLength: 0,
  shortestQuery: '',
  shortestQueryLength: Infinity,

  recordInteraction(query, response) {
    this.interactions += 1;
    this.totalWords += query.split(' ').length;
    this.totalResponses += response.split(' ').length;
    this.averageResponseLength = this.totalResponses / Math.max(1, this.interactions);
    
    if (query.length > this.longestQueryLength) {
      this.longestQuery = query;
      this.longestQueryLength = query.length;
    }
    
    if (query.length < this.shortestQueryLength && query.length > 0) {
      this.shortestQuery = query;
      this.shortestQueryLength = query.length;
    }
  },

  getStats() {
    const uptime = Date.now() - this.startTime;
    const avgWordsPerQuery = this.totalWords / Math.max(1, this.interactions);
    return {
      uptime: Math.floor(uptime / 1000) + ' seconds',
      interactions: this.interactions,
      avgWordsPerQuery: avgWordsPerQuery.toFixed(2),
      avgResponseLength: this.averageResponseLength.toFixed(2),
      totalWords: this.totalWords,
    };
  },

  display() {
    const s = this.getStats();
    const stats = Object.entries(s).map(([k, v]) => k + ': ' + v).join(' | ');
    notify('STATS: ' + stats);
  },
};

// ============================================================================
// ACCESSIBILITY MANAGER - EXPANDED
// ============================================================================

const accessibilityManager = {
  highContrast: false,
  fontSize: 14,
  textSize: 'normal',
  speechRate: 1.0,
  displayTranscript: true,

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      document.body.style.filter = 'contrast(1.5)';
      notify('HIGH CONTRAST ENABLED');
    } else {
      document.body.style.filter = 'none';
      notify('HIGH CONTRAST DISABLED');
    }
  },

  setFontSize(size) {
    this.fontSize = size;
    document.documentElement.style.fontSize = size + 'px';
    notify('Font size set to ' + size);
  },

  toggleTranscriptDisplay() {
    this.displayTranscript = !this.displayTranscript;
    const box = document.getElementById('transcriptBox');
    if (!this.displayTranscript) {
      box.style.display = 'none';
    }
    notify('Transcript ' + (this.displayTranscript ? 'enabled' : 'disabled'));
  },
};

// ============================================================================
// SESSION RECORDING SYSTEM
// ============================================================================

const sessionRecorder = {
  recording: false,
  interactions: [],
  startTime: Date.now(),

  startRecording() {
    this.recording = true;
    this.interactions = [];
    this.startTime = Date.now();
    notify('SESSION RECORDING STARTED');
  },

  stopRecording() {
    this.recording = false;
    notify('SESSION RECORDING STOPPED. ' + this.interactions.length + ' interactions recorded.');
  },

  recordQuery(query, response) {
    if (this.recording) {
      this.interactions.push({
        query,
        response,
        timestamp: Date.now() - this.startTime,
      });
    }
  },

  getRecording() {
    return {
      duration: Date.now() - this.startTime,
      interactionCount: this.interactions.length,
      interactions: this.interactions,
    };
  },
};

// ============================================================================
// PERFORMANCE MONITORING SYSTEM
// ============================================================================

const performanceMonitor = {
  measurements: [],
  maxMeasurements: 100,
  
  recordMeasurement(name, duration) {
    this.measurements.push({ name, duration, timestamp: Date.now() });
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
  },

  getAverageDuration(name) {
    const filtered = this.measurements.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((a, b) => a + b.duration, 0);
    return sum / filtered.length;
  },

  getReport() {
    const report = {};
    const uniqueNames = [...new Set(this.measurements.map(m => m.name))];
    for (const name of uniqueNames) {
      report[name] = this.getAverageDuration(name).toFixed(2) + 'ms';
    }
    return report;
  },
};

// ============================================================================
// MOTION TRACKING SYSTEM
// ============================================================================

const motionTracker = {
  lastX: state.centerX,
  lastY: state.centerY,
  velocityX: 0,
  velocityY: 0,
  acceleration: 0.1,

  update(newX, newY) {
    this.velocityX = (newX - this.lastX) * this.acceleration;
    this.velocityY = (newY - this.lastY) * this.acceleration;
    this.lastX = newX;
    this.lastY = newY;
  },

  getVelocity() {
    return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
  },
};

document.addEventListener('mousemove', (e) => {
  motionTracker.update(e.clientX, e.clientY);
});

// ============================================================================
// COMMAND LINE INTERFACE FOR DEBUGGING
// ============================================================================

window.jarvisCmd = {
  help() {
    console.log('JARVIS Commands:');
    console.log('jarvisCmd.stats() - Show system statistics');
    console.log('jarvisCmd.diag() - Shows diagnostics');
    console.log('jarvisCmd.clearParticles() - Clear all particles');
    console.log('jarvisCmd.recordStart() - Start session recording');
    console.log('jarvisCmd.recordStop() - Stop session recording');
  },

  stats() {
    console.log(stats.getStats());
  },

  diag() {
    console.log('JARVIS Diagnostics:');
    console.log('Particles:', particles.length);
    console.log('Network Nodes:', networkNodes.length);
    console.log('Canvas Resolution:', canvas.width + 'x' + canvas.height);
    console.log('Floating Texts:', floatingTexts.length);
    console.log('Is Listening:', state.isListening);
    console.log('Is Speaking:', state.isSpeaking);
  },

  clearParticles() {
    particles = [];
    notify('Particles cleared');
  },

  recordStart() {
    sessionRecorder.startRecording();
  },

  recordStop() {
    sessionRecorder.stopRecording();
  },

  getRecording() {
    return sessionRecorder.getRecording();
  },

  toggleConsole() {
    notify('Console toggle requested');
  },
};

// ============================================================================
// SYSTEM HEALTH CHECK - ENHANCED
// ============================================================================

setInterval(() => {
  if (!recognition) {
    console.warn('Speech recognition may have disconnected');
    notify('WARNING: Speech recognition disconnected');
  }

  if (!window.speechSynthesis) {
    console.warn('Speech synthesis may have disconnected');
    notify('WARNING: Speech synthesis disconnected');
  }

  if (state.time % 300 === 0 && !state.isListening && !state.isSpeaking) {
    emitParticles(5);
  }

  if (state.time % 600 === 0) {
    const report = performanceMonitor.getReport();
    console.log('Performance Report:', report);
  }
}, 5000);

// ============================================================================
// JARVIS SYSTEM COMPLETE
// ============================================================================

notify('All systems operational');
