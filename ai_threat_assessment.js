// ============================================================================
// ChaosTech NSD - Complete AI Threat Assessment & Event Logging System
// Add this as a NEW FILE: ai_threat_assessment.js
// ============================================================================

/**
 * ChaosTech NSD - AI Threat Assessment Module v2.0
 * Calculates real-time threat scores for all detected drones
 * Integrates with event logging and visualization
 */

// ⭐ Global event log storage
let eventLogEntries = [];
const MAX_LOG_ENTRIES = 500;

// ⭐ AI THREAT ASSESSMENT FUNCTION
function decideDroneStatus(drone) {
  /**
   * ChaosTech NSD - AI Threat Assessment Engine
   * Calculates threat score (0-100) based on multiple threat vectors
   * 
   * Returns: { threat: boolean, score: 0-100, level: string, ... }
   */
  
  const rf = drone.rfStrength || 0;
  const speed = drone.speed || 0;
  const x = drone.x || 50;
  const y = drone.y || 50;
  
  // Calculate distance to base center
  const distToBase = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
  
  // ⭐ RF SIGNAL ANALYSIS (40% weight)
  let rfScore = 0;
  if (rf > 85) rfScore = 40;        // Strong RF signature = HIGH threat
  else if (rf > 70) rfScore = 30;   // Medium RF
  else if (rf > 50) rfScore = 15;   // Weak RF
  else rfScore = 5;                 // Very weak RF
  
  // ⭐ SPEED ANALYSIS (25% weight)
  let speedScore = 0;
  if (speed > 25) speedScore = 25;  // Fast approaching = HIGH threat
  else if (speed > 20) speedScore = 20;
  else if (speed > 10) speedScore = 10;
  else speedScore = 0;              // Slow/hovering = lower threat
  
  // ⭐ PROXIMITY ANALYSIS (20% weight)
  let proximityScore = 0;
  if (distToBase < 15) proximityScore = 20;   // TOO CLOSE! Critical threat
  else if (distToBase < 30) proximityScore = 15;
  else if (distToBase < 50) proximityScore = 8;
  else proximityScore = 0;
  
  // ⭐ SWARM DETECTION (15% weight)
  let swarmScore = 0;
  if (typeof drones !== 'undefined' && drones.length > 3) {
    // Multiple drones detected = coordinated swarm = HIGH threat
    swarmScore = 15;
  } else {
    swarmScore = 0;
  }
  
  // ⭐ TOTAL THREAT SCORE (0-100)
  const totalScore = rfScore + speedScore + proximityScore + swarmScore;
  
  // ⭐ THREAT LEVEL CLASSIFICATION
  let threatLevel = 'SAFE';
  if (totalScore >= 81) threatLevel = 'CRITICAL';
  else if (totalScore >= 61) threatLevel = 'HIGH';
  else if (totalScore >= 31) threatLevel = 'MEDIUM';
  else threatLevel = 'LOW';
  
  return {
    score: Math.min(100, totalScore),
    threat: totalScore > 50,
    level: threatLevel,
    rfScore,
    speedScore,
    proximityScore,
    swarmScore,
    distToBase: Math.round(distToBase)
  };
}

// ⭐ ADD EVENT LOG FUNCTION (UNIVERSAL)
function addEventLog(message, category = 'all') {
  /**
   * Add entry to event log
   * Works with or without existing addEventLog function
   */
  
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = {
    timestamp,
    message,
    category,
    fullMessage: `[${timestamp} pm] ${message}`
  };
  
  // Store in array
  eventLogEntries.push(logEntry);
  if (eventLogEntries.length > MAX_LOG_ENTRIES) {
    eventLogEntries.shift();
  }
  
  // Add to DOM if log element exists
  const logElement = document.getElementById('log');
  if (logElement) {
    const logLine = document.createElement('div');
    logLine.className = 'log-line';
    logLine.dataset.category = category;
    logLine.textContent = logEntry.fullMessage;
    logElement.appendChild(logLine);
    
    // Auto-scroll to bottom
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  // Console log
  console.log(`[${category.toUpperCase()}] ${message}`);
}

// ⭐ LOG AI THREAT ASSESSMENT
function logAIThreatAssessment(drone, status) {
  /**
   * Log AI threat assessment to event log
   * Shows drone's RF signature, distance, and calculated threat score
   */
  
  const threatEmoji = status.score >= 81 ? '🦟' : 
                     status.score >= 61 ? '🟠' : 
                     status.score >= 31 ? '🟡' : '🟢';
  
  const message = `AI THREAT: ${drone.name} (RF: ${drone.rfStrength}, Dist: ${status.distToBase}m, Score: ${status.score}/100, Level: ${status.level})`;
  
  addEventLog(`${threatEmoji} ${message}`, 'threat');
}

// ⭐ ASSESS ALL DRONE THREATS
function assessAllDroneThreats() {
  /**
   * Calculate threat status for all active drones
   * Run this in your main animation loop
   */
  
  if (typeof drones === 'undefined') return;
  
  drones.forEach(drone => {
    // Skip if drone is already neutralized or jammed
    if (drone.mode === 'neutralized' || drone.mode === 'jammed') return;
    
    // Skip allied drones
    if (drone.side === 'ally') return;
    
    // Calculate threat status
    const status = decideDroneStatus(drone);
    
    // Store status on drone for visualization
    drone.threatStatus = status;
    
    // Log if threat score is above 35 and hasn't been logged recently
    if (status.score >= 35) {
      const now = Date.now();
      const lastLog = drone.lastThreatLog || 0;
      
      // Only log if 3+ seconds have passed since last log (reduces spam)
      if (now - lastLog > 3000) {
        logAIThreatAssessment(drone, status);
        drone.lastThreatLog = now;
      }
    }
  });
}

// ⭐ RUN THREAT ASSESSMENT EVERY 1 SECOND
let threatAssessmentInterval = setInterval(() => {
  assessAllDroneThreats();
}, 1000);

// ⭐ STARTUP MESSAGE
console.log('✅ ChaosTech NSD - AI Threat Assessment System v2.0 LOADED');
console.log('📊 Threat scoring active: RF (40%) + Speed (25%) + Proximity (20%) + Swarm (15%)');
console.log('🎯 Threat levels: SAFE (0-30) → LOW (31-60) → HIGH (61-80) → CRITICAL (81-100)');