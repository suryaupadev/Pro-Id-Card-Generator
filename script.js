
// State
let currentStep = 1;
const totalSteps = 4;
let userData = { name: '', age: '', profession: '', experience: '' };

// DOM Elements
const formSteps = document.querySelectorAll('.form-step');
const stepDots = document.querySelectorAll('.step-dot');
const formSection = document.getElementById('formSection');
const resultSection = document.getElementById('resultSection');
const card = document.getElementById('professionalCard');
const cardWrapper = document.getElementById('cardWrapper');

// 3D tilt effect
function initTiltEffect() {
    cardWrapper.addEventListener('mousemove', handleTilt);
    cardWrapper.addEventListener('mouseleave', resetTilt);
    // Mobile touch
    cardWrapper.addEventListener('touchmove', handleTouchTilt);
    cardWrapper.addEventListener('touchend', resetTilt);
}

function handleTilt(e) {
    const rect = cardWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 15;
    const rotateX = -((mouseY - centerY) / (rect.height / 2)) * 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function handleTouchTilt(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = cardWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateY = ((touch.clientX - centerX) / (rect.width / 2)) * 10;
        const rotateX = -((touch.clientY - centerY) / (rect.height / 2)) * 8;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

function resetTilt() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
}

// Form navigation
function nextStep() {
    const currentInput = getCurrentInput();
    if (!currentInput.checkValidity()) {
        currentInput.reportValidity();
        return;
    }

    saveCurrentData();

    if (currentStep < totalSteps) {
        transitionStep(1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        transitionStep(-1);
    }
}

function transitionStep(direction) {
    const oldStep = currentStep;
    currentStep += direction;

    const currentFormStep = document.querySelector(`.form-step[data-step="${oldStep}"]`);
    const nextFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);

    // Handle animation classes
    currentFormStep.classList.remove('active');
    if (direction > 0) currentFormStep.classList.add('exit');

    setTimeout(() => {
        if (direction > 0) currentFormStep.classList.remove('exit');
        nextFormStep.classList.add('active');
    }, 100);

    // Update dots
    updateDots(oldStep, currentStep);
}

function updateDots(oldStep, newStep) {
    const oldDot = document.querySelector(`.step-dot[data-dot="${oldStep}"]`);
    const newDot = document.querySelector(`.step-dot[data-dot="${newStep}"]`);

    oldDot.classList.remove('active');
    if (newStep > oldStep) oldDot.classList.add('completed');

    newDot.classList.remove('completed');
    newDot.classList.add('active');
}

function getCurrentInput() {
    return document.getElementById(['nameInput', 'ageInput', 'professionInput', 'experienceInput'][currentStep - 1]);
}

function saveCurrentData() {
    const keys = ['name', 'age', 'profession', 'experience'];
    const input = getCurrentInput();
    userData[keys[currentStep - 1]] = input.value.trim() || input.value;
}

function generateCard() {
    const experienceInput = document.getElementById('experienceInput');
    if (!experienceInput.checkValidity()) {
        experienceInput.reportValidity();
        return;
    }

    userData.experience = experienceInput.value;

    // Populate Card
    const cardNum = generateCardNumber(userData.name);
    document.getElementById('cardNumber').textContent = cardNum;
    document.getElementById('cardName').textContent = userData.name.toUpperCase();
    document.getElementById('cardProfession').textContent = userData.profession;
    document.getElementById('cardExperience').textContent = `${userData.experience} YRS`;

    // Switch views
    formSection.style.opacity = '0';
    formSection.style.transform = 'scale(0.95)';

    setTimeout(() => {
        formSection.style.display = 'none';
        resultSection.classList.add('visible');
        initTiltEffect();
    }, 300);
}

function generateCardNumber(name) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prefix = String(hash).padStart(4, '0').slice(0, 4);
    const middle = Math.floor(Math.random() * 9000 + 1000);
    const suffix = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}  ${middle}  ${suffix}`;
}

function resetForm() {
    currentStep = 1;
    userData = { name: '', age: '', profession: '', experience: '' };

    // Reset Inputs
    document.getElementById('nameInput').value = '';
    document.getElementById('ageInput').value = '';
    document.getElementById('professionInput').value = '';
    document.getElementById('experienceInput').value = '';

    // Reset Dots
    stepDots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i === 0) dot.classList.add('active');
    });

    // Reset Steps
    formSteps.forEach((step, i) => {
        step.classList.remove('active', 'exit');
        if (i === 0) step.classList.add('active');
    });

    // Switch Views
    resultSection.classList.remove('visible');

    setTimeout(() => {
        formSection.style.display = 'block';
        // Trigger reflow
        void formSection.offsetWidth;
        formSection.style.opacity = '1';
        formSection.style.transform = 'scale(1)';
    }, 300);
}

// Download functionality
async function downloadCard() {
    const canvas = document.createElement('canvas');
    const scale = 2; // High res
    const width = 420 * scale;
    const height = 265 * scale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f1a');

    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, width, height, 20 * scale);
    ctx.fill();

    // Glass overlay
    const glassGradient = ctx.createLinearGradient(0, 0, width, height);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = glassGradient;
    roundRect(ctx, 0, 0, width, height, 20 * scale);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = scale;
    roundRect(ctx, scale / 2, scale / 2, width - scale, height - scale, 20 * scale);
    ctx.stroke();

    // Holo Logo
    const holoX = width - 88 * scale; const holoY = 24 * scale;
    const holoW = 60 * scale; const holoH = 40 * scale;
    const holoGradient = ctx.createLinearGradient(holoX, holoY, holoX + holoW, holoY + holoH);
    holoGradient.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
    holoGradient.addColorStop(0.5, 'rgba(192, 197, 206, 0.5)');
    holoGradient.addColorStop(1, 'rgba(212, 175, 55, 0.4)');
    ctx.fillStyle = holoGradient;
    roundRect(ctx, holoX, holoY, holoW, holoH, 6 * scale);
    ctx.fill();
    ctx.font = `bold ${14 * scale}px Outfit, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('PRO', holoX + holoW / 2, holoY + holoH / 2 + 5 * scale);

    // Chip
    const chipX = 32 * scale; const chipY = 28 * scale;
    const chipW = 50 * scale; const chipH = 40 * scale;
    const chipGradient = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
    chipGradient.addColorStop(0, '#d4af37'); chipGradient.addColorStop(0.3, '#f4d03f');
    chipGradient.addColorStop(0.5, '#d4af37'); chipGradient.addColorStop(1, '#c9a227');
    ctx.fillStyle = chipGradient;
    roundRect(ctx, chipX, chipY, chipW, chipH, 6 * scale);
    ctx.fill();

    // Card Number
    const cardNum = document.getElementById('cardNumber').textContent;
    ctx.font = `${16 * scale}px "Space Mono", monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText(cardNum, chipX, chipY + chipH + 36 * scale);

    // Name
    ctx.font = `bold ${26 * scale}px Outfit, sans-serif`;
    const nameGradient = ctx.createLinearGradient(chipX, 0, chipX + 200 * scale, 0);
    nameGradient.addColorStop(0, '#e8e8e8'); nameGradient.addColorStop(0.5, '#c0c5ce'); nameGradient.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = nameGradient;
    ctx.fillText(userData.name.toUpperCase(), chipX, chipY + chipH + 80 * scale);

    // Profession
    ctx.font = `300 ${14 * scale}px Outfit, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(userData.profession.toUpperCase(), chipX, chipY + chipH + 102 * scale);

    // Experience
    ctx.font = `400 ${10 * scale}px Outfit, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('EXPERIENCE', width - 32 * scale, height - 42 * scale);
    ctx.font = `bold ${18 * scale}px "Space Mono", monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`${userData.experience} YRS`, width - 32 * scale, height - 20 * scale);

    // Download Trigger
    const link = document.createElement('a');
    link.download = `${userData.name.replace(/\s+/g, '-')}-professional-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && formSection.style.display !== 'none') {
        e.preventDefault();
        if (currentStep < totalSteps) nextStep();
        else generateCard();
    }
});

document.getElementById('nameInput').focus();