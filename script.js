const getJokeBtn = document.getElementById("getJokeBtn");
const saveJokeBtn = document.getElementById("saveJokeBtn");
const themeToggle = document.getElementById("themeToggle");
const setupEl = document.getElementById("setup");
const punchlineEl = document.getElementById("punchline");
const loader = document.getElementById("loader");
const jokeContent = document.getElementById("jokeContainer");
const favoritesList = document.getElementById("favoritesList");

let currentJoke = null;
// Initialize favorites from Local Storage
let favorites = JSON.parse(localStorage.getItem("jokes")) || [];

// App Initialization
const init = () => {
    renderFavorites();
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") toggleTheme();
};

// Modern ES6 Async/Await Fetch with Error Handling
const fetchJoke = async () => {
    try {
        // Trigger UI Loading State
        jokeContent.classList.add("hidden");
        loader.classList.remove("hidden");
        saveJokeBtn.classList.add("hidden");
        saveJokeBtn.classList.remove("saved");
        saveJokeBtn.querySelector('i').className = "far fa-heart";

        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        
        if (!response.ok) throw new Error("Failed to fetch");
        
        const jokeData = await response.json();
        currentJoke = jokeData;

        // Update UI with new data
        setupEl.textContent = jokeData.setup;
        punchlineEl.textContent = jokeData.punchline;
        
        saveJokeBtn.classList.remove("hidden");
    } catch (error) {
        console.error("Error Fetching Joke:", error);
        setupEl.textContent = "Oops! Couldn't load a joke.";
        punchlineEl.textContent = "Check your connection and try again.";
    } finally {
        // Remove UI Loading State
        loader.classList.add("hidden");
        jokeContent.classList.remove("hidden");
    }
};

// Toggle Dark/Light Mode
const toggleTheme = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    if (isDark) {
        document.body.removeAttribute("data-theme");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem("theme", "light");
    } else {
        document.body.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem("theme", "dark");
    }
};

// Save current joke to favorites array and Local Storage
const saveJoke = () => {
    if (!currentJoke) return;
    
    // Check if it already exists to prevent duplicates
    const exists = favorites.some(j => j.id === currentJoke.id);
    
    if (!exists) {
        favorites.unshift(currentJoke); // Add to beginning of array
        localStorage.setItem("jokes", JSON.stringify(favorites));
        renderFavorites();
        
        // Visual feedback on the button
        saveJokeBtn.classList.add("saved");
        saveJokeBtn.querySelector('i').className = "fas fa-heart";
    }
};

// Delete a specific joke
const deleteJoke = (id) => {
    favorites = favorites.filter(j => j.id !== id);
    localStorage.setItem("jokes", JSON.stringify(favorites));
    renderFavorites();
};

// Map the favorites array to HTML list items
const renderFavorites = () => {
    if (favorites.length === 0) {
        favoritesList.innerHTML = "<li style='justify-content: center; opacity: 0.7;'>No saved jokes yet.</li>";
        return;
    }

    favoritesList.innerHTML = favorites.map(joke => `
        <li>
            <div style="flex: 1; padding-right: 15px;">
                <strong>${joke.setup}</strong> <br/>
                <span style="font-size: 0.9em; opacity: 0.8;">${joke.punchline}</span>
            </div>
            <button class="delete-btn" onclick="deleteJoke(${joke.id})" aria-label="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
};

// Expose delete function to window for inline onclick handler
window.deleteJoke = deleteJoke;

// Event Listeners
getJokeBtn.addEventListener("click", fetchJoke);
saveJokeBtn.addEventListener("click", saveJoke);
themeToggle.addEventListener("click", toggleTheme);

// Run initialization on load
init();