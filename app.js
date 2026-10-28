/**
 * Advanced Student Analysis System
 * Client-side script handling screen transitions, 20s precision timer,
 * rotating status logs, particle canvas background, and confetti celebration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const screenInput = document.getElementById('screen-input');
  const screenLoading = document.getElementById('screen-loading');
  const screenResult = document.getElementById('screen-result');

  const analysisForm = document.getElementById('analysis-form');
  const studentNameInput = document.getElementById('student-name-input');
  const validationMsg = document.getElementById('validation-msg');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');

  const subjectNameDisplay = document.getElementById('subject-name');
  const resultSubjectDisplay = document.getElementById('result-subject-name');

  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercentText = document.getElementById('progress-percent');
  const timeElapsedLabel = document.getElementById('time-elapsed-label');
  const rotatingStatusMsg = document.getElementById('rotating-status-msg');
  const systemTimeDisplay = document.getElementById('system-time');

  // Background and Confetti Canvases
  const bgCanvas = document.getElementById('bg-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Constants
  const TOTAL_DURATION_MS = 20000; // Exactly 20 seconds
  const STATUS_MESSAGES = [
    'Checking attendance records…',
    'Detecting procrastination levels…',
    'Scanning study motivation…',
    'Measuring unnecessary phone usage…',
    'Finalising academic report…'
  ];

  // State
  let isScanning = false;
  let animationFrameId = null;
  let statusIntervalId = null;
  let startTime = 0;
  let confettiAnimationId = null;

  /* ==========================================================================
     HUD Live Time Counter
     ========================================================================== */
  function updateSystemTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    systemTimeDisplay.textContent = `${hours}:${mins}:${secs}`;
  }
  setInterval(updateSystemTime, 1000);
  updateSystemTime();

  /* ==========================================================================
     Screen Navigation Helpers
     ========================================================================== */
  function switchScreen(activeScreen) {
    [screenInput, screenLoading, screenResult].forEach(screen => {
      screen.classList.remove('active');
    });
    activeScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     Input Validation & Form Handling
     ========================================================================== */
  studentNameInput.addEventListener('input', () => {
    if (studentNameInput.value.trim().length > 0) {
      validationMsg.classList.remove('visible');
    }
  });

  analysisForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isScanning) return; // Prevent duplicate triggers

    const rawName = studentNameInput.value.trim();

    if (!rawName) {
      validationMsg.classList.add('visible');
      studentNameInput.focus();
      return;
    }

    validationMsg.classList.remove('visible');
    startAnalysisSequence(rawName);
  });

  /* ==========================================================================
     20-Second Analysis Sequence
     ========================================================================== */
  function startAnalysisSequence(studentName) {
    isScanning = true;
    btnStart.disabled = true;

    // Set Subject Labels
    subjectNameDisplay.textContent = `Subject: ${studentName}`;
    resultSubjectDisplay.textContent = `Report for: ${studentName}`;

    // Switch to Loading Screen
    switchScreen(screenLoading);

    // Reset Progress Bar
    progressBarFill.style.width = '0%';
    progressPercentText.textContent = '0%';
    timeElapsedLabel.textContent = 'Elapsed: 00:00.0';

    // Status Message Rotation (Every 4 seconds for 5 messages = 20s)
    let currentMsgIndex = 0;
    rotatingStatusMsg.textContent = STATUS_MESSAGES[0];
    rotatingStatusMsg.className = 'rotating-status fade-in';

    const messageIntervalMs = TOTAL_DURATION_MS / STATUS_MESSAGES.length; // 4000ms each

    clearInterval(statusIntervalId);
    statusIntervalId = setInterval(() => {
      currentMsgIndex++;
      if (currentMsgIndex < STATUS_MESSAGES.length) {
        rotatingStatusMsg.classList.remove('fade-in');
        rotatingStatusMsg.classList.add('fade-out');

        setTimeout(() => {
          rotatingStatusMsg.textContent = STATUS_MESSAGES[currentMsgIndex];
          rotatingStatusMsg.classList.remove('fade-out');
          rotatingStatusMsg.classList.add('fade-in');
        }, 250);
      }
    }, messageIntervalMs);

    // High Precision Timer using performance.now() and requestAnimationFrame
    startTime = performance.now();

    function updateProgress(currentTime) {
      const elapsed = currentTime - startTime;
      const progressFraction = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      const percentage = Math.floor(progressFraction * 100);

      // Update UI elements
      progressBarFill.style.width = `${progressFraction * 100}%`;
      progressBarFill.parentElement.setAttribute('aria-valuenow', percentage);
      progressPercentText.textContent = `${percentage}%`;

      // Update elapsed time display
      const totalSeconds = elapsed / 1000;
      const secs = Math.floor(totalSeconds);
      const dec = Math.floor((totalSeconds % 1) * 10);
      timeElapsedLabel.textContent = `Elapsed: 00:${String(secs).padStart(2, '0')}.${dec}`;

      if (progressFraction < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Exactly at 20 seconds (100% complete)
        completeAnalysis();
      }
    }

    animationFrameId = requestAnimationFrame(updateProgress);
  }

  /* ==========================================================================
     Analysis Completion Handler
     ========================================================================== */
  function completeAnalysis() {
    isScanning = false;
    clearInterval(statusIntervalId);
    cancelAnimationFrame(animationFrameId);

    // Snap to 100%
    progressBarFill.style.width = '100%';
    progressPercentText.textContent = '100%';

    // Short graceful pause before switching to result
    setTimeout(() => {
      switchScreen(screenResult);
      launchConfetti();
    }, 200);
  }

  /* ==========================================================================
     Restart Button Handler
     ========================================================================== */
  btnRestart.addEventListener('click', () => {
    // Stop Confetti
    stopConfetti();

    // Reset Form and State
    studentNameInput.value = '';
    btnStart.disabled = false;
    validationMsg.classList.remove('visible');

    // Switch back to input screen
    switchScreen(screenInput);
    studentNameInput.focus();
  });

  /* ==========================================================================
     Subtle Cyberpunk Background Canvas (Floating Neural Nodes)
     ========================================================================== */
  (function initCyberBackground() {
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    });

    const particles = [];
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 18000), 60);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    function renderBg() {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${p1.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderBg);
    }

    renderBg();
  })();

  /* ==========================================================================
     Custom Canvas Confetti Engine (Zero Dependencies, Offline Ready)
     ========================================================================== */
  let confettiParticles = [];

  function launchConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    let width = (confettiCanvas.width = window.innerWidth);
    let height = (confettiCanvas.height = window.innerHeight);

    confettiParticles = [];
    const colors = ['#00f2fe', '#4facfe', '#7928ca', '#ff0080', '#10b981', '#f59e0b', '#ffffff'];

    // Spawn 140 vibrant confetti bursts
    for (let i = 0; i < 140; i++) {
      confettiParticles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.45 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: Math.random() * -16 - 6,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.38,
        drag: 0.96,
        opacity: 1
      });
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;

      for (let i = 0; i < confettiParticles.length; i++) {
        const p = confettiParticles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > height * 0.6) {
          p.opacity -= 0.012;
        }

        if (p.opacity > 0) {
          activeParticles++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.opacity, 0);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (activeParticles > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    animateConfetti();
  }

  function stopConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    if (confettiCanvas) {
      const ctx = confettiCanvas.getContext('2d');
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
});
