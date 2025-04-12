let wallpapers = [];  // Global wallpapers array

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    loadWallpapers();
});

document.addEventListener("DOMContentLoaded", function() {
    const modal = document.querySelector(".modal");
    const closeButton = document.querySelector(".close");

    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

// Toggle Dark Mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}
// Scroll Animation (Fix: Attach Observer to Elements)  
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.wall-item').forEach(el => observer.observe(el));

// Load Wallpapers with Error Handling
async function loadWallpapers() {
    try {
        const res = await fetch('https://wallpaper-app-ur40.onrender.com/api/wallpapers');
        if (!res.ok) throw new Error('Failed to load wallpapers');

        wallpapers = await res.json();   // Save globally
        displayWallpapers(wallpapers);   // Pass to display
    } catch (error) {
        console.error('Error loading wallpapers:', error);
    }
}

// Display Wallpapers with Description
function displayWallpapers(wallpapers) {
    const container = document.getElementById("wallpaperContainer");
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


function openPreview(url) {
    const modal = document.getElementById('previewModal');
    const modalImg = document.getElementById('modalImg');
    const downloadBtn = document.getElementById('downloadBtn');
    const modalDescription = document.getElementById('modalDescription');

    const wallpaper = wallpapers.find(w => w.url === url);

    modal.style.display = "flex";
    modalImg.src = url;
    downloadBtn.setAttribute("onclick", `downloadImage('${url}')`);

    if (wallpaper) {
        modalDescription.innerHTML = wallpaper.description;
    } else {
        modalDescription.innerHTML = "High-quality AI-generated wallpaper designed to elevate your device's aesthetic.";
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
    document.getElementById('previewModal').style.display = "none";
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
