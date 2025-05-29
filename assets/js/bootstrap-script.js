const API_KEY = ""; // Your Gemini API key here
const MODEL_NAME = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestionsContainer = document.querySelector(".suggestions-container");
const themeToggleButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const typingInput = typingForm.querySelector(".form-control");
const sendButton = document.querySelector("#send-button");
const stopButton = document.querySelector("#stop-button");
const headerElement = document.querySelector(".header");

const clearChatModalElement = document.getElementById('clearChatModal');
const confirmDeleteChatButton = document.getElementById('confirmDeleteChatButton');
let clearChatModal = null;

let userMessage = null;
let isGenerating = false;
let abortController = null;
let typingInterval = null;

const loadChatsAndTheme = () => {
    const savedChats = localStorage.getItem("saved-chats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.documentElement.setAttribute('data-bs-theme', isLightMode ? 'light' : 'dark');
    document.body.classList.toggle("hide-header", savedChats && savedChats.trim() !== '');
    updateThemeButton(isLightMode);

    chatContainer.innerHTML = savedChats || '';
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const updateThemeButton = (isLightMode) => {
    themeToggleButton.innerHTML = `
            <span class="material-symbols-rounded">${isLightMode ? 'dark_mode' : 'light_mode'}</span>
            ${isLightMode ? 'Dark' : 'Light'}
        `;
    themeToggleButton.classList.toggle('btn-outline-dark', isLightMode);
    themeToggleButton.classList.toggle('btn-outline-light', !isLightMode);
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", "d-flex", "align-items-start", "gap-3", "shadow-sm", ...classes);
    div.innerHTML = content;
    return div;
};

const showTypingEffect = (text, textElement, messageDiv, isAPIResponse = true) => {
    const words = text.split(' ');
    let wordIndex = 0;
    textElement.innerText = '';

    if (typingInterval) clearInterval(typingInterval);

    typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.innerText += (wordIndex === 0 ? '' : ' ') + words[wordIndex++];
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            isGenerating = false;

            messageDiv.querySelector(".loading-indicator")?.remove();
            const copyIcon = messageDiv.querySelector(".copy-icon");
            if (copyIcon) copyIcon.classList.toggle("hide", !isAPIResponse);
            localStorage.setItem("saved-chats", chatContainer.innerHTML);
            updateButtonVisibility(false);
        }
    }, 75);
};

const updateButtonVisibility = (generating) => {
    sendButton.classList.toggle('d-none', generating);
    stopButton.classList.toggle('d-none', !generating);
};

const stopGeneration = () => {
    abortController?.abort();
    abortController = null;
    if (typingInterval) clearInterval(typingInterval);
    typingInterval = null;

    isGenerating = false;
    updateButtonVisibility(false);

    const lastIncomingMessage = chatContainer.querySelector(".incoming:last-child");
    if (lastIncomingMessage) {
        const textElement = lastIncomingMessage.querySelector(".text");
        lastIncomingMessage.querySelector(".loading-indicator")?.remove();
        lastIncomingMessage.querySelector(".copy-icon")?.classList.remove("hide");

        if (textElement.innerText === "") {
            textElement.innerText = "Generation stopped.";
        } else {
            textElement.innerText += " (Generation stopped.)";
        }
        lastIncomingMessage.classList.remove("loading", "bg-body-secondary");
        lastIncomingMessage.classList.add("bg-danger", "text-white");
    }
    localStorage.setItem("saved-chats", chatContainer.innerHTML);
};

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    const loadingIndicator = incomingMessageDiv.querySelector(".loading-indicator");
    const copyIcon = incomingMessageDiv.querySelector(".copy-icon");

    if (!API_KEY || API_KEY.trim() === "") {
        const noApiKeyMessage = `To run this chatbot:\n\n1. Clone Repo from github: https://github.com/rakeshdalvi25/gemini-api-chatbot\n2. Go to Google AI Studio: https://aistudio.google.com/\n3. Create a new API key.\n4. Paste your API key into the 'API_KEY' variable in the JavaScript code.\n\nRefresh the page to chat!`;
        loadingIndicator?.remove();
        copyIcon?.classList.add("hide");
        showTypingEffect(noApiKeyMessage, textElement, incomingMessageDiv, false);
        isGenerating = false;
        updateButtonVisibility(false);
        return;
    }

    abortController = new AbortController();
    const signal = abortController.signal;

    try {
        const chatHistory = [{ role: "user", parts: [{ text: userMessage }] }];
        const payload = { contents: chatHistory };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: signal,
        });

        const result = await response.json();

        if (!response.ok) {
            const errorMessage = result.error?.message || "An unknown API error occurred.";
            throw new Error(`API Error: ${errorMessage}`);
        }

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const apiResponse = result.candidates[0].content.parts[0].text;
            const cleanedResponse = apiResponse.replace(/\*\*(.*?)\*\*/g, '$1');
            showTypingEffect(cleanedResponse, textElement, incomingMessageDiv);
        } else {
            throw new Error("No valid response candidates found from the API.");
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted by user.');
        } else {
            console.error("Error generating API response:", error);
            textElement.innerText = `Oops! Something went wrong. ${error.message}`;
            incomingMessageDiv.classList.add("bg-danger", "text-white");
        }
        isGenerating = false;
        loadingIndicator?.remove();
        copyIcon?.classList.remove("hide");
        updateButtonVisibility(false);
    } finally {
        incomingMessageDiv.classList.remove("loading");
        abortController = null;
    }
};

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                          <span class="avatar material-symbols-rounded">robot_2</span>
                          <p class="text"></p>
                          <div class="loading-indicator">
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                          </div>
                        </div>
                        <span onClick="copyMessage(this)" class="copy-icon material-symbols-rounded hide">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading", "bg-body-secondary");
    chatContainer.appendChild(incomingMessageDiv);

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    updateButtonVisibility(true);
    generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
    const messageText = copyButton.parentElement.querySelector(".text").innerText;
    const textarea = document.createElement('textarea');
    textarea.value = messageText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        copyButton.innerText = "done";
        setTimeout(() => copyButton.innerText = "content_copy", 1000);
    } catch (err) {
        console.error('Failed to copy text:', err);
    } finally {
        document.body.removeChild(textarea);
    }
};

const handleOutgoingChat = () => {
    userMessage = typingInput.value.trim();
    if (!userMessage) return;

    typingInput.value = "";
    typingInput.style.height = 'initial';
    document.body.classList.add("hide-header");

    const html = `<div class="message-content">
                        <span class="avatar material-symbols-rounded">person</span>
                        <p class="text">${userMessage}</p>
                      </div>
                      <span onClick="copyMessage(this)" class="copy-icon material-symbols-rounded hide">content_copy</span>`; // Copy icon for outgoing, hidden by CSS
    const outgoingMessageDiv = createMessageElement(html, "outgoing", "bg-primary", "text-white");
    chatContainer.appendChild(outgoingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    isGenerating = true;
    showLoadingAnimation();
};

suggestionsContainer.addEventListener("click", (e) => {
    const suggestion = e.target.closest(".suggestion-card");
    if (suggestion) {
        typingInput.value = suggestion.querySelector(".card-text").innerText;
        handleOutgoingChat();
    }
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isGenerating) {
        handleOutgoingChat();
    }
});

stopButton.addEventListener("click", stopGeneration);

themeToggleButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem("themeColor", newTheme === 'light' ? 'light_mode' : 'dark_mode');
    updateThemeButton(newTheme === 'light');
});

deleteChatButton.addEventListener("click", () => {
    clearChatModal.show();
});

confirmDeleteChatButton.addEventListener("click", () => {
    localStorage.removeItem("saved-chats");
    chatContainer.innerHTML = "";
    document.body.classList.remove("hide-header");
    clearChatModal.hide();
});

window.addEventListener("load", () => {
    clearChatModal = new bootstrap.Modal(clearChatModalElement);
    loadChatsAndTheme();
});

typingInput.addEventListener("input", () => {
    typingInput.style.height = 'initial';
    typingInput.style.height = `${typingInput.scrollHeight}px`;
});