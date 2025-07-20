const passwordInput = document.getElementById('password-input');
const strengthBar = document.getElementById('strength-bar');
const timeToCrackText = document.getElementById('time-to-crack');
const feedbackText = document.getElementById('feedback-text');
const togglePassword = document.getElementById('toggle-password');
const eyeOpen = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');
const generatePasswordBtn = document.getElementById('generate-password-btn');
const generateBtnText = document.getElementById('generate-btn-text');
const loader = document.getElementById('loader');

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  updateUI(password);
});

togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeOpen.style.display = isPassword ? 'none' : 'block';
  eyeClosed.style.display = isPassword ? 'block' : 'none';
});

generatePasswordBtn.addEventListener('click', async () => {
  await generateSecurePassword();
});

async function generateSecurePassword() {
  setLoading(true);
  feedbackText.textContent = 'Generating with AI...';
  timeToCrackText.innerHTML = '&nbsp;';
  strengthBar.style.width = '0%';

  const prompt = "Generate a highly secure, random, and unique password. It should be 16 characters long, containing a mix of uppercase letters, lowercase letters, numbers, and special characters (like !@#$%^&*). Do not include easily guessable words or sequences. Provide only the password text itself, with no explanation.";
  const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
  const apiKey = "AIzaSyD6_urosALLp6C9twGzJuMoM-5oFzJ_ssk"; // Set your Gemini API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: chatHistory })
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const result = await response.json();
    const generatedPassword = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (generatedPassword) {
      passwordInput.value = generatedPassword;
      passwordInput.dispatchEvent(new Event('input'));
    } else {
      throw new Error("Unexpected API response.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    feedbackText.textContent = "Failed to generate password. Please try again.";
  } finally {
    setLoading(false);
  }
}

function updateUI(password) {
  if (password.length === 0) return resetUI();

  const { timeInSeconds, poolSize } = calculateCrackTime(password);
  const { time, unit } = formatTime(timeInSeconds);
  const { color, strengthText, width } = getStrengthInfo(timeInSeconds);
  const feedback = getFeedback(password, poolSize);

  timeToCrackText.textContent = `It would take about ${time} ${unit} to crack.`;
  strengthBar.style.width = `${width}%`;
  strengthBar.style.backgroundColor = color;
  feedbackText.innerHTML = `${strengthText}. ${feedback}`;
}

function resetUI() {
  strengthBar.style.width = '0%';
  strengthBar.style.backgroundColor = 'transparent';
  timeToCrackText.innerHTML = '&nbsp;';
  feedbackText.innerHTML = '&nbsp;';
}

function calculateCrackTime(password) {
  const length = password.length;
  let poolSize = 0;

  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const guessesPerSecond = 10_000_000_000;
  const totalCombinations = BigInt(poolSize) ** BigInt(length);
  const timeInSeconds = Number(totalCombinations) / guessesPerSecond;

  return { timeInSeconds, poolSize };
}

function setLoading(isLoading) {
  generatePasswordBtn.disabled = isLoading;
  loader.style.display = isLoading ? 'block' : 'none';
  generateBtnText.textContent = isLoading ? 'Generating...' : '✨ Generate Secure Password';
}

function formatTime(seconds) {
  if (seconds < 1) return { time: '< 1', unit: 'second' };
  if (seconds < 60) return { time: Math.round(seconds), unit: 'seconds' };
  const minutes = seconds / 60;
  if (minutes < 60) return { time: Math.round(minutes), unit: 'minutes' };
  const hours = minutes / 60;
  if (hours < 24) return { time: Math.round(hours), unit: 'hours' };
  const days = hours / 24;
  if (days < 365) return { time: Math.round(days), unit: 'days' };
  const years = days / 365;
  if (years < 1000) return { time: Math.round(years).toLocaleString(), unit: 'years' };
  const millennia = years / 1000;
  if (millennia < 1000) return { time: Math.round(millennia).toLocaleString(), unit: 'millennia' };
  const millionYears = millennia / 1000;
  return { time: millionYears.toLocaleString(), unit: 'million years' };
}

function getStrengthInfo(seconds) {
  if (seconds < 3600) return { color: '#ef4444', strengthText: 'Very Weak', width: 25 };
  if (seconds < 86400) return { color: '#f97316', strengthText: 'Weak', width: 50 };
  if (seconds < 31536000) return { color: '#eab308', strengthText: 'Moderate', width: 75 };
  return { color: '#22c55e', strengthText: 'Strong', width: 100 };
}

function getFeedback(password, poolSize) {
  if (password.length < 8) return "It's too short.";
  if (poolSize < 50) return "Try mixing uppercase, lowercase, numbers, and symbols.";
  if (password.length < 12) return "Making it longer would improve security.";
  return "This is a secure password.";
}

// Initialize on load
updateUI(passwordInput.value);
