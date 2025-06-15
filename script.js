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
        const container = document.getElementById("wallpaperContainer");
        if (container) {
            container.innerHTML = '<p>Sorry, no wallpapers available at the moment. Please try again later.</p>';
        }
    }
}

// Display Wallpapers with Description
function displayWallpapers(wallpapers) {
    const container = document.getElementById("wallpaperContainer");
    if (!container) return;

    container.innerHTML = "";

    // Sort with "isNew" wallpapers first
    wallpapers.sort((a, b) => (b.isNew === true) - (a.isNew === true));

    // Get seen URLs from localStorage
    const seenWallpapers = JSON.parse(localStorage.getItem('seenWallpapers') || '[]');

    wallpapers.forEach(wall => {
        const div = document.createElement("div");
        div.classList.add("wall-item");

        const isNew = wall.isNew && !seenWallpapers.includes(wall.url);

        div.innerHTML = `
            ${isNew ? '<span class="new-badge">NEW</span>' : ''}
            <img src="${wall.url}" alt="Wallpaper" onclick="openPreview('${wall.url}')">
            <p>${wall.description}</p>
        `;

        container.appendChild(div);
        if (isNew) {
    setTimeout(() => {
        const badge = div.querySelector('.new-badge');
        if (badge) badge.remove(); 
    }, 7000);
};
        // Mark it as seen
        if (isNew) {
            seenWallpapers.push(wall.url);
        }
    });

    // Save updated list
    localStorage.setItem('seenWallpapers', JSON.stringify(seenWallpapers));
}


// Open Wallpaper Preview
function openPreview(url) {
    const modal = document.getElementById('previewModal');
    const modalImg = document.getElementById('modalImg');
    const downloadBtn = document.getElementById('downloadBtn');
    const modalDescription = document.getElementById('modalDescription');

    // Ensure wallpapers data is available
    if (wallpapers.length === 0) {
        console.error('No wallpapers available.');
        return;
    }

    const wallpaper = wallpapers.find(w => w.url === url); // Find the wallpaper from the data

    if (modal && modalImg && downloadBtn && modalDescription) {
        modal.style.display = "flex"; // Open the modal

        modalImg.src = url; // Set the image source to the provided URL
        modalDescription.innerHTML = wallpaper
            ? wallpaper.description
            : "High-quality AI-generated wallpaper designed to elevate your device's aesthetic."; // Set the description

        // Update the download button action dynamically
        downloadBtn.onclick = function() {
            // Disable the download button to prevent multiple clicks
            downloadBtn.disabled = true;

            downloadImage(url); // Trigger image download

            // Re-enable the download button after a brief delay
            setTimeout(() => {
                downloadBtn.disabled = false;
            }, 1000); // Adjust delay as needed
        };
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

// Category Filtering
const categoryButtons = document.querySelectorAll('.category-btn');
const products = document.querySelectorAll('.product-card');

// Add click event listener to each category button
categoryButtons.forEach(button => {
  button.addEventListener('click', function () {
    const category = button.dataset.category;
    
    // Highlight the active button
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Filter products based on category
    products.forEach(product => {
      if (category === 'all' || product.dataset.category === category) {
        product.style.display = 'block'; // Show product
      } else {
        product.style.display = 'none'; // Hide product
      }
    });
  });
});

const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    console.log(entry.isIntersecting);  // Log if the element is in view
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

// Define the cards variable to target the product cards
const cards = document.querySelectorAll('.product-card');

cards.forEach(card => cardObserver.observe(card)); 

let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (!navbar) return;

    if (window.scrollY > lastScrollY) {
        // Scrolling down
        navbar.classList.remove('show');
        navbar.classList.add('hide');
    } else {
        // Scrolling up
        navbar.classList.remove('hide');
        navbar.classList.add('show');
    }

    lastScrollY = window.scrollY;
});



