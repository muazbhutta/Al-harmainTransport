
        const VEHICLES_DATABASE = {
            'camry': {
                name: 'Toyota Camry (2024-2025 Model)',
                image: 'uploads/vehicles/1752554098_camry2025-2.png',
                seats: '4 Passengers',
                bags: '2-3 Luggage Bags',
                desc: 'Comfortable & economic luxury sedan for couples & small families. Equipped with dual AC and private chauffeur.'
            },
            'sonata': {
                name: 'Hyundai Sonata (2024-2025 Model)',
                image: 'uploads/vehicles/1752554133_sonata2025-2.png',
                seats: '4 Passengers',
                bags: '2-3 Luggage Bags',
                desc: 'Sleek & modern luxury sedan featuring executive interior comfort for airport transfers & intercity trips.'
            },
            'staria': {
                name: 'Hyundai Staria (7-Seater Luxury Van)',
                image: 'uploads/vehicles/1752554248_hyundaistaria2025-2.png',
                seats: '7 Passengers',
                bags: '5-6 Luggage Bags',
                desc: 'Futuristic VIP luxury MPV with reclinable captain seats, wide panoramic windows, and dual AC for family Umrah trips.'
            },
            'gmc': {
                name: 'GMC Yukon XL (VIP Executive SUV)',
                image: 'uploads/vehicles/1752554276_gmc2025-2.png',
                seats: '7 Passengers',
                bags: '6-7 Luggage Bags',
                desc: 'Top-tier VIP luxury SUV for royal comfort, maximum legroom, smooth highway travel between Makkah & Madinah.'
            },
            'hiace': {
                name: 'Toyota Hiace (11-13 Seater Family Van)',
                image: 'uploads/vehicles/1752554415_Hiace 2025-2.png',
                seats: '11-13 Passengers',
                bags: '8-10 Luggage Bags',
                desc: 'Spacious high-roof van tailored for medium-sized pilgrim groups and families travelling with extra luggage.'
            },
            'coaster': {
                name: 'Toyota Coaster (21-25 Seater Minibus)',
                image: 'uploads/vehicles/1752554405_Coaster2025-2.png',
                seats: '21-25 Passengers',
                bags: 'Ample Cargo Space',
                desc: 'Heavy-duty luxury minibus ideal for large Umrah group Ziyarah tours in Makkah, Madinah & Taif.'
            },
            'bus': {
                name: 'VIP Coach Bus (50-Seater Luxury Bus)',
                image: 'uploads/vehicles/bus (1)_68a0928fdd83e8.52965503.png',
                seats: '50 Passengers',
                bags: 'Massive Cargo Hold',
                desc: 'Premium 50-seater tour bus with plush reclining seats, onboard entertainment, dual AC, and luggage bays for full group delegations.'
            }
        };

        let activeVehicleKey = 'camry';

        function openVehicleModal(key) {
            const data = VEHICLES_DATABASE[key] || VEHICLES_DATABASE['camry'];
            activeVehicleKey = key;
            
            document.getElementById('vModalName').innerText = data.name;
            document.getElementById('vModalImg').src = data.image;
            document.getElementById('vModalSeats').innerText = data.seats;
            document.getElementById('vModalBags').innerText = data.bags;
            document.getElementById('vModalDesc').innerText = data.desc;

            const modalEl = document.getElementById('vehicleDetailModal');
            if (modalEl) {
                const bsModal = new bootstrap.Modal(modalEl);
                bsModal.show();
            }
        }

        function submitVehicleBooking() {
            const vehicle = VEHICLES_DATABASE[activeVehicleKey] || VEHICLES_DATABASE['camry'];
            const pickup = document.getElementById('vFormPickup').value || 'Not specified';
            const drop = document.getElementById('vFormDrop').value || 'Not specified';
            const date = document.getElementById('vFormDate').value || 'Not specified';
            const pax = document.getElementById('vFormPassengers').value || '1';

            const message = `Hello AL HARMAIN UMRAH TRANSPORT! I want to book a vehicle:\n\nðŸš˜ *Vehicle:* ${vehicle.name}\nðŸ“ *Pickup:* ${pickup}\nðŸš© *Drop-off:* ${drop}\nðŸ“… *Date:* ${date}\nðŸ‘¥ *Passengers:* ${pax}\n\nPlease confirm availability and total price.`;
            const waUrl = `https://wa.me/966565476113?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('a[href*="all-fleet.html#"]').forEach(link => {
                const href = link.getAttribute('href') || '';
                const text = link.innerText.toLowerCase();
                
                let vehicleKey = null;
                if (href.includes('#camry') || text.includes('camry')) vehicleKey = 'camry';
                else if (href.includes('#sonata') || text.includes('sonata')) vehicleKey = 'sonata';
                else if (href.includes('#staria') || text.includes('staria')) vehicleKey = 'staria';
                else if (href.includes('#gmc') || text.includes('gmc') || text.includes('yukon')) vehicleKey = 'gmc';
                else if (href.includes('#hiace') || text.includes('hiace')) vehicleKey = 'hiace';
                else if (href.includes('#coaster') || text.includes('coaster')) vehicleKey = 'coaster';
                else if (href.includes('#bus') || text.includes('bus')) vehicleKey = 'bus';

                if (vehicleKey) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        openVehicleModal(vehicleKey);
                    });
                }
            });
        });
    