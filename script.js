// Google Design Style Cursor
const cursor = document.querySelector('.cursor');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation using requestAnimationFrame
function animateCursor() {
    // Ease the cursor position with smooth following
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.2; // Smooth following speed
    cursorY += dy * 0.2;
    
    // Apply transform (center the cursor on mouse position)
    cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// Initialize cursor position
cursorX = mouseX = window.innerWidth / 2;
cursorY = mouseY = window.innerHeight / 2;

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Navigation scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Section background-to-body sync
const sections = document.querySelectorAll('section');
function updateBodyBg() {
    let found = false;
    sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (!found && rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2) {
            found = true;
            if ((idx+1) % 2 === 1) {
                document.body.classList.add('bg-white');
                document.body.classList.remove('bg-black');
            } else {
                document.body.classList.add('bg-black');
                document.body.classList.remove('bg-white');
            }
        }
    });
}

// Hero hands fade out on scroll
function updateHeroHandsVisibility() {
    const heroSection = document.querySelector('#home');
    const heroHandsContainer = document.querySelector('.hero-hands-container');
    
    if (!heroSection || !heroHandsContainer) return;
    
    const rect = heroSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the hero section is visible
    let visibilityRatio = 1;
    
    if (rect.top < 0) {
        // Hero section is scrolling up and out of view
        visibilityRatio = Math.max(0, (rect.bottom) / windowHeight);
    } else if (rect.bottom > windowHeight) {
        // Hero section is partially visible from the top
        visibilityRatio = Math.max(0, (windowHeight - rect.top) / windowHeight);
    }
    
    // Ensure visibility ratio is between 0 and 1
    visibilityRatio = Math.max(0, Math.min(1, visibilityRatio));
    
    // Apply opacity to the hero hands container
    heroHandsContainer.style.setProperty('--hands-opacity', visibilityRatio);
}

// Fade hero background image on scroll
function updateHeroBgOpacity() {
    const hero = document.getElementById('home');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let ratio = 1;
    if (rect.top < 0) {
        ratio = Math.max(0, (rect.bottom) / windowHeight);
    } else if (rect.bottom > windowHeight) {
        ratio = Math.max(0, (windowHeight - rect.top) / windowHeight);
    }
    ratio = Math.max(0, Math.min(1, ratio));
    hero.style.setProperty('--hero-bg-opacity', ratio);

    // Zoom out: scale from 1 (fully visible) to 1.2 (zoomed out as it fades)
    const scale = 1 + (1 - ratio) * 0.8;
    hero.style.setProperty('--hero-bg-scale', scale);
}

window.addEventListener('scroll', updateBodyBg);
window.addEventListener('scroll', updateHeroHandsVisibility);
window.addEventListener('scroll', updateHeroBgOpacity);
window.addEventListener('resize', updateBodyBg);
window.addEventListener('resize', updateHeroHandsVisibility);
window.addEventListener('resize', updateHeroBgOpacity);
document.addEventListener('DOMContentLoaded', updateBodyBg);
document.addEventListener('DOMContentLoaded', updateHeroHandsVisibility);
document.addEventListener('DOMContentLoaded', updateHeroBgOpacity);

// Back to Top button functionality
document.getElementById('backToTop').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Show/hide Back to Top button from About section onward
const backToTopBtn = document.getElementById('backToTop');
const aboutSection = document.getElementById('about');

function toggleBackToTopBtn() {
    const rect = aboutSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}
window.addEventListener('scroll', toggleBackToTopBtn);
window.addEventListener('resize', toggleBackToTopBtn);
document.addEventListener('DOMContentLoaded', toggleBackToTopBtn);

// Add sketchy hover effect for contact buttons
// Pause wiggle animation on hover, resume on leave
function setupSketchyContactLinks() {
    document.querySelectorAll('.contact-links-overlay .contact-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        link.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    });
}

document.addEventListener('DOMContentLoaded', setupSketchyContactLinks); 