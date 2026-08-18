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
    const phoneInput = form.querySelector('input[name="phone"]');
    const consentInput = form.querySelector('input[name="privacyConsent"]');
    const status = form.querySelector('.lead-form-status');
    const success = modal.querySelector('.lead-success');
    const dialog = modal.querySelector('.lead-modal-dialog');
    const introNodes = modal.querySelectorAll('[data-lead-intro]');

    const openModal = event => {
        event.preventDefault();
        dialog?.setAttribute('aria-labelledby', 'lead-modal-title');
        introNodes.forEach(node => {
            node.hidden = false;
        });
        form.hidden = false;
        if (success) success.hidden = true;
        if (status) status.textContent = '';
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

    function formatPhone(digits) {
        if (!digits) return '';
        let out = '+7 (';
        if (digits.length > 0) out += digits.slice(0, 3);
        if (digits.length >= 3) out += ') ';
        if (digits.length > 3) out += digits.slice(3, 6);
        if (digits.length >= 6) out += '-';
        if (digits.length > 6) out += digits.slice(6, 8);
        if (digits.length >= 8) out += '-';
        if (digits.length > 8) out += digits.slice(8, 10);
        return out;
    }

    function cleanPhoneDigits(value) {
        let digits = String(value || '').replace(/\D/g, '');
        if (digits[0] === '7' || digits[0] === '8') digits = digits.slice(1);
        return digits.slice(0, 10);
    }

    function setPhone(input, digits) {
        input.dataset.digits = digits.slice(0, 10);
        input.value = formatPhone(input.dataset.digits);
        input.setSelectionRange(input.value.length, input.value.length);
    }

    function shakePhone(input) {
        input.classList.remove('input-shake');
        void input.offsetWidth;
        input.classList.add('input-shake');
    }

    function initPhoneMask(input) {
        if (!input || input.dataset.maskReady) return;
        input.dataset.maskReady = '1';
        let maskTimer = null;
        const schedule = () => {
            clearTimeout(maskTimer);
            maskTimer = setTimeout(() => normalizePhone(input), 420);
        };

        input.addEventListener('input', schedule);
        input.addEventListener('blur', () => {
            clearTimeout(maskTimer);
            normalizePhone(input);
        });
    }

    function normalizePhone(input) {
        const rawDigits = String(input.value || '').replace(/\D/g, '');
        if (!rawDigits) {
            input.dataset.digits = '';
            input.value = '';
            return;
        }

        if (rawDigits === '7' || rawDigits === '8') {
            input.dataset.digits = '';
            input.value = '+7 (';
            input.setSelectionRange(input.value.length, input.value.length);
            return;
        }

        const digits = cleanPhoneDigits(input.value);
        if (digits && digits[0] !== '9') {
            input.dataset.digits = '';
            input.value = '';
            shakePhone(input);
            return;
        }

        setPhone(input, digits);
    }

    initPhoneMask(phoneInput);

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        normalizePhone(phoneInput);
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const phoneDigits = cleanPhoneDigits(formData.get('phone'));

        if (status) status.textContent = '';

        if (name.length < 2) {
            if (status) status.textContent = 'Введите имя, чтобы мы понимали, к кому обращаться.';
            firstInput?.focus();
            return;
        }

        if (phoneDigits.length < 10) {
            if (status) status.textContent = 'Введите телефон полностью: +7 (999) 999-99-99.';
            shakePhone(phoneInput);
            phoneInput?.focus();
            return;
        }

        if (phoneDigits[0] !== '9') {
            if (status) status.textContent = 'Введите российский мобильный номер, начиная с 9.';
            shakePhone(phoneInput);
            phoneInput?.focus();
            return;
        }

        if (!consentInput?.checked) {
            if (status) status.textContent = 'Нужно согласие на обработку персональных данных.';
            consentInput?.focus();
            return;
        }

        const payload = {
            name,
            phone: formatPhone(phoneDigits),
            contactMethod: formData.get('contactMethod') || 'call',
            privacyConsent: true,
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
            setPhone(phoneInput, '');
            if (status) status.textContent = '';
            form.hidden = true;
            introNodes.forEach(node => {
                node.hidden = true;
            });
            if (success) success.hidden = false;
            dialog?.setAttribute('aria-labelledby', 'lead-success-title');
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
