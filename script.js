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
            if (isMobile) {
                bgImage.style.maskImage = '';
                bgImage.style.webkitMaskImage = '';
            } else {
                const imgGradient = `radial-gradient(circle at 50% ${centerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45vmin, rgba(0,0,0,0.5) 120vmin, rgba(0,0,0,1) 230vmin)`;
                bgImage.style.maskImage = imgGradient;
                bgImage.style.webkitMaskImage = imgGradient;
            }
            bgImage.style.backgroundPosition = isMobile ? `50% calc(50% + ${currentTranslate * 0.45}px)` : 'center';
        }
        if (bgGrid) {
            if (isMobile) {
                bgGrid.style.maskImage = '';
                bgGrid.style.webkitMaskImage = '';
            } else {
                const gridGradient = `radial-gradient(circle at 50% ${centerY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35vmin, rgba(0,0,0,0.5) 90vmin, rgba(0,0,0,1) 230vmin)`;
                bgGrid.style.maskImage = gridGradient;
                bgGrid.style.webkitMaskImage = gridGradient;
            }
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
    const map = document.querySelector('.yandex-map[data-src]');
    if (!map) return;

    const loadMap = () => {
        if (!map.src || map.src === 'about:blank') {
            map.src = map.dataset.src;
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadMap();
                observer.disconnect();
            }
        }, { rootMargin: '1200px' });
        observer.observe(map);
    }

    const idle = window.requestIdleCallback || (callback => setTimeout(callback, 1400));
    window.addEventListener('load', () => idle(loadMap, { timeout: 3000 }), { once: true });
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
        link.addEventListener('click', event => {
            if (!window.ym || !link.dataset.goal) return;

            const opensNewTab = link.target && link.target.toLowerCase() !== '_self';
            if (opensNewTab || event.defaultPrevented) {
                ym(111553845, 'reachGoal', link.dataset.goal);
                return;
            }

            event.preventDefault();
            let opened = false;
            const go = () => {
                if (opened) return;
                opened = true;
                window.location.href = link.href;
            };

            ym(111553845, 'reachGoal', link.dataset.goal, {}, go);
            setTimeout(go, 500);
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

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lead-modal');
    const form = document.getElementById('lead-form');
    if (!modal || !form) return;

    const privacyModal = document.getElementById('privacy-modal');
    const firstInput = form.querySelector('input[name="name"]');
    const status = form.querySelector('.lead-form-status');

    const openModal = event => {
        event.preventDefault();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (window.ym) ym(111553845, 'reachGoal', 'book_place');
        setTimeout(() => firstInput?.focus(), 50);
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!privacyModal?.classList.contains('is-open')) {
            document.body.classList.remove('modal-open');
        }
    };

    const openPrivacyModal = event => {
        event.preventDefault();
        privacyModal?.classList.add('is-open');
        privacyModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closePrivacyModal = () => {
        privacyModal?.classList.remove('is-open');
        privacyModal?.setAttribute('aria-hidden', 'true');
        if (!modal.classList.contains('is-open')) {
            document.body.classList.remove('modal-open');
        }
    };

    document.querySelectorAll('[data-open-lead]').forEach(button => {
        button.addEventListener('click', openModal);
    });

    modal.querySelectorAll('[data-close-lead]').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.querySelectorAll('[data-open-privacy]').forEach(button => {
        button.addEventListener('click', openPrivacyModal);
    });

    privacyModal?.querySelectorAll('[data-close-privacy]').forEach(button => {
        button.addEventListener('click', closePrivacyModal);
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (privacyModal?.classList.contains('is-open')) {
            closePrivacyModal();
            return;
        }
        if (modal.classList.contains('is-open')) closeModal();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            contactMethod: formData.get('contactMethod') || 'call',
            privacyConsent: formData.get('privacyConsent') === 'on',
            page: window.location.href
        };

        button.disabled = true;
        if (status) status.textContent = 'Отправляем...';

        try {
            const response = await fetch('/api/exhibitor-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Request failed');
            form.reset();
            form.contactMethod.value = 'call';
            if (status) status.textContent = 'Заявка отправлена. Мы свяжемся с вами.';
            if (window.ym) ym(111553845, 'reachGoal', 'exhibitor_lead_submit');
        } catch {
            if (status) status.textContent = 'Не получилось отправить. Позвоните: +7 (905) 809-05-17.';
        } finally {
            button.disabled = false;
        }
    });
});

document.addEventListener('click', event => {
    const link = event.target.closest?.('[data-scroll-top]');
    if (!link) return;

    event.preventDefault();
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
});
