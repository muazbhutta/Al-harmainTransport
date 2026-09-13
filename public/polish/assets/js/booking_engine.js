/**
 * MAKARIM ALNABEEL - Premium Hero Booking Engine & Multi-Modal Wizard
 * Identical Flow & Feature set to muhabiya.com:
 * 1. Hero Buttons ("Select Your Service" / "Select a Package" / "Select Other Service") -> Opens #selection-modal
 * 2. Selection Modal -> Large Modal (modal-lg) with City Filter Dropdown & Grouped Services (Trending, Jeddah, Makkah, Madinah)
 * 3. Clicking any Service -> Opens #details-modal (Service Overview, Image, Details, Vehicle Picker, Locations Datalist, Flight Offset, Price SAR, Add to Cart & WhatsApp)
 */

(function () {
    'use strict';

    // --- DATA REPOSITORY ---
    const BOOKING_DATA = {
        categories: {
            1: "Airport Pick & Drops",
            2: "Inter-City (City to City)",
            3: "Local Transfer",
            4: "Ziyarat/Tours"
        },

        vehicles: [
            { id: 1, name: "Toyota Camry", pax: "3 Pax", luggage: "2 Bags", image: "img/m1.jpeg", class: "Executive Sedan" },
            { id: 2, name: "Hyundai Sonata", pax: "3 Pax", luggage: "2 Bags", image: "img/m2.jpg", class: "Comfort Sedan" },
            { id: 3, name: "Hyundai Staria", pax: "7 Pax", luggage: "7 Bags", image: "img/m3.jpg", class: "VIP Family Van" },
            { id: 4, name: "GMC XL Yukon", pax: "7 Pax", luggage: "8 Bags", image: "img/m4.png", class: "Luxury SUV" },
            { id: 5, name: "Toyota Hiace", pax: "11 Pax", luggage: "14 Bags", image: "img/m5.jpg", class: "Passenger Van" },
            { id: 6, name: "Coaster / Minibus", pax: "20 Pax", luggage: "25 Bags", image: "img/m6.jpg", class: "Coaster Bus" },
            { id: 7, name: "VIP Bus (50-Seater)", pax: "1-50 Pax", luggage: "40 Bags", image: "img/m7.webp", class: "Luxury Coach" }
        ],

        services: [
            { id: 25, cat: 4, city: "Makkah", isTrending: true, name: "3-in-1 Kiswa Factory / Makkah Museum / Sulah Hudaibiyah", image: "img/trending_1.jpg", desc: "Exclusive 3-in-1 tour visiting Kiswa Factory, Makkah Museum, and Sulah Hudaibiyah with private driver.", flight: false, pickup: true, dropoff: false, offset: null, prices: { 1: 250, 2: 250, 3: 270, 4: 470, 5: 340, 6: 450, 7: 550 } },
            { id: 20, cat: 4, city: "Madinah", isTrending: true, name: "Madinah Ziyarat", image: "img/madinah.jpg", desc: "Guided tour to holy landmarks in Madinah: Masjid Quba, Mount Uhud, Masjid al-Qiblatayn, and Seven Mosques.", flight: false, pickup: true, dropoff: false, offset: null, prices: { 1: 200, 2: 200, 3: 240, 4: 390, 5: 300, 6: 400, 7: 500 } },
            { id: 23, cat: 4, city: "Makkah", isTrending: true, name: "Makkah Hotel to Madinah Hotel (via Taif)", image: "img/trending_2.jpg", desc: "Scenic highway transfer from Makkah to Madinah featuring a guided Ziyarat stopover in Taif City.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 770, 2: 770, 3: 890, 4: 1670, 5: 1140, 6: 1500, 7: 1900 } },
            { id: 24, cat: 4, city: "Makkah", isTrending: true, name: "Makkah to Taif Ziyarat & Return", image: "img/a1.jpeg", desc: "Day excursion from Makkah to Taif (Shubra Palace, Cable Car, Al Hada Mountain) with return transport.", flight: false, pickup: true, dropoff: false, offset: null, prices: { 1: 420, 2: 420, 3: 470, 4: 820, 5: 570, 6: 750, 7: 950 } },
            { id: 19, cat: 4, city: "Makkah", isTrending: true, name: "Makkah Ziyarat", image: "img/4.avif", desc: "Guided tour to sacred sites in Makkah: Jabal al-Nour (Hira), Jabal Thawr, Mina, Arafat, Muzdalifah.", flight: false, pickup: true, dropoff: false, offset: null, prices: { 1: 200, 2: 200, 3: 240, 4: 390, 5: 300, 6: 400, 7: 500 } },

            { id: 1, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Airport to Jeddah Hotel", image: "img/a3.jpeg", desc: "Private transfer from Jeddah Airport (JED) directly to your hotel in Jeddah.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 2, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Airport to Makkah Hotel", image: "img/trending_1.jpg", desc: "Comfortable private transfer from Jeddah Airport to your hotel in the Holy City of Makkah.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 220, 2: 220, 3: 250, 4: 420, 5: 340, 6: 450, 7: 550 } },
            { id: 3, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Airport to Madinah Hotel", image: "img/a2.jpeg", desc: "Direct private transfer from Jeddah Airport to your hotel in Madinah Al Munawwarah.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 390, 2: 390, 3: 450, 4: 870, 5: 570, 6: 750, 7: 950 } },
            { id: 6, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Hotel to Jeddah Airport", image: "img/a3.jpeg", desc: "Punctual transfer from your Jeddah hotel back to Jeddah Airport JED.", flight: true, pickup: true, dropoff: false, offset: -3, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 7, cat: 2, city: "Jeddah", isTrending: false, name: "Jeddah Hotel to Makkah Hotel", image: "img/a1.jpeg", desc: "Inter-city private transfer from any hotel in Jeddah to Makkah hotel.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 220, 2: 220, 3: 250, 4: 420, 5: 340, 6: 450, 7: 550 } },
            { id: 9, cat: 2, city: "Jeddah", isTrending: false, name: "Jeddah Hotel to Madinah Hotel", image: "img/a2.jpeg", desc: "Comfortable long-distance trip from Jeddah hotel to Madinah hotel.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 390, 2: 390, 3: 450, 4: 870, 5: 570, 6: 750, 7: 950 } },

            { id: 10, cat: 1, city: "Makkah", isTrending: false, name: "Makkah Hotel to Jeddah Airport", image: "img/a3.jpeg", desc: "Timely departure transfer from your Makkah hotel to Jeddah Airport (JED).", flight: true, pickup: true, dropoff: false, offset: -4, prices: { 1: 190, 2: 190, 3: 220, 4: 370, 5: 290, 6: 390, 7: 490 } },
            { id: 11, cat: 2, city: "Makkah", isTrending: false, name: "Makkah Hotel to Madinah Hotel", image: "img/a1.jpeg", desc: "Direct highway transfer between Makkah and Madinah hotels.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 350, 2: 350, 3: 420, 4: 850, 5: 570, 6: 750, 7: 950 } },
            { id: 12, cat: 1, city: "Makkah", isTrending: false, name: "Makkah Hotel to Madinah Airport", image: "img/a2.jpeg", desc: "Direct transfer from Makkah hotel to Madinah Airport.", flight: true, pickup: true, dropoff: false, offset: -4, prices: { 1: 370, 2: 370, 3: 420, 4: 850, 5: 560, 6: 740, 7: 940 } },

            { id: 4, cat: 1, city: "Madinah", isTrending: false, name: "Madinah Airport to Madinah Hotel", image: "img/a3.jpeg", desc: "Seamless pickup from Prince Mohammad bin Abdulaziz Airport Madinah to your hotel.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 160, 2: 160, 3: 190, 4: 320, 5: 250, 6: 350, 7: 450 } },
            { id: 5, cat: 1, city: "Madinah", isTrending: false, name: "Madinah Airport to Makkah Hotel", image: "img/a1.jpeg", desc: "Direct transfer from Madinah Airport to your hotel in Makkah.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 350, 2: 350, 3: 420, 4: 850, 5: 570, 6: 750, 7: 950 } },
            { id: 8, cat: 1, city: "Madinah", isTrending: false, name: "Madinah Hotel to Madinah Airport", image: "img/a2.jpeg", desc: "Reliable transfer from your Madinah hotel to Madinah Airport.", flight: true, pickup: true, dropoff: false, offset: -3, prices: { 1: 130, 2: 130, 3: 160, 4: 290, 5: 220, 6: 300, 7: 420 } },
            { id: 13, cat: 1, city: "Madinah", isTrending: false, name: "Madinah Hotel to Jeddah Airport", image: "img/a3.jpeg", desc: "Long distance departure transfer from Madinah hotel to Jeddah Airport.", flight: true, pickup: true, dropoff: false, offset: -5, prices: { 1: 370, 2: 370, 3: 420, 4: 850, 5: 560, 6: 740, 7: 940 } },
            { id: 14, cat: 2, city: "Madinah", isTrending: false, name: "Madinah Hotel to Makkah Hotel", image: "img/a1.jpeg", desc: "Return inter-city trip from Madinah hotel to Makkah hotel.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 350, 2: 350, 3: 420, 4: 850, 5: 570, 6: 750, 7: 950 } },
            { id: 15, cat: 3, city: "Makkah", isTrending: false, name: "Makkah Hotel to Train Station", image: "img/a1.jpeg", desc: "Local transfer from Makkah hotel to Haramain High Speed Railway Station.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 16, cat: 3, city: "Makkah", isTrending: false, name: "Makkah Train Station to Makkah Hotel", image: "img/a3.jpeg", desc: "Local pickup from Makkah Haramain Train Station to your hotel.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 17, cat: 3, city: "Madinah", isTrending: false, name: "Madinah Train Station to Madinah Hotel", image: "img/a2.jpeg", desc: "Local pickup from Madinah Haramain Train Station to your hotel.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 18, cat: 3, city: "Madinah", isTrending: false, name: "Madinah Hotel to Madinah Train Station", image: "img/a1.jpeg", desc: "Local transfer from Madinah hotel to Haramain Train Station.", flight: false, pickup: true, dropoff: true, offset: null, prices: { 1: 140, 2: 140, 3: 170, 4: 270, 5: 200, 6: 280, 7: 380 } },
            { id: 26, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Airport to Makkah Hotel (Nusuk)", image: "img/a3.jpeg", desc: "Special Nusuk pilgrim transfer from Jeddah Airport to Makkah Hotel.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 250, 2: 250, 3: 270, 4: 470, 5: 340, 6: 450, 7: 550 } },
            { id: 27, cat: 1, city: "Jeddah", isTrending: false, name: "Jeddah Airport to Madinah Hotel (Nusuk)", image: "img/a2.jpeg", desc: "Special Nusuk pilgrim transfer from Jeddah Airport to Madinah Hotel.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 470, 2: 470, 3: 520, 4: 970, 5: 620, 6: 800, 7: 1050 } },
            { id: 28, cat: 1, city: "Madinah", isTrending: false, name: "Madinah Airport to Madinah Hotel (Express)", image: "img/a3.jpeg", desc: "Express transfer from Madinah Airport to Madinah Hotel.", flight: true, pickup: false, dropoff: true, offset: 1, prices: { 1: 200, 2: 200, 3: 240, 4: 400, 5: 300, 6: 400, 7: 500 } },
            { id: 30, cat: 4, city: "Makkah", isTrending: false, name: "Per Hour Rates (minimum 5 hrs)", image: "uploads/services/per_hour_rates_hira.jpg", desc: "Flexible hourly car rental with professional driver in Makkah and Madinah (min 5 hrs).", flight: false, pickup: true, dropoff: false, offset: null, prices: { 1: 90, 2: 90, 3: 120, 4: 170, 5: 140, 6: 220, 7: 300 } }
        ]
    };

    // State Manager
    const state = {
        selectedCity: 'all',
        currentService: null,
        selectedVehicle: null,
        calculatedPrice: 0,
        cart: JSON.parse(localStorage.getItem('makarim_cart') || '[]')
    };

    // UI Controller
    document.addEventListener('DOMContentLoaded', () => {
        initHeroButtons();
        initModalEvents();
        updateCartBadge();
    });

    // Wire up Hero Section Buttons
    function initHeroButtons() {
        const heroBtn = document.getElementById('open-service-modal-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSelectionModal();
            });
        }

        const bundleBtn = document.getElementById('open-bundle-modal-btn');
        if (bundleBtn) {
            bundleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const pkgModal = document.getElementById('packageModal');
                if (pkgModal) {
                    const bsModal = new bootstrap.Modal(pkgModal);
                    bsModal.show();
                } else {
                    openSelectionModal();
                }
            });
        }

        const otherBtn = document.getElementById('open-other-service-modal-btn');
        if (otherBtn) {
            otherBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSelectionModal();
            });
        }

        // Global delegate handler for any [data-service-id] clickable element
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-service-id]');
            if (target && !target.classList.contains('service-list-item')) {
                if (target.tagName === 'A' || target.tagName === 'BUTTON') {
                    e.preventDefault();
                }
                const serviceId = target.getAttribute('data-service-id');
                if (serviceId) {
                    openServiceDetailsModal(serviceId);
                }
            }
        });
    }

    // --- MODAL 1: "Select a Service" (LARGE & EXPANDED) ---
    function openSelectionModal() {
        state.selectedCity = 'all';
        renderSelectionModalBody();

        const selModalEl = document.getElementById('selection-modal');
        const detailsModalEl = document.getElementById('details-modal');

        const doShowSelection = () => {
            if (selModalEl) {
                const bsModal = bootstrap.Modal.getOrCreateInstance(selModalEl);
                bsModal.show();
            }
        };

        if (detailsModalEl && detailsModalEl.classList.contains('show')) {
            const instance = bootstrap.Modal.getInstance(detailsModalEl);
            if (instance) {
                detailsModalEl.addEventListener('hidden.bs.modal', function onHidden() {
                    detailsModalEl.removeEventListener('hidden.bs.modal', onHidden);
                    setTimeout(doShowSelection, 50);
                });
                instance.hide();
            } else {
                doShowSelection();
            }
        } else {
            closeAllModals();
            doShowSelection();
        }
    }

    function renderSelectionModalBody() {
        const modalBody = document.getElementById('selection-modal-body');
        if (!modalBody) return;

        let cityOptions = `
            <option value="all" ${state.selectedCity === 'all' ? 'selected' : ''}>All Cities</option>
            <option value="Jeddah" ${state.selectedCity === 'Jeddah' ? 'selected' : ''}>Jeddah</option>
            <option value="Makkah" ${state.selectedCity === 'Makkah' ? 'selected' : ''}>Makkah</option>
            <option value="Madinah" ${state.selectedCity === 'Madinah' ? 'selected' : ''}>Madinah</option>
        `;

        let listHtml = '';

        let trendingServices = BOOKING_DATA.services.filter(s => s.isTrending);
        let jeddahServices = BOOKING_DATA.services.filter(s => s.city === 'Jeddah' && !s.isTrending);
        let makkahServices = BOOKING_DATA.services.filter(s => s.city === 'Makkah' && !s.isTrending);
        let madinahServices = BOOKING_DATA.services.filter(s => s.city === 'Madinah' && !s.isTrending);

        if (state.selectedCity !== 'all') {
            trendingServices = trendingServices.filter(s => s.city === state.selectedCity);
            jeddahServices = jeddahServices.filter(s => s.city === state.selectedCity);
            makkahServices = makkahServices.filter(s => s.city === state.selectedCity);
            madinahServices = madinahServices.filter(s => s.city === state.selectedCity);
        }

        const renderItem = (s) => `
            <div class="service-list-item d-flex align-items-center p-2 p-sm-3 mb-2 rounded-3 w-100" 
                 style="background: var(--clr-surface-raised); border: 1px solid var(--clr-border); cursor: pointer; transition: all 0.2s ease; overflow: hidden; box-sizing: border-box;"
                 data-service-id="${s.id}">
                <img src="${s.image}" alt="${s.name}" class="rounded-2 me-2 me-sm-3" style="width: 46px; height: 46px; object-fit: cover; flex-shrink: 0;">
                <div class="flex-grow-1 min-w-0 me-2" style="overflow: hidden; word-break: break-word;">
                    <h6 class="text-white fw-bold mb-1" style="font-size: var(--text-sm); line-height: 1.35; white-space: normal; word-break: break-word; overflow-wrap: break-word;">${s.name}</h6>
                    <span class="text-white-50 small d-block" style="font-size: var(--text-xs);">${BOOKING_DATA.categories[s.cat] || 'Transport'}</span>
                </div>
                <i class="fas fa-chevron-right text-white-50 ms-auto flex-shrink-0" style="font-size: var(--text-sm);"></i>
            </div>
        `;

        if (trendingServices.length > 0) {
            listHtml += `
                <div class="mb-4">
                    <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color: var(--clr-accent); font-size: var(--text-base);">
                        <i class="fas fa-fire text-warning"></i> Trending Services
                    </h6>
                    ${trendingServices.map(renderItem).join('')}
                </div>
            `;
        }

        if (jeddahServices.length > 0 && (state.selectedCity === 'all' || state.selectedCity === 'Jeddah')) {
            listHtml += `
                <div class="mb-4">
                    <h6 class="fw-bold mb-3" style="color: var(--clr-accent); font-size: var(--text-base);">Jeddah</h6>
                    ${jeddahServices.map(renderItem).join('')}
                </div>
            `;
        }

        if (makkahServices.length > 0 && (state.selectedCity === 'all' || state.selectedCity === 'Makkah')) {
            listHtml += `
                <div class="mb-4">
                    <h6 class="fw-bold mb-3" style="color: var(--clr-accent); font-size: var(--text-base);">Makkah</h6>
                    ${makkahServices.map(renderItem).join('')}
                </div>
            `;
        }

        if (madinahServices.length > 0 && (state.selectedCity === 'all' || state.selectedCity === 'Madinah')) {
            listHtml += `
                <div class="mb-4">
                    <h6 class="fw-bold mb-3" style="color: var(--clr-accent); font-size: var(--text-base);">Madinah</h6>
                    ${madinahServices.map(renderItem).join('')}
                </div>
            `;
        }

        modalBody.innerHTML = `
            <!-- Filter Dropdown & Search -->
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label text-white-50 small mb-1 fw-bold">Filter by City</label>
                    <select class="form-select text-white" id="modal-city-filter" style="background: var(--clr-surface-raised); border: 1px solid var(--clr-border); border-radius: 8px; font-size: var(--text-base); padding: 10px 14px;">
                        ${cityOptions}
                    </select>
                </div>
            </div>

            <!-- Scrollable Services List -->
            <div class="services-scroll-container" style="max-height: 520px; overflow-y: auto; overflow-x: hidden; width: 100%; padding-right: 4px; box-sizing: border-box;">
                ${listHtml}
            </div>
        `;

        const cityFilterEl = document.getElementById('modal-city-filter');
        if (cityFilterEl) {
            cityFilterEl.addEventListener('change', (e) => {
                state.selectedCity = e.target.value;
                renderSelectionModalBody();
            });
        }

        modalBody.querySelectorAll('.service-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const serviceId = item.dataset.serviceId || item.getAttribute('data-service-id');
                if (serviceId) {
                    openServiceDetailsModal(serviceId);
                }
            });
        });
    }

    // --- MODAL 2: "Service Details & Vehicle Configurator" ---
    function openServiceDetailsModal(serviceId) {
        const service = BOOKING_DATA.services.find(s => s.id == serviceId);
        if (!service) return;

        state.currentService = service;
        state.selectedVehicle = BOOKING_DATA.vehicles[0]; // Default Camry
        state.calculatedPrice = service.prices[1];

        const detailsModalBody = document.getElementById('details-modal-body');
        const detailsModalTitle = document.getElementById('details-modal-title');

        if (detailsModalTitle) {
            detailsModalTitle.innerText = service.name;
        }

        if (detailsModalBody) {
            // Render Vehicles Options Cards
            let vehicleHtml = '';
            BOOKING_DATA.vehicles.forEach(v => {
                const price = service.prices[v.id] || 'N/A';
                const isSelected = state.selectedVehicle.id === v.id;

                vehicleHtml += `
                    <div class="col-6 col-md-4 col-lg-3 mb-2">
                        <div class="vehicle-option-card p-2 rounded text-center ${isSelected ? 'active-vehicle' : ''}" 
                             style="background: ${isSelected ? 'rgba(var(--clr-accent-rgb), 0.2)' : 'rgba(var(--clr-brand-tint-rgb), 0.03)'}; border: 1.5px solid ${isSelected ? 'var(--clr-accent)' : 'var(--clr-border)'}; cursor: pointer; transition: all 0.2s ease;"
                             data-vehicle-id="${v.id}">
                            <div class="fw-bold text-white small mb-1" style="font-size: var(--text-sm);">${v.name}</div>
                            <div class="d-flex justify-content-center gap-2 text-white-50 mb-1" style="font-size: var(--text-xs);">
                                <span><i class="fas fa-user-friends text-warning"></i> ${v.pax}</span>
                                <span><i class="fas fa-suitcase text-info"></i> ${v.luggage}</span>
                            </div>
                            <div class="fw-bold" style="color: var(--clr-accent); font-size: var(--text-base);">${price} SAR</div>
                        </div>
                    </div>
                `;
            });

            let fieldsHtml = '';

            if (service.pickup !== false) {
                fieldsHtml += `
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-white small fw-bold"><i class="fas fa-map-marker-alt text-danger me-1"></i> Pickup Location</label>
                        <input type="text" class="form-control text-white" id="details-pickup-loc" list="locations-list" placeholder="e.g. Fairmont Makkah / Jeddah Airport" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-white small fw-bold"><i class="fas fa-plane-arrival text-success me-1"></i> Pickup Airport / Terminal</label>
                        <input type="text" class="form-control text-white" id="details-pickup-loc" value="Airport Arrival Terminal" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                    </div>
                `;
            }

            if (service.dropoff !== false) {
                fieldsHtml += `
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-white small fw-bold"><i class="fas fa-location-arrow text-warning me-1"></i> Drop-off Location</label>
                        <input type="text" class="form-control text-white" id="details-dropoff-loc" list="locations-list" placeholder="e.g. Pullman Zamzam Madinah" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                    </div>
                `;
            }

            if (service.flight) {
                fieldsHtml += `
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-white small fw-bold"><i class="fas fa-plane text-info me-1"></i> Flight Number (Optional)</label>
                        <input type="text" class="form-control text-white" id="details-flight-num" placeholder="e.g. SV 1234 / PK 701" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-white small fw-bold"><i class="fas fa-clock text-info me-1"></i> Flight Date & Time</label>
                        <input type="datetime-local" class="form-control text-white" id="details-flight-datetime" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); color-scheme: dark; padding: 10px;">
                    </div>
                `;
            }

            const now = new Date();
            const defaultDate = now.toISOString().slice(0, 10);
            const defaultTime = "12:00";

            fieldsHtml += `
                <div class="col-md-6 mb-3">
                    <label class="form-label text-white small fw-bold"><i class="fas fa-calendar-alt text-warning me-1"></i> Pickup Date</label>
                    <input type="date" class="form-control text-white" id="details-pickup-date" value="${defaultDate}" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); color-scheme: dark; padding: 10px;">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-white small fw-bold"><i class="fas fa-clock text-warning me-1"></i> Pickup Time</label>
                    <input type="time" class="form-control text-white" id="details-pickup-time" value="${defaultTime}" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); color-scheme: dark; padding: 10px;">
                </div>
            `;

            fieldsHtml += `
                <div class="col-md-6 mb-3">
                    <label class="form-label text-white small fw-bold"><i class="fas fa-users text-primary me-1"></i> Number of Passengers (Pax)</label>
                    <input type="number" class="form-control text-white" id="details-pax" value="2" min="1" max="50" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-white small fw-bold"><i class="fas fa-user-check text-success me-1"></i> Lead Passenger Name</label>
                    <input type="text" class="form-control text-white" id="details-customer-name" placeholder="Full Name" style="background: rgba(var(--clr-brand-tint-rgb), 0.06); border: 1px solid var(--clr-border); padding: 10px;">
                </div>
            `;

            let offsetBannerHtml = '';
            if (service.offset != null) {
                const absOffset = Math.abs(service.offset);
                const direction = service.offset < 0 ? 'before your flight departure' : 'after your flight arrival';
                offsetBannerHtml = `
                    <div class="col-12 mb-3">
                        <div class="p-2 rounded d-flex align-items-center gap-2 small" style="background: rgba(var(--clr-success-rgb), 0.15); border: 1px solid rgba(var(--clr-success-rgb), 0.4); color: var(--clr-success);">
                            <i class="fas fa-info-circle fa-lg"></i>
                            <span>Recommended pickup time: <strong>${absOffset} hours ${direction}</strong> for smooth transfer.</span>
                        </div>
                    </div>
                `;
            }

            detailsModalBody.innerHTML = `
                <!-- Service Banner & Description -->
                <div class="row mb-4 align-items-center">
                    <div class="col-md-4 mb-3 mb-md-0">
                        <img src="${service.image}" alt="${service.name}" class="img-fluid rounded-3 w-100 shadow" style="height: 180px; object-fit: cover;">
                    </div>
                    <div class="col-md-8">
                        <span class="badge mb-2" style="background: rgba(var(--clr-accent-rgb), 0.15); color: var(--clr-accent); border: 1px solid rgba(var(--clr-accent-rgb), 0.3); font-size: var(--text-xs);">
                            ${BOOKING_DATA.categories[service.cat] || 'Transport'}
                        </span>
                        <h5 class="fw-bold text-white mb-2">${service.name}</h5>
                        <p class="text-white-50 small mb-0" style="line-height: 1.6;">${service.desc}</p>
                    </div>
                </div>

                <!-- Vehicle Selection Grid -->
                <label class="form-label text-white small fw-bold mb-2"><i class="fas fa-car text-warning me-1"></i> Select Vehicle Type</label>
                <div class="row g-2 mb-4">
                    ${vehicleHtml}
                </div>

                ${offsetBannerHtml}

                <!-- Form Inputs -->
                <div class="row g-2">
                    ${fieldsHtml}
                </div>
            `;

            // Attach Vehicle Click Handlers
            detailsModalBody.querySelectorAll('.vehicle-option-card').forEach(card => {
                card.addEventListener('click', () => {
                    const vehicleId = card.dataset.vehicleId;
                    const vehicleObj = BOOKING_DATA.vehicles.find(v => v.id == vehicleId);
                    if (vehicleObj) {
                        state.selectedVehicle = vehicleObj;
                        state.calculatedPrice = service.prices[vehicleId] || 280;

                        detailsModalBody.querySelectorAll('.vehicle-option-card').forEach(c => {
                            c.style.background = 'rgba(var(--clr-brand-tint-rgb), 0.03)';
                            c.style.borderColor = 'var(--clr-border)';
                            c.classList.remove('active-vehicle');
                        });
                        card.style.background = 'rgba(var(--clr-accent-rgb), 0.2)';
                        card.style.borderColor = 'var(--clr-accent)';
                        card.classList.add('active-vehicle');

                        updateDetailsPriceDisplay();
                    }
                });
            });

            // Flight Offset Calculation
            if (service.flight) {
                const flightDtInput = document.getElementById('details-flight-datetime');
                const pickupDateInput = document.getElementById('details-pickup-date');
                const pickupTimeInput = document.getElementById('details-pickup-time');

                if (flightDtInput && pickupDateInput && pickupTimeInput && service.offset != null) {
                    flightDtInput.addEventListener('change', () => {
                        if (flightDtInput.value) {
                            const flightDate = new Date(flightDtInput.value);
                            flightDate.setHours(flightDate.getHours() + service.offset);

                            const pad = num => String(num).padStart(2, '0');
                            pickupDateInput.value = `${flightDate.getFullYear()}-${pad(flightDate.getMonth() + 1)}-${pad(flightDate.getDate())}`;
                            pickupTimeInput.value = `${pad(flightDate.getHours())}:${pad(flightDate.getMinutes())}`;
                        }
                    });
                }
            }

            updateDetailsPriceDisplay();
        }

        const selModalEl = document.getElementById('selection-modal');
        const detailsModalEl = document.getElementById('details-modal');

        if (!detailsModalEl) return;

        const doShowDetails = () => {
            const bsModal = bootstrap.Modal.getOrCreateInstance(detailsModalEl);
            bsModal.show();
        };

        if (selModalEl && selModalEl.classList.contains('show')) {
            const instance = bootstrap.Modal.getInstance(selModalEl);
            if (instance) {
                selModalEl.addEventListener('hidden.bs.modal', function onHidden() {
                    selModalEl.removeEventListener('hidden.bs.modal', onHidden);
                    setTimeout(doShowDetails, 50);
                });
                instance.hide();
            } else {
                doShowDetails();
            }
        } else {
            closeAllModals();
            doShowDetails();
        }
    }

    function updateDetailsPriceDisplay() {
        const priceEl = document.getElementById('details-total-price-amount');
        if (priceEl) {
            priceEl.innerText = `${state.calculatedPrice} SAR`;
        }
    }

    function closeAllModals() {
        ['selection-modal', 'details-modal', 'configurator-modal'].forEach(id => {
            const modalEl = document.getElementById(id);
            if (modalEl) {
                const instance = bootstrap.Modal.getInstance(modalEl);
                if (instance) instance.hide();
            }
        });
    }

    function initModalEvents() {
        const backToSelectionBtn = document.getElementById('details-back-to-selection');
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSelectionModal();
            });
        }

        const whatsappBtn = document.getElementById('details-whatsapp-btn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sendWhatsAppBooking();
            });
        }

        const addToCartBtn = document.getElementById('details-add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addItemToCart();
            });
        }
    }

    function sendWhatsAppBooking() {
        const service = state.currentService;
        const vehicle = state.selectedVehicle;
        if (!service || !vehicle) return;

        const pickupLoc = document.getElementById('details-pickup-loc')?.value || 'Not specified';
        const dropoffLoc = document.getElementById('details-dropoff-loc')?.value || 'Not specified';
        const flightNum = document.getElementById('details-flight-num')?.value || 'N/A';
        const pickupDate = document.getElementById('details-pickup-date')?.value || '';
        const pickupTime = document.getElementById('details-pickup-time')?.value || '';
        const pax = document.getElementById('details-pax')?.value || '1';
        const name = document.getElementById('details-customer-name')?.value || 'Valued Guest';

        const given = (v, empty) => (v === empty ? '' : v);
        // everything the visitor selected, through the site's one WhatsApp helper
        window.open(window.waLink({ type: 'booking', extra: {
            trip: BOOKING_DATA.categories[service.cat] || 'Transport',
            route: service.name,
            vehicle: `${vehicle.name} (${vehicle.pax})`,
            price: `${state.calculatedPrice} SAR`,
            date: `${pickupDate} ${pickupTime}`.trim(),
            pickup: given(pickupLoc, 'Not specified'),
            dropoff: service.dropoff !== false ? given(dropoffLoc, 'Not specified') : '',
            flight: service.flight ? given(flightNum, 'N/A') : '',
            passengers: pax,
            name: given(name, 'Valued Guest'),
        } }), '_blank');
    }

    function addItemToCart() {
        const service = state.currentService;
        const vehicle = state.selectedVehicle;
        if (!service || !vehicle) return;

        const pickupLoc = document.getElementById('details-pickup-loc')?.value || 'Not specified';
        const dropoffLoc = document.getElementById('details-dropoff-loc')?.value || 'Not specified';
        const pickupDate = document.getElementById('details-pickup-date')?.value || '';
        const pickupTime = document.getElementById('details-pickup-time')?.value || '';
        const pax = document.getElementById('details-pax')?.value || '1';
        const name = document.getElementById('details-customer-name')?.value || 'Guest';

        const cartItem = {
            id: Date.now(),
            serviceId: service.id,
            serviceName: service.name,
            vehicleName: vehicle.name,
            price: state.calculatedPrice,
            date: pickupDate,
            time: pickupTime,
            pickup: pickupLoc,
            dropoff: dropoffLoc,
            pax: pax,
            name: name
        };

        state.cart.push(cartItem);
        localStorage.setItem('makarim_cart', JSON.stringify(state.cart));
        updateCartBadge();
        closeAllModals();

        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            renderCartSidebarItems();
        } else {
            alert(`✓ "${service.name}" (${vehicle.name}) added to your booking cart!`);
        }
    }

    function updateCartBadge() {
        const cartBadge = document.getElementById('cart-count');
        if (cartBadge) {
            cartBadge.innerText = state.cart.length;
        }
    }

    function renderCartSidebarItems() {
        const container = document.getElementById('cart-items-container');
        const grandTotalEl = document.getElementById('grand-total-amount');
        if (!container) return;

        if (state.cart.length === 0) {
            container.innerHTML = `<div class="p-4 text-center text-muted">Your cart is empty.</div>`;
            if (grandTotalEl) grandTotalEl.innerText = '0 SAR';
            return;
        }

        let total = 0;
        let html = '';
        state.cart.forEach((item, index) => {
            total += parseFloat(item.price);
            html += `
                <div class="cart-item p-3 mb-2 rounded" style="background: rgba(var(--clr-brand-tint-rgb), 0.05); border: 1px solid rgba(var(--clr-accent-rgb), 0.2);">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="text-white fw-bold mb-0 small">${item.serviceName}</h6>
                        <button class="btn btn-link text-danger p-0 ms-2 remove-cart-item-btn" data-index="${index}" style="font-size: var(--text-sm);">&times;</button>
                    </div>
                    <div class="text-warning small fw-bold">${item.vehicleName} - ${item.price} SAR</div>
                    <div class="text-white-50 small" style="font-size: var(--text-xs);">📅 ${item.date} ${item.time} | 📍 ${item.pickup}</div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (grandTotalEl) grandTotalEl.innerText = `${total} SAR`;

        container.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index, 10);
                state.cart.splice(idx, 1);
                localStorage.setItem('makarim_cart', JSON.stringify(state.cart));
                updateCartBadge();
                renderCartSidebarItems();
            });
        });
    }

    // Global expose
    window.MakarimBooking = {
        openSelectionModal: openSelectionModal,
        openDetailsModal: openServiceDetailsModal
    };

})();


// Open WhatsApp on Configure & Book click
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.service-page-direct-book');
    if (btn && btn.tagName === 'BUTTON') {
        e.preventDefault();
        window.open(window.waLink({ type: 'general' }), '_blank');
    }
});