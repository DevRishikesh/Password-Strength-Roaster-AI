const MY_SECRET_API_KEY = "AIzaSyD6_urosALLp6C9twGzJuMoM-5oFzJ_ssk";
const passwordInput = document.getElementById('passwordInput');
const roastButton = document.getElementById('roastButton');
const resultSection = document.getElementById('resultSection');
const loader = document.getElementById('loader');
const roastContent = document.getElementById('roastContent');
const roastMessage = document.getElementById('roastMessage');
 
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const toggleVisibility = document.getElementById('toggleVisibility');
const eyeOpen = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');

 

toggleVisibility.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.classList.toggle('hidden', isPassword);
    eyeClosed.classList.toggle('hidden', !isPassword);
});

roastButton.addEventListener('click', () => {
    const apiKey = MY_SECRET_API_KEY;
    const password = passwordInput.value;

    if (!apiKey) {
        displayError("Please enter your API Key first. 🔑");
        return;
    }

    if (!password) {
        displayError("You gotta enter a password to roast. Duh. 🤔");
        return;
    }

    resultSection.classList.remove('hidden');
    roastContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    analyzeAndRoast(password, apiKey);
});

function getPasswordCharacteristics(password) {
    const characteristics = [];
    if (password.length < 8) characteristics.push("shorter than my patience");
    if (password.length > 20) characteristics.push("longer than a YouTube apology video");
    if (!/[A-Z]/.test(password)) characteristics.push("no uppercase letters");
    if (!/[a-z]/.test(password)) characteristics.push("no lowercase letters");
    if (!/\d/.test(password)) characteristics.push("no numbers");
    if (!/[^A-Za-z0-9]/.test(password)) characteristics.push("no special characters");
    if (/(password|1234|qwerty|iloveyou)/i.test(password)) characteristics.push("basic af");

    if (characteristics.length === 0) {
        return "actually kinda decent, not gonna lie 😏";
    }
    return characteristics.join(', ');
}

async function analyzeAndRoast(password, apiKey) {
    const characteristics = getPasswordCharacteristics(password);

    const prompt = `
You're a brutally sarcastic Gen Z AI who roasts weak passwords like you're live-streaming on Twitch and trying to go viral on TikTok and Instagram.

Your tone is savage, internet-native, meme-powered, and Gen Z-coded. No explanations, just ✨pure roast✨.

Here’s what’s wrong with the password: ${characteristics}

Your job: Give a 1–2 line roast that:
- Hits hard like a viral Instagram and TikTok comment
- Uses Gen Z slang, sarcasm, and emoji (💀😭🔥🙄 etc.)
- Feels like something that would get quoted 10k times on Twitter, Tiktok and Instagram.

❌ Don’t explain the issue.  
✅ Just make it funny, brutal, and memorable.  
Ready? Roast away:
`;

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            const errorMsg = errorBody.error?.message || "Something went wrong with the API.";
            console.error("API Error Response:", errorMsg);
            throw new Error(errorMsg);
        }

        const result = await response.json();

        let roastText = "The AI is speechless, which is a roast in itself. 💀";
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0].text) {
            roastText = result.candidates[0].content.parts[0].text.trim();
        }

        displayResults(roastText);
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        displayError(`API Error: ${error.message}`);
    }
}

function displayResults(text) {
    loader.classList.add('hidden');
    errorMessage.classList.add('hidden');

    roastMessage.textContent = text;
    roastContent.classList.remove('hidden');
    roastContent.classList.add('fade-in');
}

function displayError(message = "Yikes, the AI is taking a nap. Try again later.") {
    loader.classList.add('hidden');
    roastContent.classList.add('hidden');
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('fade-in');
}
