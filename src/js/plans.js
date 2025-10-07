import { API_BASE_URL } from './config.js';
export async function setupPlanCarousel() {
    const planCardsContainer = document.getElementById('plan-cards');
    if (!planCardsContainer) return;

    let plans = [];

    try {
        const response = await fetch(`${API_BASE_URL}/api/plans`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        plans = await response.json();

        // If API returns an empty array, handle it
        if (plans.length === 0) {
             throw new Error("No plans found from API.");
        }

    } catch (error) {
        console.error("Could not fetch plans:", error);
        planCardsContainer.innerHTML = `<p class="text-white text-center">We couldn't load our plans at the moment. Please try again later.</p>`;
        return; // Stop the function here
    }
    
    let centerIndex = 0;
    let cardElements = [];
    let autoRotateInterval;

    planCardsContainer.style.position = 'relative';
    planCardsContainer.innerHTML = plans.map((plan, index) => `
        <div class="plan-card" data-index="${index}" style="position: absolute; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="card-inner bg-gradient-to-b from-[#1a3139] to-[#0ea9bf] ${plan.color || 'border-2 border-[#56DEFC] ring-4 ring-[#56DEFC]/40'} rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center transition-all duration-300" style="min-width: 260px; max-width: 320px; min-height: 370px;">
                ${plan.icon || `<svg class="w-10 h-10 mb-2 text-gray-300 animate-bounce" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="#e5e7eb"/></svg>`}
                <span class="text-white/80 font-semibold mb-2">${plan.name}</span>
                <div class="text-3xl md:text-4xl font-bold mb-2 text-white">₱${plan.price} <span class="text-lg font-normal">/ Month</span></div>
                <ul class="text-white/90 space-y-2 mb-6 text-center">${plan.features.map(d => `<li>✔ ${d}</li>`).join('')}</ul>
                <button onclick="window.location.href='register.html'" class="apply-btn bg-[#56DEFC] hover:bg-[#0ea9bf] text-[#1a3139] font-bold px-6 py-2 rounded-full shadow transition hover:scale-110">Apply Now →</button>
                <p class="plan-note text-white/80 text-sm mt-4 text-center transition-opacity duration-300">${plan.note || ''}</p>
            </div>
        </div>
    `).join('');
    cardElements = Array.from(planCardsContainer.children);

    function updateCarouselPositions(instant = false) {
        const n = plans.length;
        // Check screen size once, outside the loop
        const isMobile = window.innerWidth < 768;

        // Use a single, clean loop
        cardElements.forEach((card, i) => {
            if (instant) card.style.transition = 'none';
            
            const note = card.querySelector('.plan-note');
            const button = card.querySelector('.apply-btn');
            let offset = i - centerIndex;
            if (offset > n / 2) offset -= n;
            if (offset < -n / 2) offset += n;
            
            // --- Responsive Logic ---
            if (isMobile) {
                // --- Mobile Logic: Simple and focused ---
                let transform, opacity, z;
                
                if (offset === 0) {
                    transform = 'translateX(0px) scale(1)';
                    opacity = 1;
                    z = 30;
                    note.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    card.style.cursor = 'default';
                } else {
                    transform = `translateX(${offset * 100}%) scale(0.8)`;
                    opacity = 0;
                    z = 10;
                    note.style.opacity = '0';
                    button.style.pointerEvents = 'none';
                    card.style.cursor = 'pointer';
                }
                
                card.style.transform = transform;
                card.style.opacity = opacity;
                card.style.zIndex = z;
                card.querySelector('.card-inner').style.filter = 'blur(0px)';

            } else {
                // --- Desktop Logic: Your original 3D effect ---
                let scale, opacity, z, blur, x;
                const cardSpacing = 200;
                
                switch (offset) {
                    case 0: scale = 1.1; opacity = 1; z = 30; blur = 0; x = 0; note.style.opacity = '1'; button.style.pointerEvents = 'auto'; card.style.cursor = 'default'; break;
                    case 1: case -1: scale = 0.9; opacity = 0.7; z = 20; blur = 1; x = offset * cardSpacing; note.style.opacity = '0'; button.style.pointerEvents = 'none'; card.style.cursor = 'pointer'; break;
                    case 2: case -2: scale = 0.7; opacity = 0.4; z = 10; blur = 2; x = offset * cardSpacing; note.style.opacity = '0'; button.style.pointerEvents = 'none'; card.style.cursor = 'pointer'; break;
                    default: scale = 0.5; opacity = 0; z = 0; blur = 3; x = offset > 0 ? cardSpacing * 3 : -cardSpacing * 3; button.style.pointerEvents = 'none'; card.style.cursor = 'default'; break;
                }
                
                card.style.transform = `translateX(${x}px) scale(${scale})`;
                card.style.zIndex = z;
                card.style.opacity = opacity;
                card.querySelector('.card-inner').style.filter = `blur(${blur}px)`;
            }
            
            if (instant) {
                card.offsetHeight;
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
    }

    function changePlan(direction) {
        centerIndex = (centerIndex + direction + plans.length) % plans.length;
        updateCarouselPositions();
        startAutoRotate();
    }

    const startAutoRotate = () => {
        stopAutoRotate();
        autoRotateInterval = setInterval(() => changePlan(1), 4000);
    };
    const stopAutoRotate = () => clearInterval(autoRotateInterval);

    // Initial setup
    updateCarouselPositions(true);

    // --- IMPROVEMENT: Add a resize listener ---
    // This makes the carousel automatically switch between mobile and desktop views
    // if the user resizes their browser window, without needing a refresh.
    window.addEventListener('resize', () => updateCarouselPositions(true));

    // --- Event Listeners ---
    document.getElementById('plan-next').onclick = () => changePlan(1);
    document.getElementById('plan-prev').onclick = () => changePlan(-1);
    document.getElementById('plan-next-mobile').onclick = () => changePlan(1);
    document.getElementById('plan-prev-mobile').onclick = () => changePlan(-1);
    
    planCardsContainer.addEventListener('click', (e) => {
        const clickedCard = e.target.closest('.plan-card');
        if (clickedCard && clickedCard.style.cursor === 'pointer') {
            centerIndex = parseInt(clickedCard.dataset.index, 10);
            updateCarouselPositions();
        }
    });
    planCardsContainer.addEventListener('mouseenter', stopAutoRotate);
    planCardsContainer.addEventListener('mouseleave', startAutoRotate);
    startAutoRotate();
}