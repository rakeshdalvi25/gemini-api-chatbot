# Gemini API Chatbot

This repository contains a Gemini API chatbot with different UI implementations using Bootstrap 5, Pure CSS, and Tailwind CSS. The `index.html` serves as a homepage showcasing each UI.

## Folder Structure

```
.
├── assets/
│   ├── css/
│   │   ├── bootstrap-style.css
│   │   ├── tailwind-style.css
│   │   └── vanilla-style.css
│   ├── img/
│   └── js/
│       ├── bootstrap-script.js
│       ├── tailwind-script.js
│       └── vanilla-script.js
├── chatbot-ui/
│   ├── bootstrap5chatbot.html
│   ├── csschatbot.html
│   └── tailwindchatbot.html
└── index.html
```

  * **`assets/`**: Contains static assets like CSS, JavaScript, and images.
      * **`assets/css/`**: Holds stylesheets for different UI frameworks (`bootstrap-style.css`, `tailwind-style.css`, `vanilla-style.css`).
      * **`assets/img/`**: Placeholder for any images used in the project.
      * **`assets/js/`**: Contains JavaScript files for each UI's functionality (`bootstrap-script.js`, `tailwind-script.js`, `vanilla-script.js`).
  * **`chatbot-ui/`**: This directory houses the individual HTML files for each Gemini API chatbot UI implementation.
      * **`bootstrap5chatbot.html`**: The chatbot UI built with Bootstrap 5.
      * **`csschatbot.html`**: The chatbot UI built with Pure CSS.
      * **`tailwindchatbot.html`**: The chatbot UI built with Tailwind CSS.
  * **`index.html`**: This is the main homepage of the project. It showcases links to each of the different chatbot UI implementations (Bootstrap 5 UI Chatbot, Pure CSS UI Chatbot, and Tailwind CSS UI Chatbot).

## UI Demos

Each UI demo focuses on a different front-end approach, providing a distinct user experience. Click "View Demo" on the main page (`index.html`) to interact with each one.

### Pure CSS Chatbot UI

A lightweight and highly controlled implementation, crafted purely with custom CSS. This version prioritizes minimal external dependencies and offers complete styling flexibility.

**Pure CSS Chatbot UI (Light Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/css-light.png">
</div>

**Pure CSS Chatbot UI (Dark Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/css-dark.png">
</div>

### Tailwind CSS Chatbot UI

A sleek and highly customizable UI, built efficiently with Tailwind CSS utility classes. It offers rapid development and a modern, consistent design, leveraging Tailwind's utility-first approach.

**Tailwind CSS Chatbot UI (Light Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/tailwind-light.png">
</div>

**Tailwind CSS Chatbot UI (Dark Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/tailwind-dark.png">
</div>


### Bootstrap 5 Chatbot UI

A robust and responsive interface, leveraging Bootstrap 5's comprehensive components and utility classes for a familiar and accessible user experience.

**Bootstrap 5 Chatbot UI (Light Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/bs5-light.png">
</div>

**Bootstrap 5 Chatbot UI (Dark Mode):**
<div align="center">
  <img src="https://rakeshdalvi25.github.io/gemini-api-chatbot/assets/img/screenshots/bs5-dark.png">
</div>


## Steps to Run the Gemini API Chatbot

To run this project, you will need a Gemini API Key.

1.  **Clone the Repository:**

    First, clone this repository to your local machine using Git:

    ```bash
    git clone https://github.com/rakeshdalvi25/gemini-api-chatbot
    ```

2.  **Navigate to the Project Directory:**

    Change into the cloned directory:

    ```bash
    cd gemini-api-chatbot
    ```

3.  **Obtain a Gemini API Key:**

    If you don't have one, get a Gemini API key from the Google AI Studio:
    [https://aistudio.google.com/](https://aistudio.google.com/)

4.  **Configure Your API Key:**

    You will need to integrate your Gemini API key into the JavaScript files responsible for making API calls. While the provided folder structure shows `bootstrap-script.js`, `tailwind-script.js`, and `vanilla-script.js`, the exact location where you'll insert your API key will depend on how the Gemini API integration is handled within those scripts.

    **Look for a placeholder or a variable where you can assign your API key within each of the JavaScript files (`bootstrap-script.js`, `tailwind-script.js`, `vanilla-script.js`) that interact with the Gemini API.** It might look something like this (example, actual implementation may vary):

    ```javascript
    // In bootstrap-script.js, tailwind-script.js, or vanilla-script.js
    const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual API key
    // ... rest of your API call logic
    ```

    **Important Security Note:** For production applications, it's highly recommended *not* to hardcode your API key directly in client-side JavaScript. Instead, consider using a backend server to proxy your API requests and securely manage your API key. However, for a local development or demo environment, this approach is common.

5.  **Open `index.html` in Your Browser:**

    Simply open the `index.html` file in your preferred web browser. You can do this by:

      * Navigating to the file in your file explorer and double-clicking it.
      * Using a "Go Live" extension in your IDE (like VS Code's Live Server) for a local development server, which is recommended for better resource loading.

    This will open the homepage showcasing the different chatbot UI options.

6.  **Explore the Chatbot UIs:**

    From `index.html`, you can click on the links to explore the Bootstrap 5, Pure CSS, or Tailwind CSS versions of the Gemini API chatbot. Interact with the chatbot in each UI to test its functionality.

-----