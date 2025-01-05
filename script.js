const menuToggle = document.getElementById('menu-toggle');
const linksContainer = document.getElementById('links-container');

menuToggle.addEventListener('click', () => {
    linksContainer.classList.toggle('visible');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && linksContainer.classList.contains('visible')) {
        linksContainer.classList.remove('visible');
    }
});

const imageData = [
    { name: 'brunch', date: '2024-02-15' },
    { name: 'hike', date: '2024-02-01' },
    { name: 'sky', date: '2024-01-20' },
    { name: 'nails', date: '2023-12-20' },
    { name: 'sign', date: '2023-12-05' },
    { name: 'street', date: '2023-11-20' },
    { name: 'tree', date: '2023-11-05' },
    { name: 'backyard', date: '2023-10-20' },
    { name: 'vinyl', date: '2023-10-05' },
    { name: 'tesla', date: '2023-09-20' },
    { name: 'taz', date: '2023-09-05' },
    { name: 'sonora', date: '2023-08-20' },
    { name: 'soju', date: '2023-07-05' },
    { name: 'tara', date: '2023-06-20' },
    { name: 'legs', date: '2023-06-15' },
    { name: 'back2', date: '2023-06-08' },
    { name: 'Michael', date: '2023-06-06' },
    { name: 'rug', date: '2023-06-04' },
    { name: 'charger', date: '2023-06-03' },
    { name: 'shillouette', date: '2023-06-02' },
    { name: 'art', date: '2023-06-01' }
].map(item => ({
    ...item,
    src: `images/${item.name}.jpeg`
}));

// Preload first few images
const PRELOAD_COUNT = 3;
function preloadInitialImages() {
    imageData.slice(0, PRELOAD_COUNT).forEach(image => {
        const img = new Image();
        img.src = image.src;
    });
}

// Cache DOM queries
const container = document.querySelector('.gallery-grid');
const formatDate = (() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return (dateString) => new Date(dateString).toLocaleDateString('en-US', options);
})();

function createCard(image, index) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    
    const img = new Image();
    img.className = 'gallery-image';
    img.alt = `Photo ${index + 1}`;
    img.loading = 'lazy';  // Use native lazy loading
    img.src = image.src;
    
    const date = document.createElement('div');
    date.className = 'image-date';
    date.textContent = formatDate(image.date);
    
    card.append(img, date);
    return card;
}

// Add this function to check if element is in center of viewport
function isInCenter(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + (rect.height / 2);
    const viewportCenter = viewportHeight / 2;
    
    // Consider "center" to be within 150px of the actual center
    return Math.abs(elementCenter - viewportCenter) < 150;
}

function isInViewportCenter(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + (rect.height / 2);
    const viewportCenter = windowHeight / 2;
    
    // Consider "center" to be within 100px of the actual center
    return Math.abs(elementCenter - viewportCenter) < 100;
}

function updateCenterFocus() {
    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
        if (isInViewportCenter(card)) {
            card.classList.add('in-center');
        } else {
            card.classList.remove('in-center');
        }
    });
}

function createGallery() {
    const fragment = document.createDocumentFragment();
    const shuffledImages = [...imageData].sort(() => Math.random() - 0.5);
    let currentBatch = 0;
    const batchSize = 5; // Increased batch size

    function loadNextBatch() {
        const start = currentBatch * batchSize;
        const end = start + batchSize;
        const batch = shuffledImages.slice(start, end);

        if (batch.length === 0) return;

        batch.forEach((image, i) => {
            const card = createCard(image, start + i);
            fragment.appendChild(card);
        });

        container.appendChild(fragment);
        currentBatch++;

        // Immediately observe new cards
        document.querySelectorAll('.gallery-card:not(.observed)').forEach(card => {
            observer.observe(card);
            card.classList.add('observed');
        });
    }

    // Modified Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            
            if (entry.isIntersecting) {
                // Fade in
                card.classList.add('visible');
                updateCenterFocus(); // Check center focus when new card becomes visible
                
                // Load next batch when near the end
                const cards = Array.from(container.children);
                const index = cards.indexOf(card);
                if (index >= cards.length - 3) {
                    loadNextBatch();
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '100px 0px'
    });

    // Load initial batches
    for (let i = 0; i < 2; i++) {
        loadNextBatch();
    }
    preloadInitialImages();

    // Add scroll event listener for center focus
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateCenterFocus();
            
            // Check if we're near the bottom
            const lastCard = container.lastElementChild;
            if (lastCard) {
                const rect = lastCard.getBoundingClientRect();
                if (rect.bottom < window.innerHeight * 1.5) {
                    loadNextBatch();
                }
            }
        }, 50); // Reduced timeout for more responsive focus updates
    }, { passive: true });

    // Initial center focus check
    setTimeout(updateCenterFocus, 100);
}

// Start gallery creation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGallery);
} else {
    createGallery();
}
