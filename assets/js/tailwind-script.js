const API_KEY = "";
const MODEL_NAME = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestionsContainer = document.querySelector(".suggestions-container");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const typingInput = typingForm.querySelector(".typing-input");
const sendButton = document.querySelector("#send-button");
const stopButton = document.querySelector("#stop-button");
const themeIcon = document.getElementById("theme-icon");
const themeText = document.getElementById("theme-text");

const customModal = document.getElementById('custom-modal');
const modalHeader = document.getElementById('modal-header');
const modalBody = document.getElementById('modal-body');
const modalFooter = document.getElementById('modal-footer');

let userMessage = null;
let isGenerating = false;
let abortController = null;
let typingInterval = null;

const showModal = (message, type, callback) => {
    modalHeader.innerText = type === 'confirm' ? 'Confirm Action' : 'Notification';
    modalBody.innerText = message;
    modalFooter.innerHTML = '';

    if (type === 'confirm') {
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('modal-button', 'secondary');
        cancelButton.innerText = 'No';
        cancelButton.onclick = hideModal;
        modalFooter.appendChild(cancelButton);

        const confirmButton = document.createElement('button');
        confirmButton.classList.add('modal-button', 'primary');
        confirmButton.innerText = 'Yes';
        confirmButton.onclick = () => {
            if (callback) callback();
            hideModal();
        };
        modalFooter.appendChild(confirmButton);
    } else {
        const okButton = document.createElement('button');
        okButton.classList.add('modal-button', 'primary');
        okButton.innerText = 'OK';
        okButton.onclick = hideModal;
        modalFooter.appendChild(okButton);
    }
    customModal.classList.add('show');
};

const hideModal = () => {
    customModal.classList.remove('show');
};

const loadDataFromLocalstorage = () => {
    const savedChats = localStorage.getItem("saved-chats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    themeIcon.innerText = isLightMode ? "dark_mode" : "light_mode";
    themeText.innerText = isLightMode ? "Dark" : "Light";

    chatContainer.innerHTML = savedChats || '';
    document.body.classList.toggle("hide-header", savedChats && savedChats.trim() !== '');

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
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

            incomingMessageDiv.querySelector(".loading-indicator")?.remove();
            localStorage.setItem("saved-chats", chatContainer.innerHTML);
            updateButtonVisibility(false);
        }
    }, 75);
}

const updateButtonVisibility = (generating) => {
    // Correctly toggle Tailwind's 'hidden' and 'flex' classes
    if (generating) {
        sendButton.classList.add('hidden');
        sendButton.classList.remove('flex'); // Ensure flex is removed when hidden
        stopButton.classList.remove('hidden');
        stopButton.classList.add('flex'); // Ensure flex is added when visible
    } else {
        sendButton.classList.remove('hidden');
        sendButton.classList.add('flex'); // Ensure flex is added when visible
        stopButton.classList.add('hidden');
        stopButton.classList.remove('flex'); // Ensure flex is removed when hidden
    }
}

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

        if (textElement.innerText === "") {
            textElement.innerText = "Generation stopped.";
        } else {
            textElement.innerText += " (Generation stopped.)";
        }
        lastIncomingMessage.classList.remove("loading");
        lastIncomingMessage.classList.add("error");
    }
    localStorage.setItem("saved-chats", chatContainer.innerHTML);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    const loadingIndicator = incomingMessageDiv.querySelector(".loading-indicator");
    const copyIcon = incomingMessageDiv.querySelector(".copy-icon");

    if (!API_KEY) {
        const instructions = `To run this chatbot:\n\n1. Clone Repo from github: https://github.com/rakeshdalvi25/gemini-api-chatbot\n2. Go to Google AI Studio: https://aistudio.google.com/\n3. Create a new API key.\n4. Paste your API key into the 'API_KEY' variable in the JavaScript code.\n\nRefresh the page to chat!`;
        textElement.innerText = instructions;

        loadingIndicator?.remove();
        copyIcon?.classList.remove("hide");
        isGenerating = false;
        updateButtonVisibility(false);
        localStorage.setItem("saved-chats", chatContainer.innerHTML);
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
            textElement.parentElement.closest(".message").classList.add("error");
            showModal(`Failed to get a response: ${error.message}`, 'alert');
        }
        isGenerating = false;
        loadingIndicator?.remove();
        updateButtonVisibility(false);
    } finally {
        incomingMessageDiv.classList.remove("loading");
        abortController = null;
    }
}

const showLoadingAnimation = () => {
    const html = `<div class="message-content flex items-start gap-4">
                          <span class="avatar material-symbols-rounded">robot_2</span>
                          <p class="text leading-relaxed"></p>
                          <div class="loading-indicator flex gap-1 mt-1">
                            <div class="loading-bar w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div class="loading-bar w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div class="loading-bar w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                        <span onClick="copyMessage(this)" class="copy-icon material-symbols-rounded absolute top-2 right-2 text-lg cursor-pointer text-gray-400 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-10 hover:text-white">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading", "bg-gray-700", "text-gray-100", "p-5", "rounded-xl", "shadow-md", "mr-auto");
    chatContainer.appendChild(incomingMessageDiv);

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    updateButtonVisibility(true);
    generateAPIResponse(incomingMessageDiv);
}

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
        showModal('Failed to copy text. Please copy manually.', 'alert');
    } finally {
        document.body.removeChild(textarea);
    }
}

const handleOutgoingChat = () => {
    userMessage = typingInput.value.trim() || userMessage;

    if (!userMessage || isGenerating) {
        return;
    }

    isGenerating = true;
    typingInput.value = "";
    typingInput.style.height = 'initial';
    document.body.classList.add("hide-header");

    const html = `<div class="message-content flex items-start gap-4">
                        <span class="avatar material-symbols-rounded">person</span>
                        <p class="text leading-relaxed">${userMessage}</p>
                      </div>
                      <span onClick="copyMessage(this)" class="copy-icon material-symbols-rounded absolute top-2 right-2 text-lg cursor-pointer text-gray-400 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-10 hover:text-white">content_copy</span>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing", "bg-blue-600", "text-white", "p-5", "rounded-xl", "shadow-md", "ml-auto");
    chatContainer.appendChild(outgoingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    showLoadingAnimation();
}

suggestionsContainer.addEventListener("click", (e) => {
    const suggestion = e.target.closest(".suggestion");
    if (suggestion) {
        typingInput.value = suggestion.querySelector(".text").innerText;
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

toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("light_mode");
    const isLightMode = document.body.classList.contains("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    themeIcon.innerText = isLightMode ? "dark_mode" : "light_mode";
    themeText.innerText = isLightMode ? "Dark" : "Light";
});

deleteChatButton.addEventListener("click", () => {
    showModal('Are you sure you want to delete all the chats? This action cannot be undone.', 'confirm', () => {
        localStorage.removeItem("saved-chats");
        chatContainer.innerHTML = "";
        document.body.classList.remove("hide-header");
    });
});

window.addEventListener("load", loadDataFromLocalstorage);

typingInput.addEventListener("input", () => {
    typingInput.style.height = 'initial';
    typingInput.style.height = `${typingInput.scrollHeight}px`;
});