/**
 * Portfolio Script - Optimized for GitHub Pages
 * Handles data fetching with caching, lazy loading, and dynamic rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initSmoothScroll();
    loadPortfolioData();
});

// ============================================
// DATA LOADING WITH CACHING
// ============================================

/**
 * Load portfolio data from cache or API
 */
async function loadPortfolioData() {
    try {
        let data;

        if (CONFIG.USE_SAMPLE_DATA) {
            await delay(300);
            data = SAMPLE_DATA;
        } else {
            // Check cache first
            data = getCachedData();

            if (!data) {
                // Fetch from API with timeout
                data = await fetchWithTimeout(
                    `${CONFIG.API_URL}?action=all`,
                    CONFIG.API_TIMEOUT
                );

                if (data.success) {
                    data = data.data;
                    // Cache the data
                    setCachedData(data);
                } else {
                    throw new Error(data.error || 'Gagal memuat data');
                }
            }
        }

        // Render data to page
        renderProfile(data.profile);
        renderProjects(data.projects);
        renderSocialLinks(data.social);

        // Re-initialize scroll animations for new elements
        initScrollAnimations();
        initLazyLoading();

    } catch (error) {
        console.error('Error loading portfolio data:', error);
        showErrorState();
    }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

/**
 * Get cached data from sessionStorage
 */
function getCachedData() {
    try {
        const cached = sessionStorage.getItem('portfolio_data');
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < CONFIG.CACHE_DURATION) {
            return data;
        }

        // Cache expired
        sessionStorage.removeItem('portfolio_data');
        return null;
    } catch {
        return null;
    }
}

/**
 * Set cached data to sessionStorage
 */
function setCachedData(data) {
    try {
        sessionStorage.setItem('portfolio_data', JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
        // Storage might be full, ignore
    }
}

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => loadImage(img));
    }
}

/**
 * Load image from data-src
 */
function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    img.src = src;
    img.removeAttribute('data-src');
    img.classList.add('loaded');
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

/**
 * Render profile data to hero section
 */
function renderProfile(profile) {
    if (!profile) return;

    const heroName = document.getElementById('hero-name');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const logoInitial = document.getElementById('logo-initial');
    const logoName = document.getElementById('logo-name');
    const footerText = document.getElementById('footer-text');

    if (heroName && profile.name) {
        heroName.textContent = profile.name;
        heroName.classList.add('loaded');
    }

    if (heroTitle && profile.tagline) {
        heroTitle.textContent = profile.tagline;
        heroTitle.classList.add('loaded');
    }

    if (heroDescription && profile.description) {
        heroDescription.textContent = profile.description;
        heroDescription.classList.add('loaded');
    }

    // Update logo
    if (logoInitial && logoName && profile.name) {
        const nameParts = profile.name.split(' ');
        if (nameParts.length > 1) {
            logoInitial.textContent = nameParts[0].charAt(0);
            logoName.textContent = nameParts.slice(1).join(' ');
        } else {
            logoInitial.textContent = profile.name.charAt(0);
            logoName.textContent = profile.name.slice(1);
        }
    }

    // Update footer
    if (footerText && profile.name) {
        const year = new Date().getFullYear();
        footerText.textContent = `© ${year} ${profile.name}. Hak Cipta Dilindungi.`;
    }
}

/**
 * Render projects to grid with lazy loading
 */
function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid || !projects || projects.length === 0) return;

    grid.innerHTML = '';

    projects.forEach((project, index) => {
        const card = createProjectCard(project, index);
        grid.appendChild(card);
    });
}

/**
 * Create a project card element with lazy loading image
 */
function createProjectCard(project, index) {
    const article = document.createElement('article');
    article.className = 'project-card fade-in';
    article.style.transitionDelay = `${index * 0.1}s`;

    const tags = Array.isArray(project.tags)
        ? project.tags
        : (project.tags || '').split(',').map(t => t.trim()).filter(t => t);

    // Placeholder SVG for lazy loading
    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'%3E%3Crect fill='%23111' width='400' height='250'/%3E%3C/svg%3E`;

    article.innerHTML = `
        <div class="project-image">
            <img 
                src="${placeholderSvg}" 
                data-src="${project.image_url}" 
                alt="${project.title}" 
                loading="lazy"
                decoding="async"
                onerror="this.src='${placeholderSvg}'; this.classList.add('error')"
            >
            <div class="project-overlay">
                <a href="${project.link_project}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Lihat Proyek
                </a>
            </div>
        </div>
        <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
            <div class="project-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    return article;
}

/**
 * Render social/contact links
 */
function renderSocialLinks(social) {
    const container = document.getElementById('contact-links');
    if (!container || !social || social.length === 0) return;

    container.innerHTML = '';

    const icons = {
        email: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
        github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
        linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
        twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
        instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
        whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
        default: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
    };

    social.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'contact-link';
        a.target = link.platform === 'email' ? '_self' : '_blank';
        a.rel = 'noopener noreferrer';

        const icon = icons[link.icon] || icons[link.platform] || icons.default;
        const label = getDisplayLabel(link);

        a.innerHTML = `${icon} ${label}`;
        container.appendChild(a);
    });
}

/**
 * Get display label for social link
 */
function getDisplayLabel(link) {
    if (link.platform === 'email') {
        return link.url.replace('mailto:', '');
    }

    const platformLabels = {
        github: 'GitHub',
        linkedin: 'LinkedIn',
        twitter: 'Twitter',
        instagram: 'Instagram',
        whatsapp: 'WhatsApp',
        website: 'Website'
    };

    return platformLabels[link.platform] || link.platform || 'Link';
}

/**
 * Show error state
 */
function showErrorState() {
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        projectsGrid.innerHTML = `
            <div class="error-state">
                <p>Tidak dapat memuat proyek. Silakan coba lagi nanti.</p>
                <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 1rem;">
                    Muat Ulang
                </button>
            </div>
        `;
    }
}

/**
 * Utility: delay function
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ============================================
// ANIMATIONS
// ============================================

function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });

        fadeElements.forEach(el => observer.observe(el));
    } else {
        // Fallback
        fadeElements.forEach(el => el.classList.add('visible'));
    }
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateNavbar();
            updateActiveLink();
            ticking = false;
        });
        ticking = true;
    }
});

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.85)';
    }
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navHeight = document.querySelector('.navbar').offsetHeight;

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}
