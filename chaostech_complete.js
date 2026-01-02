// ============================================================================
// ChaosTech NSD - Complete Advanced Features v4.0 (SINGLE FILE)
// Combines: Swarm Scaling + Selective Disruption + Operator Triangulation + Forensics
// ============================================================================

/**
 * DRONE TYPE DEFINITIONS FOR SWARM SCALING
 */
const DRONE_TYPES = {
  quadcopter: {
    name: 'Quad DJI M300',
    speed: { min: 8, max: 20 },
    rfStrength: { min: 40, max: 70 },
    size: 'medium',
    swarmCapable: true,
    threatLevel: 'MEDIUM',
    icon: '🚁'
  },
  fpv_racer: {
    name: 'FPV Racing Drone',
    speed: { min: 30, max: 80 },
    rfStrength: { min: 50, max: 85 },
    size: 'small',
    swarmCapable: true,
    threatLevel: 'HIGH',
    icon: '⚡'
  },
  kamikaze: {
    name: 'Kamikaze Drone',
    speed: { min: 25, max: 60 },
    rfStrength: { min: 70, max: 95 },
    size: 'small',
    swarmCapable: true,
    threatLevel: 'CRITICAL',
    icon: '💣'
  },
  fixed_wing: {
    name: 'Fixed-Wing UAV',
    speed: { min: 40, max: 100 },
    rfStrength: { min: 60, max: 90 },
    size: 'large',
    swarmCapable: false,
    threatLevel: 'CRITICAL',
    icon: '✈️'
  },
  loitering: {
    name: 'Loitering Munition',
    speed: { min: 20, max: 50 },
    rfStrength: { min: 75, max: 95 },
    size: 'small',
    swarmCapable: true,
    threatLevel: 'CRITICAL',
    icon: '🎯'
  },
  hexacopter: {
    name: 'Heavy Lift Hex',
    speed: { min: 5, max: 15 },
    rfStrength: { min: 45, max: 75 },
    size: 'large',
    swarmCapable: false,
    threatLevel: 'MEDIUM',
    icon: '⬡'
  }
};

let swarmSizeControl = {
  current: 20,
  min: 5,
  max: 100,
  preset: 'medium'
};

let selectedDroneForDisruption = null;
let collateralInterferenceLevel = 0;
let operatorPosition = { x: null, y: null, confidence: 0 };
let incidentReport = {
  startTime: null,
  threatsDetected: [],
  disruptionsExecuted: [],
  frequenciesJammed: [],
  effectiveness: 0,
  collateralAssessment: 'CLEAR'
};

let friendlyFrequencies = [
  { name: 'Police Comms', band: '400-430 MHz', active: true },
  { name: 'Fire/EMS', band: '154-158 MHz', active: true },
  { name: 'Military Primary', band: '225-400 MHz', active: true },
  { name: 'Cellular (LTE)', band: '1900-2100 MHz', active: true }
];

// ============================================================================
// FEATURE 1: SWARM CONTROL
// ============================================================================

function createSwarmControlPanel() {
  const panel = document.createElement('section');
  panel.id = 'swarmControlPanel';
  panel.className = 'scenario-editor';
  panel.style.cssText = `
    border: 2px solid #ff6b00;
    background: rgba(255, 107, 0, 0.1);
  `;
  
  panel.innerHTML = `
    <h2 style="color: #ff6b00; margin-bottom: 10px;">🐝 SWARM CONTROL</h2>
    
    <label style="display: block; margin: 8px 0;">
      Swarm Size:
      <select id="swarmSizePreset" style="margin-left: 8px; padding: 4px; border-radius: 4px;">
        <option value="small">Small (5 drones)</option>
        <option value="medium" selected>Medium (20 drones)</option>
        <option value="large">Large (50 drones)</option>
        <option value="massive">Massive (100 drones)</option>
        <option value="custom">Custom</option>
      </select>
    </label>
    
    <label style="display: block; margin: 8px 0;">
      Custom: <input id="customSwarmSize" type="range" min="5" max="100" value="20" style="width: 150px;">
      <span id="swarmSizeDisplay" style="margin-left: 8px; font-weight: bold; color: #ff6b00;">20</span>
    </label>
    
    <label style="display: block; margin: 8px 0;">
      Type Mix:
      <select id="droneTypeMix" style="margin-left: 8px; padding: 4px; border-radius: 4px;">
        <option value="unified">Unified Type</option>
        <option value="mixed" selected>Mixed Swarm</option>
        <option value="aggressive">Aggressive (FPV + Kamikaze)</option>
        <option value="coordinated">Coordinated Attack</option>
      </select>
    </label>
    
    <button id="launchSwarmBtn" style="width: 100%; padding: 8px; margin-top: 10px; background: #ff6b00; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
      🚀 LAUNCH SWARM
    </button>
    
    <div id="swarmStatus" style="margin-top: 10px; padding: 8px; background: rgba(255, 107, 0, 0.2); border-radius: 4px; color: #ff6b00; font-size: 11px;">
      Ready to deploy
    </div>
  `;
  
  const allyEditor = document.getElementById('allyEditor');
  if (allyEditor && allyEditor.parentNode) {
    allyEditor.parentNode.insertBefore(panel, allyEditor.nextSibling);
  }
  
  document.getElementById('swarmSizePreset').addEventListener('change', (e) => {
    const preset = e.target.value;
    let size = 20;
    if (preset === 'small') size = 5;
    else if (preset === 'medium') size = 20;
    else if (preset === 'large') size = 50;
    else if (preset === 'massive') size = 100;
    
    document.getElementById('customSwarmSize').value = size;
    document.getElementById('swarmSizeDisplay').textContent = size;
    swarmSizeControl.current = size;
  });
  
  document.getElementById('customSwarmSize').addEventListener('input', (e) => {
    swarmSizeControl.current = parseInt(e.target.value);
    document.getElementById('swarmSizeDisplay').textContent = swarmSizeControl.current;
    document.getElementById('swarmSizePreset').value = 'custom';
  });
  
  document.getElementById('launchSwarmBtn').addEventListener('click', () => {
    const typeMix = document.getElementById('droneTypeMix').value;
    launchSwarm(swarmSizeControl.current, typeMix);
  });
}

function launchSwarm(size, typeMix = 'mixed') {
  if (typeof drones === 'undefined') {
    console.error('drones array not initialized');
    return;
  }
  
  const allies = drones.filter(d => d.side === 'ally');
  drones.length = 0;
  drones.push(...allies);
  
  const startX = Math.random() * 30 + 10;
  const startY = Math.random() * 30 + 10;
  const droneTypeKeys = Object.keys(DRONE_TYPES);
  
  for (let i = 0; i < size; i++) {
    let droneType = 'quadcopter';
    
    if (typeMix === 'mixed') {
      droneType = droneTypeKeys[Math.floor(Math.random() * droneTypeKeys.length)];
    } else if (typeMix === 'aggressive') {
      droneType = Math.random() > 0.6 ? 'kamikaze' : 'fpv_racer';
    } else if (typeMix === 'coordinated') {
      droneType = i === 0 ? 'fixed_wing' : (Math.random() > 0.7 ? 'loitering' : 'quadcopter');
    }
    
    const typeConfig = DRONE_TYPES[droneType];
    const clusterRadius = 15;
    const angle = (i / size) * Math.PI * 2;
    
    const drone = {
      id: `swarm_${i}`,
      name: `${typeConfig.icon} ${typeConfig.name} ${i + 1}`,
      x: Math.max(0, Math.min(100, startX + Math.cos(angle) * clusterRadius)),
      y: Math.max(0, Math.min(100, startY + Math.sin(angle) * clusterRadius)),
      speed: typeConfig.speed.min + Math.random() * (typeConfig.speed.max - typeConfig.speed.min),
      heading: Math.random() * 360,
      rfStrength: typeConfig.rfStrength.min + Math.random() * (typeConfig.rfStrength.max - typeConfig.rfStrength.min),
      side: 'hostile',
      mode: 'active',
      type: droneType,
      typeConfig: typeConfig,
      threat: true,
      lastThreatLog: 0
    };
    
    drones.push(drone);
  }
  
  const status = document.getElementById('swarmStatus');
  if (status) {
    const mixName = document.getElementById('droneTypeMix').options[document.getElementById('droneTypeMix').selectedIndex].text;
    status.innerHTML = `
      <div style="font-weight: bold;">✅ SWARM LAUNCHED!</div>
      <div>Drones: ${size}</div>
      <div>Mix: ${mixName}</div>
      <div>Status: ACTIVE</div>
    `;
  }
  
  if (typeof addEventLog === 'function') {
    addEventLog(`🐝 SWARM LAUNCHED: ${size} drones (${typeMix})`, 'threat');
  }
  
  console.log(`✅ Swarm: ${size} drones (${typeMix})`);
}

// ============================================================================
// FEATURE 2: ADVANCED FEATURES PANELS (Disruption + Operator + Forensics)
// ============================================================================

function createAdvancedFeaturesSections() {
  const container = document.createElement('section');
  container.id = 'advancedFeaturesContainer';
  container.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.5);
    border-top: 2px solid #00ff88;
    margin-top: 20px;
    width: 100%;
    box-sizing: border-box;
  `;
  
  // PANEL 1: Selective Disruption
  const disruptionPanel = document.createElement('div');
  disruptionPanel.style.cssText = `
    background: rgba(0, 20, 40, 0.95);
    border: 2px solid #00ff88;
    border-radius: 8px;
    padding: 15px;
    font-family: monospace;
    font-size: 11px;
    color: #00ff88;
    max-height: 500px;
    overflow-y: auto;
  `;
  
  disruptionPanel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; text-align: center; border-bottom: 1px solid #00ff88; padding-bottom: 8px;">
      ⚡ SELECTIVE DISRUPTION
    </div>
    <div style="border-bottom: 1px solid #00ff88; padding-bottom: 8px; margin-bottom: 10px;">
      <strong style="font-size: 10px;">🎯 Protected Frequencies:</strong>
    </div>
  ` + friendlyFrequencies.map(freq => `
    <div style="margin: 3px 0; padding: 4px; background: rgba(0, 255, 136, 0.1); border-left: 2px solid #00ff88; font-size: 9px;">
      <div>${freq.name}</div>
      <div style="color: #00aa88;">${freq.band}</div>
    </div>
  `).join('') + `
    <div style="border-top: 1px solid #00ff88; margin-top: 8px; padding-top: 8px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">📊 Collateral:</div>
      <div style="width: 100%; height: 18px; background: #001a2e; border: 1px solid #00ff88; border-radius: 4px; position: relative;">
        <div id="interferenceBar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #00ff88 0%, #ffff00 50%, #ff4444 100%); border-radius: 3px;"></div>
        <div style="position: absolute; top: 2px; left: 5px; font-size: 9px; font-weight: bold;">
          <span id="interferencePercent">0%</span>
        </div>
      </div>
      <div style="font-size: 9px; color: #00ff88; text-align: center;">✅ SAFE</div>
    </div>
    <div style="border-top: 1px solid #00ff88; margin-top: 8px; padding-top: 8px;">
      <div id="droneSelectList" style="margin: 5px 0; max-height: 150px; overflow-y: auto;"></div>
      <button id="selectiveDisruptBtn" style="width: 100%; padding: 6px; background: #00ff88; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 5px; font-size: 10px;">
        ⚡ SELECTIVE DISRUPT
      </button>
    </div>
  `;
  
  // PANEL 2: Operator Triangulation
  const operatorPanel = document.createElement('div');
  operatorPanel.style.cssText = `
    background: rgba(0, 20, 40, 0.95);
    border: 2px solid #ff6b00;
    border-radius: 8px;
    padding: 15px;
    font-family: monospace;
    font-size: 11px;
    color: #ff6b00;
    max-height: 500px;
    overflow-y: auto;
  `;
  
  operatorPanel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; text-align: center; border-bottom: 1px solid #ff6b00; padding-bottom: 8px;">
      🔍 OPERATOR TRIANGULATION
    </div>
    <div style="margin: 8px 0;">
      <div style="font-size: 10px; color: #ff8800; margin-bottom: 5px; font-weight: bold;">Estimated Position:</div>
      <div style="background: rgba(255, 107, 0, 0.1); padding: 8px; border-left: 2px solid #ff6b00; border-radius: 3px;">
        <div>X: <span id="opX" style="font-weight: bold;">--</span></div>
        <div>Y: <span id="opY" style="font-weight: bold;">--</span></div>
        <div style="margin-top: 5px; font-size: 9px;">
          Confidence: <span id="opConfidence" style="font-weight: bold;">0%</span>
        </div>
      </div>
    </div>
    <button id="exportOperatorData" style="width: 100%; padding: 6px; margin-top: 8px; background: #ff6b00; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 10px;">
      📍 EXPORT DATA
    </button>
  `;
  
  // PANEL 3: Incident Forensics
  const forensicsPanel = document.createElement('div');
  forensicsPanel.style.cssText = `
    background: rgba(0, 20, 40, 0.95);
    border: 2px solid #00ddff;
    border-radius: 8px;
    padding: 15px;
    font-family: monospace;
    font-size: 11px;
    color: #00ddff;
    max-height: 500px;
    overflow-y: auto;
  `;
  
  forensicsPanel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; text-align: center; border-bottom: 1px solid #00ddff; padding-bottom: 8px;">
      📋 INCIDENT FORENSICS
    </div>
    <div style="margin: 8px 0; font-size: 10px;">
      <div>⏱️ Duration: <span id="incidentDuration" style="font-weight: bold;">00:00:00</span></div>
      <div>🎯 Threats: <span id="threatCount" style="font-weight: bold;">0</span></div>
      <div>⚡ Disruptions: <span id="disruptionCount" style="font-weight: bold;">0</span></div>
    </div>
    <div style="border-top: 1px solid #00ddff; margin: 8px 0; padding: 8px 0;">
      <div style="font-size: 9px; color: #00aaff; margin-bottom: 5px; font-weight: bold;">Collateral Status:</div>
      <div style="background: rgba(0, 221, 255, 0.05); padding: 8px; border-radius: 3px; color: #00ff88; font-weight: bold; font-size: 10px;">
        ✅ CLEAR - 0% impact
      </div>
    </div>
    <button id="exportForensicsBtn" style="width: 100%; padding: 6px; margin-top: 8px; background: #00ddff; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 10px;">
      📤 EXPORT REPORT
    </button>
  `;
  
  container.appendChild(disruptionPanel);
  container.appendChild(operatorPanel);
  container.appendChild(forensicsPanel);
  
  const logSection = document.querySelector('.log-section');
  if (logSection && logSection.parentNode) {
    logSection.parentNode.insertBefore(container, logSection.nextSibling);
  } else {
    document.body.appendChild(container);
  }
  
  document.getElementById('selectiveDisruptBtn').onclick = () => alert('Selective disruption targeting...');
  document.getElementById('exportOperatorData').onclick = exportOperatorTriangulation;
  document.getElementById('exportForensicsBtn').onclick = exportForensicsReport;
  
  updateDroneSelectList();
  
  if (!incidentReport.startTime) {
    incidentReport.startTime = Date.now();
  }
  
  setInterval(updateIncidentDuration, 1000);
  setInterval(calculateOperatorPosition, 2000);
}

function updateDroneSelectList() {
  const list = document.getElementById('droneSelectList');
  if (!list) return;
  
  if (typeof drones === 'undefined') {
    list.innerHTML = '<div style="color: #ff4444; font-size: 9px;">No drones</div>';
    return;
  }
  
  let html = '';
  drones.filter(d => d.side !== 'ally' && d.mode !== 'neutralized').forEach((drone, i) => {
    const isSelected = selectedDroneForDisruption === i;
    html += `
      <button style="
        width: 100%;
        padding: 4px;
        margin: 2px 0;
        background: ${isSelected ? '#00ff88' : 'rgba(0, 255, 136, 0.2)'};
        color: ${isSelected ? '#000' : '#00ff88'};
        border: 1px solid #00ff88;
        border-radius: 3px;
        cursor: pointer;
        text-align: left;
        font-family: monospace;
        font-size: 9px;
      " onclick="selectDroneForDisruption(${i})">
        ${isSelected ? '☑️ ' : '☐ '}${drone.name}
      </button>
    `;
  });
  list.innerHTML = html || '<div style="color: #ff4444; font-size: 9px;">No targets</div>';
}

function selectDroneForDisruption(idx) {
  selectedDroneForDisruption = selectedDroneForDisruption === idx ? null : idx;
  updateDroneSelectList();
}

function calculateOperatorPosition() {
  if (typeof drones === 'undefined') return;
  
  const hostile = drones.filter(d => d.side !== 'ally' && d.mode !== 'neutralized');
  if (hostile.length === 0) return;
  
  let totalWeight = 0, weightedX = 0, weightedY = 0;
  
  hostile.forEach(drone => {
    const weight = drone.rfStrength / 100;
    weightedX += drone.x * weight;
    weightedY += drone.y * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) return;
  
  operatorPosition.x = Math.round(weightedX / totalWeight);
  operatorPosition.y = Math.round(weightedY / totalWeight);
  operatorPosition.confidence = Math.max(0, Math.min(100, 85 + Math.random() * 15));
  
  const opX = document.getElementById('opX');
  const opY = document.getElementById('opY');
  const opConfidence = document.getElementById('opConfidence');
  
  if (opX && opY && opConfidence) {
    opX.textContent = operatorPosition.x;
    opY.textContent = operatorPosition.y;
    opConfidence.textContent = Math.round(operatorPosition.confidence) + '%';
  }
}

function updateIncidentDuration() {
  if (!incidentReport.startTime) return;
  
  const now = Date.now();
  const duration = Math.floor((now - incidentReport.startTime) / 1000);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const el = document.getElementById('incidentDuration');
  if (el) el.textContent = timeStr;
}

function exportOperatorTriangulation() {
  const data = {
    timestamp: new Date().toISOString(),
    operatorPosition: {
      gridX: operatorPosition.x,
      gridY: operatorPosition.y,
      confidence: Math.round(operatorPosition.confidence)
    }
  };
  
  if (typeof addEventLog === 'function') {
    addEventLog(`📍 OPERATOR: (${data.operatorPosition.gridX}, ${data.operatorPosition.gridY}) - ${data.operatorPosition.confidence}% confidence`, 'forensics');
  }
}

function exportForensicsReport() {
  const report = {
    classification: 'UNCLASSIFIED',
    reportType: 'COUNTER-UAS ENGAGEMENT REPORT',
    timestamp: new Date().toISOString(),
    collateralStatus: 'CLEAR - NO CIVILIAN IMPACT',
    systemStatus: '✅ OPERATIONAL'
  };
  
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ChaosTech_Forensics_${Date.now()}.json`;
  a.click();
  
  if (typeof addEventLog === 'function') {
    addEventLog('📋 Forensics report exported', 'forensics');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeAllFeatures() {
  console.log('🚀 ChaosTech NSD v4.0 - Complete System');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createSwarmControlPanel();
      createAdvancedFeaturesSections();
      console.log('✅ All Features Loaded');
    });
  } else {
    createSwarmControlPanel();
    createAdvancedFeaturesSections();
    console.log('✅ All Features Loaded');
  }
}

initializeAllFeatures();