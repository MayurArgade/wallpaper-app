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
        const res = await fetch('https://wallpaper-app-ur40.onrender.com/api/wallpapers');
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
        container.innerHTML = "<p>No wallpapers available.</p>";
    } else {
        wallpapers.forEach(wallpaper => {
            const div = document.createElement("div");
            div.classList.add("wall-item", "scroll-reveal");
            div.innerHTML = `
               <img src="${wallpaper.url.startsWith('/') ? 'https://wallpaper-app-ur40.onrender.com' + wallpaper.url : wallpaper.url}" alt="Wallpaper">
                ${wallpaper.premium ? 
                    `<button class="download-btn premium" onclick="buyPremium('${wallpaper.id}')">Buy ($5)</button>` :
                    `<button class="download-btn" onclick="downloadImage('${wallpaper.url}')">Download</button>`
                }
            `;
            container.appendChild(div);
            observer.observe(div);
        });
    }
}

// Filter Wallpapers Based on Premium
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

// Buy Premium Function (Gumroad + Razorpay)
function buyPremium(wallpaperId) {
    const useRazorpay = confirm("Do you want to pay via Razorpay? Click 'Cancel' for Gumroad.");

    if (useRazorpay) {
        const options = {
            key: "YOUR_RAZORPAY_KEY", // Replace with your Razorpay Key
            amount: 50000, // ₹500 in paise
            currency: "INR",
            name: "VibeWallz Premium Wallpaper",
            description: "High-quality AI-generated wallpaper",
            image: "https://yourwebsite.com/logo.png", // Replace with your logo
            handler: function (response) {
                alert("Payment successful! Your wallpaper is now unlocked.");
                // Here, you can provide access to the wallpaper
            },
            theme: {
                color: "#F37254",
            },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } else {
    window.open("https://mayurargade.gumroad.com/l/dthpvk", "_blank");
    }
}

// Download Image Function
function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initial Load of Wallpapers
loadWallpapers();

// Disable Right Click on Images (Only for Wallpapers)
document.addEventListener("contextmenu", function (event) {
    if (event.target.tagName.toLowerCase() === "img" && event.target.closest(".wall-item")) {
        event.preventDefault();
    }
});
