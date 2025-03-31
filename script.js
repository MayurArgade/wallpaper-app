// Dark Mode Toggle Functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Set initial theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Scroll Animation Logic
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Load Wallpapers Function with Error Handling
async function loadWallpapers() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/wallpapers');
        if (!res.ok) throw new Error('Failed to load wallpapers');
        const wallpapers = await res.json();
        displayWallpapers(wallpapers);
    } catch (error) {
        console.error('Error loading wallpapers:', error);
        alert("Error loading wallpapers. Please try again later.");
    }
}

// Display Wallpapers Function
function displayWallpapers(wallpapers) {
    const container = document.getElementById("wallpaperContainer");
    container.innerHTML = ""; // Clear previous content

    if (wallpapers.length === 0) {
        container.innerHTML = "<p>No wallpapers available.</p>"; // Show message if no wallpapers are found
    } else {
        wallpapers.forEach(wallpaper => {
            const div = document.createElement("div");
            div.classList.add("wall-item", "scroll-reveal");
            div.innerHTML = `
                <img src="${wallpaper.url}" alt="Wallpaper">
                ${wallpaper.premium ? `<button class="download-btn premium" onclick="buyPremium()">Buy ($5)</button>`
                                    : `<button class="download-btn" onclick="downloadImage('${wallpaper.url}')">Download</button>`}
            `;
            container.appendChild(div);
            observer.observe(div); // Apply scroll animations to each wallpaper item
        });
    }
}

// Filter Wallpapers Based on Premium
function filterWallpapers(premium) {
    fetch('http://127.0.0.1:8000/api/wallpapers')
        .then(res => res.json())
        .then(data => {
            const filtered = data.filter(w => w.premium === premium);
            displayWallpapers(filtered);
        })
        .catch(error => console.error('Error filtering wallpapers:', error));
}

// Buy Premium Function
function buyPremium() {
    window.open("https://gumroad.com/l/YOUR-PRODUCT-ID", "_blank");
}

// Download Image Function
function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop(); // Use the filename from the URL
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initial Load of Wallpapers
loadWallpapers();

// Disable Right Click on Images
document.addEventListener("contextmenu", function (event) {
    if (event.target.tagName.toLowerCase() === "img") {
        event.preventDefault(); // Prevent right-click on images
    }
});
