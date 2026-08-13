document.addEventListener('DOMContentLoaded', () => {
    const parallaxLayer = document.querySelector('.parallax-layer');
    const bgImage = document.querySelector('.bg-image');
    const bgGrid = document.querySelector('.bg-grid');
    let ticking = false;

    function updateParallax() {
        // Disable parallax translation on mobile
        const isMobile = window.innerWidth <= 992;
        
        const docHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        const scrollableHeight = docHeight - window.innerHeight;
        let scrollPercent = 0;
        if (scrollableHeight > 0) {
            scrollPercent = window.scrollY / scrollableHeight;
        }
        const percent = Math.min(Math.max(scrollPercent, 0), 1);
        
        const maxTranslate = window.innerHeight * (isMobile ? 0.22 : 0.5);
        const currentTranslate = percent * maxTranslate;
        
        if (parallaxLayer) {
            parallaxLayer.style.transform = isMobile ? 'translateY(0)' : `translateY(-${currentTranslate}px)`;
        }
        
        // Calculate exact pixel position for the center of the radial gradients
        const centerY = window.innerHeight * 0.5 + currentTranslate;
        
        // Use vmin for color stops! This guarantees the circle fits perfectly inside the screen 
        if (bgImage) {
            const imgGradient = `radial-gradient(circle at 50% ${centerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45vmin, rgba(0,0,0,0.5) 120vmin, rgba(0,0,0,1) 230vmin)`;
            bgImage.style.maskImage = imgGradient;
            bgImage.style.webkitMaskImage = imgGradient;
            bgImage.style.backgroundPosition = isMobile ? `50% calc(50% + ${currentTranslate * 0.45}px)` : 'center';
        }
        if (bgGrid) {
            const gridGradient = `radial-gradient(circle at 50% ${centerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35vmin, rgba(0,0,0,0.5) 90vmin, rgba(0,0,0,1) 230vmin)`;
            bgGrid.style.maskImage = gridGradient;
            bgGrid.style.webkitMaskImage = gridGradient;
            bgGrid.style.backgroundPosition = isMobile ? `0 ${currentTranslate * 0.35}px` : '0 0';
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    
    // Initial call
    updateParallax();
});

document.addEventListener('DOMContentLoaded', () => {
    const utms = window.location.search;
    if (utms) {
        document.querySelectorAll('a[href^="https://qtickets.ru"]').forEach(link => {
            try {
                const url = new URL(link.href);
                const params = new URLSearchParams(utms);
                for (const [key, value] of params) {
                    url.searchParams.set(key, value);
                }
                link.href = url.toString();
            } catch (e) {
                console.error('Error parsing URL for UTMs', e);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-goal]').forEach(link => {
        link.addEventListener('click', () => {
            if (window.ym) {
                ym(111553845, 'reachGoal', link.dataset.goal);
            }
        });
    });

    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuButton = document.querySelector('.hamburger');
    if (menuToggle && menuButton) {
        menuToggle.addEventListener('change', () => {
            menuButton.setAttribute('aria-expanded', String(menuToggle.checked));
        });
        menuButton.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                menuToggle.checked = !menuToggle.checked;
                menuToggle.dispatchEvent(new Event('change'));
            }
        });
    }

    const video = document.querySelector('video[data-src]');
    if (!video) return;

    const loadVideo = () => {
        if (!video.src) {
            video.src = video.dataset.src;
            video.play().catch(() => {});
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadVideo();
                observer.disconnect();
            }
        }, { rootMargin: '200px' });
        observer.observe(video);
    } else {
        loadVideo();
    }
});
