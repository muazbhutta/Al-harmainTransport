# WhatsApp buttons verified on the running site

Every WhatsApp button on every page of http://localhost:3100 was clicked, with navigation blocked. The URL it would open was captured, and its message checked by `_audit/wa-clicks-check.mjs`:

- it starts with "Assalamu Alaikum";
- it ends with the page it was clicked on (`Page: https://alharmainumrahtransport.com/…`);
- it carries the right detail for its button: the service page's own title, the vehicle's name and capacity, the package's legs, the route's from and to.

**546 buttons clicked · 0 failed.** Identical buttons are grouped below: the same label and message (minus the page link) on several pages. The page link in each is that page's own address.

| # | Pages | Type | Button | Message (after "Assalamu Alaikum, ", before "Page: …") |
|---|---|---|---|---|
| 1 | 58 pages | general | +966 56 547 6113 | I would like to ask about your Umrah transport services. |
| 2 | 58 pages | general | WhatsApp | I would like to ask about your Umrah transport services. |
| 3 | 57 pages | general | (icon)  | I would like to ask about your Umrah transport services. |
| 4 | 57 pages | general | (icon) fab-btn | I would like to ask about your Umrah transport services. |
| 5 | 31 pages | general | (icon) btn | I would like to ask about your Umrah transport services. |
| 6 | 31 pages | general | AI AI Agent WhatsApp | I would like to ask about your Umrah transport services. |
| 7 | /who-we-are | b2b | B2B Partner Inquiry on WhatsApp | I am a travel agent and would like your B2B transport rates. |
| 8 | / (booking pop-up) | booking | Booking pop-up: Jeddah Airport to Makkah Hotel → Book via WhatsApp | I would like to book: · Trip: Airport Pick & Drops · Route: Jeddah Airport to Makkah Hotel · Vehicle: GMC XL Yukon (7 Pax) · Price: 420 SAR · Date: 2026-10-02 10:00 · Pickup: Jeddah Airport North Terminal · Drop-off: Hilton Makkah · Flight: SV 123 · Passengers: 5 · Name: Test Guest |
| 9 | / | booking | Select & Configure Your Service | I would like to book: Single Trip. |
| 10 | / | booking | Select Specialized Service | I would like to book: Ziyarat & Tours. |
| 11 | /services/inter-city (vehicle pop-up, unreachable) | booking | Vehicle pop-up: GMC → Book on WhatsApp | I would like to book: · Vehicle: GMC Yukon XL (VIP Executive SUV) · Date: 2026-10-05 · Pickup: Makkah Hilton · Drop-off: Madinah Pullman · Passengers: 6 |
| 12 | / | booking | View & Select All Packages | I would like to book: Umrah Package. |
| 13 | /blog (chat widget) | chat | chat: "I want to book" → Click to Book via WhatsApp Now | I would like to ask about your Umrah transport services. |
| 14 | /blog (chat widget) | chat | chat: "Jeddah Airport pickup" → Book Airport Pickup | I would like to book a Jeddah Airport pickup. |
| 15 | /blog (chat widget) | chat | chat: "kitna rate hai" → WhatsApp Par Baat Karein | I would like to ask about your Umrah transport services. |
| 16 | /blog (chat widget) | chat | chat: "Makkah to Madinah" → Reserve Makkah to Madinah Taxi | I would like to book a transfer from Makkah to Madinah. |
| 17 | /blog (chat widget) | chat | chat: "whatsapp contact number" → Open WhatsApp Chat | I would like to ask about your Umrah transport services. |
| 18 | /blog (chat widget) | chat | chat: "ziyarat tour" → Book Ziyarat Tour | I would like to book a Ziyarat tour. |
| 19 | /who-we-are | fleet | Book Camry | I would like to book the Toyota Camry. |
| 20 | /who-we-are | fleet | Book Coaster | I would like to book the Coaster Minibus. |
| 21 | /who-we-are | fleet | Book GMC Yukon | I would like to book the GMC Yukon XL. |
| 22 | /who-we-are | fleet | Book Hiace | I would like to book the Toyota Hiace. |
| 23 | /who-we-are | fleet | Book Sonata | I would like to book the Hyundai Sonata. |
| 24 | /who-we-are | fleet | Book Staria | I would like to book the Hyundai Staria. |
| 25 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Camry 2025 Luxury Sedan. |
| 26 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Sonata Executive Chauffeur. |
| 27 | /fleet | fleet | Book via WhatsApp | I would like to book the GMC Yukon XL Premium VIP SUV. |
| 28 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Staria VIP 7-Seater. |
| 29 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Hiace Grand Cabin 13-Seater. |
| 30 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Coaster Luxury Minibus 21-Seater. |
| 31 | /fleet | fleet | Book via WhatsApp | I would like to book the VIP Bus 50-Seater Executive Coach. |
| 32 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Staria Family Comfort Edition. |
| 33 | /fleet | fleet | Book via WhatsApp | I would like to book the GMC Yukon XL Black VIP Chauffeur. |
| 34 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Camry White Sedan Clean Ride. |
| 35 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Sonata White Executive Sedan. |
| 36 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Hiace VIP High Roof Bus. |
| 37 | /fleet | fleet | Book via WhatsApp | I would like to book the Ford Taurus Luxury VIP Sedan. |
| 38 | /fleet | fleet | Book via WhatsApp | I would like to book the GMC Yukon XL Super Executive Edition. |
| 39 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Hiace Commuter Family Minivan. |
| 40 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Staria Luxury Intercity Shuttle. |
| 41 | /fleet | fleet | Book via WhatsApp | I would like to book the VIP Bus 50-Seater Pilgrim Charter. |
| 42 | /fleet | fleet | Book via WhatsApp | I would like to book the GMC Yukon XL Royal Black Edition. |
| 43 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Staria Deluxe Interior Shuttle. |
| 44 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Camry 2024 Pilgrim Transfer Sedan. |
| 45 | /fleet | fleet | Book via WhatsApp | I would like to book the Hyundai Sonata Deluxe Makkah Express. |
| 46 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Hiace Grand Cabin Luggage Carrier. |
| 47 | /fleet | fleet | Book via WhatsApp | I would like to book the Toyota Coaster Premium Group Transport. |
| 48 | /fleet | fleet | Book via WhatsApp | I would like to book the VIP Bus Luxury Leather Interior Coach. |
| 49 | /fleet | fleet | Book via WhatsApp | I would like to book the AL HARMAIN Luxury Fleet Final Showcase. |
| 50 | /who-we-are | fleet | Book VIP Bus | I would like to book the VIP Bus (50-Seater). |
| 51 | / | general | Book on WhatsApp | I would like to contact Makkah Branch Office about your Umrah transport services. |
| 52 | / | general | Book via WhatsApp | I would like to ask about your Umrah transport services. |
| 53 | / | general | Contact on WhatsApp | I would like to contact Asif Ahmad (MD / Owner) about your Umrah transport services. |
| 54 | / | general | Inquire on WhatsApp | I would like to contact Madinah Head Office about your Umrah transport services. |
| 55 | /fleet | general | Secondary: +966 56 547 6113 | I would like to ask about your Umrah transport services. |
| 56 | /fleet | general | WhatsApp: +966 56 547 6113 | I would like to ask about your Umrah transport services. |
| 57 | / | package | Book Package 1 | I would like to book Package 1: Jeddah Airport to Makkah Hotel → Makkah Hotel to Madinah Hotel → Madinah Hotel to Jeddah Airport. |
| 58 | / | package | Book Package 2 | I would like to book Package 2: Jeddah Airport to Makkah Hotel → Makkah to Madinah → Madinah to Madinah Airport. |
| 59 | / | package | Book Package 3 | I would like to book Package 3: Jeddah Airport to Madinah Hotel → Madinah to Makkah → Makkah to Jeddah. |
| 60 | / | package | Book Package 4 | I would like to book Package 4: Jeddah Airport to Makkah Hotel → Makkah Ziyarat → Taif Ziyarat → Makkah to Madinah → Madinah Ziyarat → Badar Ziyarat → Madinah to Jeddah. |
| 61 | / | package | Book Package 5 | I would like to book Package 5: Jeddah Airport to Makkah Hotel → Makkah Ziyarat → Taif Ziyarat → Makkah to Madinah → Madinah Ziyarat → Badar Ziyarat → Madinah to Madinah Airport. |
| 62 | / | package | Book Package 6 | I would like to book Package 6: Madinah Ziyarat → Madinah to Makkah → Makkah Ziyarat → Taif Ziyarat → Makkah to Jeddah. |
| 63 | / | package | Book Package 7 | I would like to book Package 7: Makkah Ziyarat → Taif Ziyarat → Madinah Ziyarat → Badar Ziyarat. |
| 64 | / | route | Badr Ziyarat Taxi | I would like to book Badr Ziyarat Taxi. |
| 65 | / | route | Hotel to Madinah Airport | I would like to book a transfer from Hotel to Madinah Airport. |
| 66 | / | route | Jeddah Airport to Madinah | I would like to book a transfer from Jeddah Airport to Madinah. |
| 67 | / | route | Jeddah Airport to Makkah | I would like to book a transfer from Jeddah Airport to Makkah. |
| 68 | / | route | Madinah Airport to Hotel | I would like to book a transfer from Madinah Airport to Hotel. |
| 69 | / | route | Madinah to Jeddah Airport | I would like to book a transfer from Madinah to Jeddah Airport. |
| 70 | / | route | Madinah to Makkah | I would like to book a transfer from Madinah to Makkah. |
| 71 | / | route | Madinah Ziyarat Taxi | I would like to book Madinah Ziyarat Taxi. |
| 72 | / | route | Makkah to Jeddah Airport | I would like to book a transfer from Makkah to Jeddah Airport. |
| 73 | / | route | Makkah to Madinah | I would like to book a transfer from Makkah to Madinah. |
| 74 | / | route | Makkah Ziyarat Taxi | I would like to book Makkah Ziyarat Taxi. |
| 75 | / | route | Masjid Ayesha Miqat | I would like to book Masjid Ayesha Miqat. |
| 76 | / | route | Taif Ziyarat Taxi | I would like to book Taif Ziyarat Taxi. |
| 77 | / | service | Book on WhatsApp | I would like to book VIP Airport & Hotel Transfer. |
| 78 | / | service | Book on WhatsApp | I would like to book Best Taxi Service in KSA. |
| 79 | / | service | Book on WhatsApp | I would like to book Premium Sacred Journey. |
| 80 | /services/3-in-1-kiswa-factory-makkah-museum-sulah-hudaibiyah | service | Configure & Book | I would like to book 3-in-1 Kiswa Factory / Makkah Museum / Sulah Hudaibiyah. |
| 81 | /services/airport-concierge-and-meet-greet | service | Configure & Book | I would like to book Airport Concierge & Meet/Greet. |
| 82 | /services/jeddah-airport-to-jeddah-hotel | service | Configure & Book | I would like to book Jeddah Airport to Jeddah Hotel. |
| 83 | /services/jeddah-airport-to-madinah-hotel | service | Configure & Book | I would like to book Jeddah Airport to Madinah Hotel. |
| 84 | /services/jeddah-airport-to-makkah-hotel | service | Configure & Book | I would like to book Jeddah Airport to Makkah Hotel. |
| 85 | /services/jeddah-hotel-to-jeddah-airport | service | Configure & Book | I would like to book Jeddah Hotel to Jeddah Airport. |
| 86 | /services/jeddah-hotel-to-madinah-hotel | service | Configure & Book | I would like to book Jeddah Hotel to Madinah Hotel. |
| 87 | /services/jeddah-hotel-to-makkah-hotel | service | Configure & Book | I would like to book Jeddah Hotel to Makkah Hotel. |
| 88 | /services/jeddah-local-city-transfer | service | Configure & Book | I would like to book Jeddah Local City Transfer. |
| 89 | /services/madinah-airport-to-madinah-hotel | service | Configure & Book | I would like to book Madinah Airport to Madinah Hotel. |
| 90 | /services/madinah-hotel-to-jeddah-airport | service | Configure & Book | I would like to book Madinah Hotel to Jeddah Airport. |
| 91 | /services/madinah-hotel-to-jeddah-hotel | service | Configure & Book | I would like to book Madinah Hotel to Jeddah Hotel. |
| 92 | /services/madinah-hotel-to-madinah-airport | service | Configure & Book | I would like to book Madinah Hotel to Madinah Airport. |
| 93 | /services/madinah-hotel-to-makkah-hotel | service | Configure & Book | I would like to book Madinah Hotel to Makkah Hotel. |
| 94 | /services/madinah-hotel-to-makkah-hotel-via-badar-and-roha-well | service | Configure & Book | I would like to book Madinah Hotel to Makkah Hotel (via Badar & Roha Well). |
| 95 | /services/madinah-hotel-to-train-station | service | Configure & Book | I would like to book Madinah Hotel to Train Station. |
| 96 | /services/madinah-ziyarat | service | Configure & Book | I would like to book Madinah Ziyarat. |
| 97 | /services/makkah-hotel-to-jeddah-airport | service | Configure & Book | I would like to book Makkah Hotel to Jeddah Airport. |
| 98 | /services/makkah-hotel-to-jeddah-hotel | service | Configure & Book | I would like to book Makkah Hotel to Jeddah Hotel. |
| 99 | /services/makkah-hotel-to-madinah-hotel | service | Configure & Book | I would like to book Makkah Hotel to Madinah Hotel. |
| 100 | /services/makkah-hotel-to-madinah-hotel-via-badar-and-roha-well | service | Configure & Book | I would like to book Makkah Hotel to Madinah Hotel (via Badar & Roha Well). |
| 101 | /services/makkah-hotel-to-madinah-hotel-via-taif | service | Configure & Book | I would like to book Makkah Hotel to Madinah Hotel (via Taif). |
| 102 | /services/makkah-hotel-to-train-station | service | Configure & Book | I would like to book Makkah Hotel to Train Station. |
| 103 | /services/makkah-to-taif-ziyarat-and-return | service | Configure & Book | I would like to book Makkah to Taif Ziyarat & Return. |
| 104 | /services/makkah-ziyarat | service | Configure & Book | I would like to book Makkah Ziyarat. |
| 105 | /services/train-station-to-madinah-hotel | service | Configure & Book | I would like to book Train Station to Madinah Hotel. |
| 106 | /services/train-station-to-makkah-hotel | service | Configure & Book | I would like to book Train Station to Makkah Hotel. |
| 107 | /services/3-in-1-kiswa-factory-makkah-museum-sulah-hudaibiyah | service | Configure & Book Now | I would like to book 3-in-1 Kiswa Factory / Makkah Museum / Sulah Hudaibiyah. |
| 108 | /services/airport-concierge-and-meet-greet | service | Configure & Book Now | I would like to book Airport Concierge & Meet/Greet. |
| 109 | /services/jeddah-airport-to-jeddah-hotel | service | Configure & Book Now | I would like to book Jeddah Airport to Jeddah Hotel. |
| 110 | /services/jeddah-airport-to-madinah-hotel | service | Configure & Book Now | I would like to book Jeddah Airport to Madinah Hotel. |
| 111 | /services/jeddah-airport-to-makkah-hotel | service | Configure & Book Now | I would like to book Jeddah Airport to Makkah Hotel. |
| 112 | /services/jeddah-hotel-to-jeddah-airport | service | Configure & Book Now | I would like to book Jeddah Hotel to Jeddah Airport. |
| 113 | /services/jeddah-hotel-to-madinah-hotel | service | Configure & Book Now | I would like to book Jeddah Hotel to Madinah Hotel. |
| 114 | /services/jeddah-hotel-to-makkah-hotel | service | Configure & Book Now | I would like to book Jeddah Hotel to Makkah Hotel. |
| 115 | /services/jeddah-local-city-transfer | service | Configure & Book Now | I would like to book Jeddah Local City Transfer. |
| 116 | /services/madinah-airport-to-madinah-hotel | service | Configure & Book Now | I would like to book Madinah Airport to Madinah Hotel. |
| 117 | /services/madinah-hotel-to-jeddah-airport | service | Configure & Book Now | I would like to book Madinah Hotel to Jeddah Airport. |
| 118 | /services/madinah-hotel-to-jeddah-hotel | service | Configure & Book Now | I would like to book Madinah Hotel to Jeddah Hotel. |
| 119 | /services/madinah-hotel-to-madinah-airport | service | Configure & Book Now | I would like to book Madinah Hotel to Madinah Airport. |
| 120 | /services/madinah-hotel-to-makkah-hotel | service | Configure & Book Now | I would like to book Madinah Hotel to Makkah Hotel. |
| 121 | /services/madinah-hotel-to-makkah-hotel-via-badar-and-roha-well | service | Configure & Book Now | I would like to book Madinah Hotel to Makkah Hotel (via Badar & Roha Well). |
| 122 | /services/madinah-hotel-to-train-station | service | Configure & Book Now | I would like to book Madinah Hotel to Train Station. |
| 123 | /services/madinah-ziyarat | service | Configure & Book Now | I would like to book Madinah Ziyarat. |
| 124 | /services/makkah-hotel-to-jeddah-airport | service | Configure & Book Now | I would like to book Makkah Hotel to Jeddah Airport. |
| 125 | /services/makkah-hotel-to-jeddah-hotel | service | Configure & Book Now | I would like to book Makkah Hotel to Jeddah Hotel. |
| 126 | /services/makkah-hotel-to-madinah-hotel | service | Configure & Book Now | I would like to book Makkah Hotel to Madinah Hotel. |
| 127 | /services/makkah-hotel-to-madinah-hotel-via-badar-and-roha-well | service | Configure & Book Now | I would like to book Makkah Hotel to Madinah Hotel (via Badar & Roha Well). |
| 128 | /services/makkah-hotel-to-madinah-hotel-via-taif | service | Configure & Book Now | I would like to book Makkah Hotel to Madinah Hotel (via Taif). |
| 129 | /services/makkah-hotel-to-train-station | service | Configure & Book Now | I would like to book Makkah Hotel to Train Station. |
| 130 | /services/makkah-to-taif-ziyarat-and-return | service | Configure & Book Now | I would like to book Makkah to Taif Ziyarat & Return. |
| 131 | /services/makkah-ziyarat | service | Configure & Book Now | I would like to book Makkah Ziyarat. |
| 132 | /services/train-station-to-madinah-hotel | service | Configure & Book Now | I would like to book Train Station to Madinah Hotel. |
| 133 | /services/train-station-to-makkah-hotel | service | Configure & Book Now | I would like to book Train Station to Makkah Hotel. |
| 134 | /services/3-in-1-kiswa-factory-makkah-museum-sulah-hudaibiyah | service | Inquire on WhatsApp | I would like to book 3-in-1 Kiswa Factory / Makkah Museum / Sulah Hudaibiyah. |
| 135 | /services/airport-concierge-and-meet-greet | service | Inquire on WhatsApp | I would like to book Airport Concierge & Meet/Greet. |
| 136 | /services/jeddah-airport-to-jeddah-hotel | service | Inquire on WhatsApp | I would like to book Jeddah Airport to Jeddah Hotel. |
| 137 | /services/jeddah-airport-to-madinah-hotel | service | Inquire on WhatsApp | I would like to book Jeddah Airport to Madinah Hotel. |
| 138 | /services/jeddah-airport-to-makkah-hotel | service | Inquire on WhatsApp | I would like to book Jeddah Airport to Makkah Hotel. |
| 139 | /services/jeddah-hotel-to-jeddah-airport | service | Inquire on WhatsApp | I would like to book Jeddah Hotel to Jeddah Airport. |
| 140 | /services/jeddah-hotel-to-madinah-hotel | service | Inquire on WhatsApp | I would like to book Jeddah Hotel to Madinah Hotel. |
| 141 | /services/jeddah-hotel-to-makkah-hotel | service | Inquire on WhatsApp | I would like to book Jeddah Hotel to Makkah Hotel. |
| 142 | /services/jeddah-local-city-transfer | service | Inquire on WhatsApp | I would like to book Jeddah Local City Transfer. |
| 143 | /services/madinah-airport-to-madinah-hotel | service | Inquire on WhatsApp | I would like to book Madinah Airport to Madinah Hotel. |
| 144 | /services/madinah-hotel-to-jeddah-airport | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Jeddah Airport. |
| 145 | /services/madinah-hotel-to-jeddah-hotel | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Jeddah Hotel. |
| 146 | /services/madinah-hotel-to-madinah-airport | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Madinah Airport. |
| 147 | /services/madinah-hotel-to-makkah-hotel | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Makkah Hotel. |
| 148 | /services/madinah-hotel-to-makkah-hotel-via-badar-and-roha-well | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Makkah Hotel (via Badar & Roha Well). |
| 149 | /services/madinah-hotel-to-train-station | service | Inquire on WhatsApp | I would like to book Madinah Hotel to Train Station. |
| 150 | /services/madinah-ziyarat | service | Inquire on WhatsApp | I would like to book Madinah Ziyarat. |
| 151 | /services/makkah-hotel-to-jeddah-airport | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Jeddah Airport. |
| 152 | /services/makkah-hotel-to-jeddah-hotel | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Jeddah Hotel. |
| 153 | /services/makkah-hotel-to-madinah-hotel | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Madinah Hotel. |
| 154 | /services/makkah-hotel-to-madinah-hotel-via-badar-and-roha-well | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Madinah Hotel (via Badar & Roha Well). |
| 155 | /services/makkah-hotel-to-madinah-hotel-via-taif | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Madinah Hotel (via Taif). |
| 156 | /services/makkah-hotel-to-train-station | service | Inquire on WhatsApp | I would like to book Makkah Hotel to Train Station. |
| 157 | /services/makkah-to-taif-ziyarat-and-return | service | Inquire on WhatsApp | I would like to book Makkah to Taif Ziyarat & Return. |
| 158 | /services/makkah-ziyarat | service | Inquire on WhatsApp | I would like to book Makkah Ziyarat. |
| 159 | /services/train-station-to-madinah-hotel | service | Inquire on WhatsApp | I would like to book Train Station to Madinah Hotel. |
| 160 | /services/train-station-to-makkah-hotel | service | Inquire on WhatsApp | I would like to book Train Station to Makkah Hotel. |
| 161 | /fleet/coaster | vehicle | Book This Vehicle | I would like to book the Coaster / Minibus (up to 20 passengers, 25 large bags). |
| 162 | /fleet/gmc-xl-yukon | vehicle | Book This Vehicle | I would like to book the GMC XL Yukon (up to 7 passengers, 8 large bags). |
| 163 | /fleet/hiace-grand-cabin | vehicle | Book This Vehicle | I would like to book the Hiace Grand Cabin (up to 11 passengers, 14 large bags). |
| 164 | /fleet/hyundai-sonata | vehicle | Book This Vehicle | I would like to book the Hyundai Sonata (up to 3 passengers, 2 large bags). |
| 165 | /fleet/hyundai-staria | vehicle | Book This Vehicle | I would like to book the Hyundai Staria (up to 7 passengers, 7 large bags). |
| 166 | /fleet/toyota-camry | vehicle | Book This Vehicle | I would like to book the Toyota Camry (up to 3 passengers, 2 large bags). |
