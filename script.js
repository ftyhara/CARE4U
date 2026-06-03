// CARE4U Core Processing Engine - Next Gen High-Fi Edition
// =========================================================

let currentUser = "";
let currentRole = "";
let isVRConnected = false; 
let baseFontScale = 1.0;
let stabilityInterval;

let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0', width: '0', videoId: '6H-PLF2CR18',
        playerVars: { 'autoplay': 0, 'loop': 1, 'controls': 0, 'showinfo': 0, 'autohide': 1, 'playlist': '6H-PLF2CR18' }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initSparkles();
    initTiltEngines();
});

function initSparkles() {
    const container = document.getElementById("sparkle-container");
    container.innerHTML = ""; 
    for(let i = 0; i < 75; i++) {
        let spark = document.createElement("div");
        spark.className = "sparkle";
        spark.style.top = Math.random() * 100 + "vh";
        spark.style.left = Math.random() * 100 + "vw";
        spark.style.animationDuration = (Math.random() * 5 + 4) + "s";
        spark.style.animationDelay = (Math.random() * 3) + "s";
        container.appendChild(spark);
    }
}

function initTiltEngines() {
    if (typeof VanillaTilt !== "undefined") {
        VanillaTilt.init(document.querySelectorAll("[data-tilt], .card, .role-btn, .token-badge"), {
            max: 6, speed: 800, glare: true, "max-glare": 0.15, perspective: 1200
        });
    }
}

function adjustFont(direction) {
    if (direction === 'up' && baseFontScale < 1.3) baseFontScale += 0.08;
    if (direction === 'down' && baseFontScale > 0.85) baseFontScale -= 0.08;
    document.documentElement.style.setProperty('--font-scale', baseFontScale);
}

function toggleContrast() {
    document.body.classList.toggle("high-contrast");
    showNotification("Visual contrast parameter matrix adapted.");
}

function selectRole(role, element) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    
    if (role === 'student') {
        document.getElementById('role-icon-student')?.classList.add('selected');
        document.getElementById('role-text-student')?.classList.add('selected');
    } else if (role === 'staff') {
        document.getElementById('role-icon-staff')?.classList.add('selected');
        document.getElementById('role-text-staff')?.classList.add('selected');
    } else {
        element.classList.add('selected');
    }
}

function executeLogin() {
    const nameInput = document.getElementById("username").value;
    if (nameInput.trim() === "") {
        showNotification("Please identify workstation profile name.");
        return;
    }
    if (!currentRole) {
        showNotification("Please select terminal environment access profile.");
        return;
    }

    currentUser = nameInput;
    const wave = document.getElementById("wave-overlay");
    wave.classList.add("active");

    setTimeout(() => {
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("dashboard-screen").classList.remove("hidden");
        
        document.body.className = ""; 
        if (currentRole === 'peds') {
            document.body.classList.add("peds-theme");
        } else if (currentRole === 'staff' || currentRole === 'student') {
            document.body.classList.add("staff-theme");
        } else {
            document.body.classList.add("patient-theme");
        }

        loadSkeletonInterface();

        // --- UPDATED: Personalized Welcome Notification ---
        showNotification(`Welcome, ${currentUser}!`);
        
    }, 600);

    setTimeout(() => { wave.classList.remove("active"); }, 1200);
}

function loadSkeletonInterface() {
    const content = document.getElementById("dashboard-content");
    const telemetryRow = document.getElementById("telemetry-extension-row");
    
    telemetryRow.innerHTML = `<div class="skeleton-bar" style="width:100%; height:55px; border-radius:14px;"></div>`;
    
    content.innerHTML = `
        <div class="skeleton-card glass-panel"></div>
        <div class="skeleton-card glass-panel"></div>
        <div class="skeleton-card glass-panel"></div>
        <div class="skeleton-card glass-panel"></div>
    `;

    setTimeout(() => {
        renderTelemetryBar();
        loadDashboard(currentRole);
    }, 1400);
}

function renderTelemetryBar() {
    const telemetryRow = document.getElementById("telemetry-extension-row");
    
    if (currentRole === 'peds' && isVRConnected) {
        telemetryRow.classList.remove("hidden");
        telemetryRow.innerHTML = `
            <div class="dlp-tracker-panel glass-panel">
                <div class="dlp-meta">
                    <span class="dlp-title">👾 Stay-Still Challenge: Motion Stability Array</span>
                    <span class="dlp-values" id="stability-text"><strong>Stability Score:</strong> 100% (Perfect)</span>
                </div>
                <div class="dlp-progress-track">
                    <div class="dlp-progress-fill" id="stability-fill" style="width: 100%;"></div>
                </div>
            </div>
        `;
        startStabilityEngine();
    } else if (currentRole === 'peds' && !isVRConnected) {
        telemetryRow.classList.remove("hidden");
        telemetryRow.innerHTML = `
            <div class="dlp-tracker-panel glass-panel" style="opacity: 0.6;">
                <div class="dlp-meta">
                    <span class="dlp-title">👾 Stay-Still Challenge (Awaiting VR Connection)</span>
                    <span class="dlp-values" id="stability-text">Connect VR to begin</span>
                </div>
            </div>
        `;
        if (stabilityInterval) clearInterval(stabilityInterval);
    } else {
        telemetryRow.classList.add("hidden");
        telemetryRow.innerHTML = "";
        if (stabilityInterval) clearInterval(stabilityInterval);
    }
}

function startStabilityEngine() {
    if (stabilityInterval) clearInterval(stabilityInterval);
    stabilityInterval = setInterval(() => {
        const fill = document.getElementById("stability-fill");
        const txt = document.getElementById("stability-text");
        if (!fill || !txt) {
            clearInterval(stabilityInterval);
            return;
        }
        let liveScore = Math.floor(93 + Math.random() * 8);
        if (liveScore > 100) liveScore = 100;
        fill.style.width = liveScore + "%";
        txt.innerHTML = `<strong>Stability Score:</strong> ${liveScore}% ${liveScore > 95 ? '(Excellent)' : '(Hold Still!)'}`;
    }, 1200);
}

function loadDashboard(role) {
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    content.style.display = "grid";
    content.style.gridTemplateColumns = "repeat(2, 1fr)";
    content.style.flexDirection = "unset";
    content.style.gap = "24px";

    const vrIcon = `<svg class="card-icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="4"/><circle cx="7" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/><path d="M10 7l2 2 2-2"/></svg>`;
    const videoIcon = `<svg class="card-icon" viewBox="0 0 24 24"><polygon points="7,4 20,12 7,20"/></svg>`;
    const guideIcon = `<svg class="card-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v16H6.5"/></svg>`;
    const scheduleIcon = `<svg class="card-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const statsIcon = `<svg class="card-icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-5 5"/></svg>`;

    if (role === 'peds' || role === 'patient') {
        content.innerHTML = `
            <div class="card glass-panel" onclick="openVRMenu('${role === 'peds' ? 'peds' : 'adult'}')">
                ${vrIcon}
                <h3>VR Simulator</h3>
            </div>
            <div class="card glass-panel" onclick="openVideoModal()">
                ${videoIcon}
                <h3>Video Education</h3>
            </div>
            <div class="card glass-panel" onclick="window.open('https://your-guide-website.com', '_blank')">
                ${guideIcon}
                <h3>Post-Session Guide</h3>
            </div>
            <div class="card glass-panel" onclick="showSchedule()">
                ${scheduleIcon}
                <h3>Scheduled Session</h3>
            </div>
        `;
    } else if (role === 'student') {
        content.innerHTML = `
            <div class="card glass-panel" onclick="openVRMenu('student')">
                ${vrIcon}
                <h3>VR OSCE & OSPE</h3>
            </div>
            <div class="card glass-panel" onclick="alert('Loading Academic Assessment & Analytics...')">
                ${statsIcon}
                <h3>Grades & Statistic</h3>
            </div>
        `;
    } else if (role === 'staff') {
        content.innerHTML = `
            <div class="card glass-panel" onclick="openVRMenu('staff')">
                ${vrIcon}
                <h3>VR PRACTICE</h3>
            </div>
            <div class="card glass-panel" onclick="showStaffAppointments()">
                ${scheduleIcon}
                <h3>Patient Appointment Schedule</h3>
            </div>
        `;
    }
    
    initTiltEngines(); 
}

function connectVR() {
    if (isVRConnected) {
        showNotification("VR is already linked and calibrated.");
        return;
    }
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    modal.classList.remove("hidden");
    content.innerHTML = `<h3 style="font-weight:400;">Linking biometric vital signal streams...</h3>`;
    setTimeout(() => { simulateBPSpike(); }, 1200);
}

function simulateBPSpike() {
    document.body.className = "";
    if (currentRole === 'peds') {
        document.body.classList.add("peds-theme");
    } else if (currentRole === 'staff' || currentRole === 'student') {
        document.body.classList.add("staff-theme");
    } else {
        document.body.classList.add("patient-theme");
    }
    document.body.classList.add('bp-spiked'); 

    const content = document.getElementById("modal-content");
    let bpTop = 110;
    
    content.innerHTML = `
        <h3 style="font-weight:400; opacity: 0.9;">Real-time Biometric Monitoring. Measuring Anxiety Fluctuations...</h3>
        <div class="bp-monitor" id="bp-text">${bpTop} / 80 mmHg</div>
        <p id="bp-status" style="opacity: 0.7;">Analyzing autonomic baseline signals...</p>
    `;

    const bpInterval = setInterval(() => {
        bpTop += 7;
        const txt = document.getElementById("bp-text");
        if(txt) txt.innerText = `${bpTop} / 91 mmHg`;
        
        if(bpTop > 135) {
            clearInterval(bpInterval);
            const statusText = document.getElementById("bp-status");
            if(txt) txt.style.color = "#ff4757";
            if(statusText) statusText.innerHTML = `<strong style="color:#ff4757;">BP above threshold detected...</strong>`;
            setTimeout(() => { triggerBreathingExercise(); }, 1800);
        }
    }, 500);
}

function triggerBreathingExercise() {
    document.body.classList.remove('bp-spiked');
    document.body.classList.add('bp-breathing'); 

    const content = document.getElementById("modal-content");
    content.innerHTML = `
        <h3 style="color: #4fe3c1; font-weight:400;">Setting up breathing sync...</h3>
        <p style="opacity: 0.8;">Breath in and out along with the visual guide.</p>
        <div class="breath-circle breathe-animation"></div>
        <p id="breath-instruction" style="font-weight:600; font-size:1.3em; letter-spacing: 1px;">Inhale slowly...</p>
    `;

    let state = 0;
    const instructions = ["Inhale slowly...", "Hold spatial air...", "Exhale completely...", "Rest baseline..."];
    
    const breathInterval = setInterval(() => {
        state++;
        if (state >= 4) {
            clearInterval(breathInterval);
            finishBreathing();
            return;
        }
        const inst = document.getElementById("breath-instruction");
        if(inst) inst.innerText = instructions[state];
    }, 2000);
}

function finishBreathing() {
    document.body.classList.remove('bp-breathing');
    
    // Re-apply original theme class
    if (currentRole === 'peds') document.body.classList.add("peds-theme");
    else if (currentRole === 'staff' || currentRole === 'student') document.body.classList.add("staff-theme");
    else document.body.classList.add("patient-theme");

    const content = document.getElementById("modal-content");
    content.innerHTML = `
        <h3 style="color: #4fe3c1; font-weight:400;">Blood Pressure Normal</h3>
        <div class="bp-monitor" style="color: #4fe3c1;">115 / 76 mmHg</div>
        <p style="opacity: 0.8;">Your vitals are looking good. You're ready to proceed.</p>
        <br><button onclick="completeVRSync()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Continue</button>
    `;
}

function completeVRSync() {
    isVRConnected = true; 
    closeModal();
    
    const vrBtn = document.getElementById("global-vr-btn");
    const vrText = document.getElementById("global-vr-text");
    if (vrBtn && vrText) {
        vrBtn.style.borderColor = "#4fe3c1";
        vrBtn.style.color = "#4fe3c1";
        vrText.innerText = "VR Linked";
    }

    renderTelemetryBar();
    showNotification("VR Systems online.");
}

function showQR() {
    document.getElementById("modal-overlay").classList.remove("hidden");
    document.getElementById("modal-content").innerHTML = `
        <h2>Hospital Arrival Matrix Code</h2>
        <div style="width:180px; height:180px; background:white; padding:16px; margin: 30px auto; border-radius:16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:100%; height:100%; background: repeating-conic-gradient(#0f172a 0% 25%, transparent 0% 50%) 0 0/20px 20px, repeating-conic-gradient(#0f172a 0% 25%, #ffffff 0% 50%) 10px 10px/20px 20px;"></div>
        </div>
        <button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Dismiss Interface</button>
    `;
}

function logout() {
    if (stabilityInterval) clearInterval(stabilityInterval);
    if (ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() === 1) {
        toggleMusic(); 
    }

    const wave = document.getElementById("wave-overlay");
    wave.classList.add("active");

    setTimeout(() => {
        currentUser = ""; currentRole = ""; isVRConnected = false; 
        
        const vrBtn = document.getElementById("global-vr-btn");
        const vrText = document.getElementById("global-vr-text");
        if (vrBtn && vrText) {
            vrBtn.style.borderColor = "";
            vrBtn.style.color = "";
            vrText.innerText = "Connect VR";
        }

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
        document.body.className = "dark-blue-animated";
        document.getElementById("dashboard-screen").classList.add("hidden");
        document.getElementById("login-screen").classList.remove("hidden");
    }, 600);

    setTimeout(() => { wave.classList.remove("active"); }, 1200);
}

function showNotification(message) {
    const notif = document.getElementById("notification");
    notif.innerText = message; notif.classList.remove("hidden");
    setTimeout(() => { notif.classList.add("hidden"); }, 3000);
}

function toggleMusic() {
    const btn = document.getElementById("music-btn");
    const bars = document.getElementById("music-bars");
    const icon = document.getElementById("headphone-icon");
    if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;

    if (ytPlayer.getPlayerState() === 1) { 
        ytPlayer.pauseVideo(); btn.innerText = "Play";
        bars.classList.add("hidden"); icon.classList.remove("music-bounce");
    } else {
        ytPlayer.playVideo(); btn.innerText = "Pause";
        bars.classList.remove("hidden"); icon.classList.add("music-bounce");
    }
}

function openVRMenu(type) {
    if (!isVRConnected) {
        promptVRCheck();
        return;
    }

    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    modal.classList.remove("hidden");

    let diagOptions = (type === 'peds' || type === 'student')
        ? `<button class="menu-list-btn laser-btn" onclick="runVR('X-Ray')">X-Ray</button>
           <button class="menu-list-btn laser-btn" onclick="runVR('CT Scan')">CT</button>
           <button class="menu-list-btn laser-btn" onclick="runVR('MRI')">MRI</button>`
        : `<button class="menu-list-btn laser-btn" onclick="runVR('X-Ray')">X-Ray</button>
           <button class="menu-list-btn laser-btn" onclick="runVR('CT Scan')">CT Scan</button>
           <button class="menu-list-btn laser-btn" onclick="runVR('MRI')">MRI</button>
           <button class="menu-list-btn laser-btn" onclick="runVR('Ultrasound')">Ultrasound</button>`;

    content.innerHTML = `
        <h2>Select Simulation Space</h2>
        <div class="modal-grid" style="margin-bottom: 15px;">
            <button class="laser-btn" onclick="runVR('Radiotherapy')" style="border-color:#38bdf8; color:white;">Linear Accelerator</button>
            <button class="laser-btn" onclick="document.getElementById('diag-options').classList.remove('hidden')" style="color:white;">Diagnostic Imaging</button>
        </div>
        <div id="diag-options" class="hidden" style="margin-top:20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
            <h4 style="margin-top:0; font-weight:400; color: rgba(255,255,255,0.7);">Select Modality:</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">${diagOptions}</div>
        </div>
        <br><button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Cancel</button>
    `;
}

function promptVRCheck() {
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    modal.classList.remove("hidden");

    content.innerHTML = `
        <h2>Virtual Reality Setup</h2>
        <p style="color: rgba(255,255,255,0.7); margin-bottom: 25px;">The system requires an active VR Headset to load VR Simulation of Sessions.</p>
        <div class="modal-grid">
            <button class="laser-btn" onclick="connectVR()" style="background: rgba(46, 204, 113, 0.1); border-color:#2ecc71; color:#fff;">Connect VR First</button>
            <button class="laser-btn" onclick="handleVRResponse(false)" style="background: rgba(230, 126, 34, 0.1); border-color:#e67e22; color:#fff;">No VR Available</button>
        </div>
        <br><button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Cancel</button>
    `;
}

function handleVRResponse(hasVR) {
    const content = document.getElementById("modal-content");
    if (!hasVR) {
        content.innerHTML = `
            <h2>Digital Modules</h2>
            <p>Select a training Module:</p>
            <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 16px; margin: 20px 0; display:flex; flex-direction:column; gap:12px; border: 1px solid rgba(255,255,255,0.1);">
                <button class="menu-list-btn laser-btn" onclick="alert('Loading OSPE Positioning Rig...')">Patient Positioning Parameters</button>
                <button class="menu-list-btn laser-btn" onclick="alert('Loading Instrumentation Module...')">Hardware & Instrumentation ID</button>
                <button class="menu-list-btn laser-btn" onclick="alert('Loading Safety System Engine...')">Radiation Safety Control Protocols</button>
            </div>
            <button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Close</button>
        `;
    }
}

function runVR(machineName) {
    const content = document.getElementById("modal-content");
    content.innerHTML = `
        <h2 style="color: var(--primary-color);">VR Simulation Active</h2>
        <p>Currently simulating...: <strong>${machineName}</strong></p>
        <br><button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Stop the VR Simulation</button>
    `;
}

function openVideoModal() {
    document.getElementById("modal-overlay").classList.remove("hidden");
    const content = document.getElementById("modal-content");

    let videoOptions = currentRole === 'peds' ? `
        <button class="menu-list-btn laser-btn" onclick="playYouTube('6ZAKQ4RrvtQ')">What's fun in radiotherapy!</button>
        <button class="menu-list-btn laser-btn" onclick="playYouTube('WLFDBvRY8po')">Meet Radiation: Your superhero friend!</button>
    ` : `
        <button class="menu-list-btn laser-btn" onclick="playYouTube('2DDGUOcPZO0')">What's Radiotherapy?</button>
        <button class="menu-list-btn laser-btn" onclick="playYouTube('WLFDBvRY8po')">Is Radiation Harmful?</button>
    `;

    content.innerHTML = `
        <h2>Dive into Exciting Educational Videos!</h2>
        <div style="margin-top: 25px; display:flex; flex-direction:column; gap:12px;">
            ${videoOptions}
        </div>
        <br><button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Close Selection</button>
    `;
}

function playYouTube(videoId) {
    document.getElementById("modal-content").innerHTML = `
        <h2>Active Media Stream</h2>
        <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <br>
        <button onclick="openVideoModal()" class="capsule-btn laser-btn" style="width:100%; margin-bottom: 12px; justify-content:center;">Back to Index</button>
        <button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Close Stream</button>
    `;
}

function showStaffAppointments() {
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    modal.classList.remove("hidden");

    content.innerHTML = `
        <h2>Upcomming appoinment schedules</h2>
        <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0; max-height: 250px; overflow-y: auto;">
            <div class="roster-item"><span><strong>08:30 AM</strong> - Timothy L. (Peds MRI)</span><span class="badge state-done">Done</span></div>
            <div class="roster-item"><span><strong>09:45 AM</strong> - Maria S. (Adult CT)</span><span class="badge state-done">Done</span></div>
            <div class="roster-item"><span><strong>11:00 AM</strong> - John D. (X-Ray)</span><span class="badge state-wait">Waiting</span></div>
        </div>
        <button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Close</button>
    `;
}

function showSchedule() {
    const modal = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    modal.classList.remove("hidden");

    content.innerHTML = `
        <h2>Upcoming Appointment</h2>
        <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0; display:flex; flex-direction:column; gap:10px;">
            <p><strong>Identified Patient:</strong> ${currentUser}</p>
            <p><strong>Scheduled Time:</strong> Tomorrow, 09:00 AM</p>
            <p><strong>Modality Domain:</strong> Computed Tomography (CT)</p>
            <p><strong>Verification Status:</strong> <span style="color: #38bdf8; font-weight: bold;">Confirmed</span></p>
        </div>
        <button onclick="closeModal()" class="capsule-btn laser-btn" style="width:100%; justify-content:center;">Close Itinerary</button>
    `;
}

function closeModal() { document.getElementById("modal-overlay").classList.add("hidden"); }