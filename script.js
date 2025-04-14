let wallpapers = [];  // Global wallpapers array

// DOM Content Loaded - Theme and Load Wallpapers
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('theme');
    const icon = document.getElementById('themeIcon');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        icon?.classList.add('fa-sun');
        icon?.classList.remove('fa-moon');
    } else {
        icon?.classList.add('fa-moon');
        icon?.classList.remove('fa-sun');
    }

    loadWallpapers();

    // Modal Close Logic
    const modal = document.querySelector(".modal");
    const closeButton = document.querySelector(".close");

    if (modal && closeButton) {
        closeButton.addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }
});

// Toggle Dark Mode (with Icon)
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    const isDark = body.classList.toggle('dark-mode');

    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    icon?.classList.toggle('fa-sun', isDark);
    icon?.classList.toggle('fa-moon', !isDark);
}

// Intersection Observer for animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Observe wallpaper items
document.querySelectorAll('.wall-item').forEach(el => observer.observe(el));
// Observe product cards (if any)
document.querySelectorAll('.product-card').forEach(card => observer.observe(card));

// Load Wallpapers with Error Handling
async function loadWallpapers() {
    try {
        const res = await fetch('https://wallpaper-app-ur40.onrender.com/api/wallpapers');
        if (!res.ok) throw new Error('Failed to load wallpapers');

        wallpapers = await res.json();
        displayWallpapers(wallpapers);
    } catch (error) {
        console.error('Error loading wallpapers:', error);
    }
}

// Display Wallpapers with Description
function displayWallpapers(wallpapers) {
    const container = document.getElementById("wallpaperContainer");
    if (!container) {
        console.warn("Container not found.");
        return;
    }

    container.innerHTML = "";

    wallpapers.forEach(wall => {
        const div = document.createElement("div");
        div.classList.add("wall-item");

        div.innerHTML = `
            <img src="${wall.url}" alt="Wallpaper" onclick="openPreview('${wall.url}')">
            <p>${wall.description}</p>
        `;

        container.appendChild(div);
    });
}

// Open Wallpaper Preview
function openPreview(url) {
    const modal = document.getElementById('previewModal');
    const modalImg = document.getElementById('modalImg');
    const downloadBtn = document.getElementById('downloadBtn');
    const modalDescription = document.getElementById('modalDescription');

    const wallpaper = wallpapers.find(w => w.url === url);

    if (modal && modalImg && downloadBtn && modalDescription) {
        modal.style.display = "flex";
        modalImg.src = url;
        downloadBtn.setAttribute("onclick", `downloadImage('${url}')`);

        modalDescription.innerHTML = wallpaper
            ? wallpaper.description
            : "High-quality AI-generated wallpaper designed to elevate your device's aesthetic.";
    }
}

// Load Similar Wallpapers
async function loadSimilarWallpapers(currentUrl, container) {
    try {
        const res = await fetch('https://wallpaper-app-ur40.onrender.com/api/wallpapers');
        if (!res.ok) throw new Error('Failed to load similar wallpapers');
        const wallpapers = await res.json();

        const similar = wallpapers.filter(w => w.url !== currentUrl).slice(0, 4);

        container.innerHTML = similar.map(wall => `
            <img src="${wall.url}" onclick="openPreview('${wall.url}')" class="similar-img">
        `).join('');
    } catch (error) {
        console.error('Error loading similar wallpapers:', error);
    }
}

// Close Preview Modal
function closePreview() {
    const modal = document.getElementById('previewModal');
    if (modal) modal.style.display = "none";
}

// Download Image
function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Filter Wallpapers
async function filterWallpapers(premium) {
    try {
        const res = await fetch('https://wallpaper-app-ur40.onrender.com/api/wallpapers');
        if (!res.ok) throw new Error('Failed to filter wallpapers');
        const data = await res.json();
        const filtered = data.filter(w => w.premium === premium);
        displayWallpapers(filtered);
    } catch (error) {
        console.error('Error filtering wallpapers:', error);
    }
}

// Buy Premium Wallpaper
function buyPremium(wallpaperId) {
    const useRazorpay = confirm("Do you want to pay via Razorpay? Click 'Cancel' for Gumroad.");

    if (useRazorpay) {
        const options = {
            key: "YOUR_RAZORPAY_KEY",
            amount: 50000,
            currency: "INR",
            name: "VibeWallz Premium",
            description: "High-quality AI-generated wallpaper",
            image: "https://yourwebsite.com/logo.png",
            handler: function (response) {
                alert("Payment successful! Your wallpaper is now unlocked.");
            },
            theme: { color: "#F37254" },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } else {
        window.open("https://mayurargade.gumroad.com/l/dthpvk", "_blank");
    }
}

// Disable Right Click on Images
document.addEventListener("contextmenu", function (event) {
    if (event.target.tagName.toLowerCase() === "img" && event.target.closest(".wall-item")) {
        event.preventDefault();
    }
});
