/**
 * AL HARMAIN UMRAH TRANSPORT - AI Agent Assistant Widget
 * Floating Right-Side AI Button & Chat Interface
 */

(function () {
    // 1. Inject Styles
    const style = document.createElement('style');
    style.id = 'ai-agent-styles';
    style.textContent = `
        /* Right Side AI Floating Button */
        #ai-agent-btn {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            border: 2px solid #ffffff;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10050;
            box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5), 0 0 15px rgba(37, 211, 102, 0.4);
            transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            outline: none;
            padding: 0;
        }

        #ai-agent-btn:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 12px 30px rgba(37, 211, 102, 0.75), 0 0 25px rgba(37, 211, 102, 0.6);
        }

        #ai-agent-btn .ai-icon {
            font-size: 32px;
            color: #ffffff;
            transition: transform 0.3s ease;
        }

        #ai-agent-btn:hover .ai-icon {
            transform: scale(1.15);
        }

        /* Pulse Ring */
        #ai-agent-btn::before {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border-radius: 50%;
            border: 2px solid rgba(255, 204, 0, 0.6);
            animation: aiPulse 2s infinite ease-in-out;
            pointer-events: none;
        }

        @keyframes aiPulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
        }

        /* AI Notification Badge */
        #ai-agent-badge {
            position: absolute;
            top: -3px;
            right: -3px;
            background: #25d366;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 10px;
            border: 2px solid #0f172a;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            letter-spacing: 0.5px;
            animation: bounceBadge 2s infinite;
        }

        @keyframes bounceBadge {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }

        /* Hide Cart Button */
        #cart-button, #add-to-cart-button {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
        }

        /* AI Chat Window Modal */
        #ai-chat-window {
            position: fixed;
            bottom: 98px;
            right: 25px;
            width: 380px;
            max-width: calc(100vw - 30px);
            height: 560px;
            max-height: calc(100vh - 120px);
            background: rgba(15, 23, 42, 0.96);
            -webkit-backdrop-filter: blur(20px);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(218, 154, 40, 0.5);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(218, 154, 40, 0.2);
            z-index: 10060;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Poppins', sans-serif;
        }

        #ai-chat-window.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        /* Chat Header */
        .ai-chat-header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 14px 18px;
            border-bottom: 1px solid rgba(218, 154, 40, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .ai-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .ai-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #da9a28, #f5c842);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f172a;
            font-size: 20px;
            box-shadow: 0 2px 10px rgba(218, 154, 40, 0.4);
            position: relative;
        }

        .ai-online-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 11px;
            height: 11px;
            background: #25d366;
            border: 2px solid #0f172a;
            border-radius: 50%;
        }

        .ai-title-box h5 {
            margin: 0;
            font-size: 0.98rem;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .ai-title-box small {
            font-size: 0.75rem;
            color: #da9a28;
            display: block;
            font-weight: 500;
        }

        .ai-close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #cbd5e1;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 16px;
        }

        .ai-close-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            color: #ef4444;
        }

        /* Chat Body */
        .ai-chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            scroll-behavior: smooth;
        }

        .ai-chat-body::-webkit-scrollbar {
            width: 5px;
        }

        .ai-chat-body::-webkit-scrollbar-thumb {
            background: rgba(218, 154, 40, 0.3);
            border-radius: 4px;
        }

        /* Messages */
        .ai-msg {
            max-width: 85%;
            padding: 11px 15px;
            border-radius: 16px;
            font-size: 0.88rem;
            line-height: 1.5;
            word-wrap: break-word;
            animation: msgFadeIn 0.3s ease;
        }

        @keyframes msgFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .ai-msg.bot {
            align-self: flex-start;
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(218, 154, 40, 0.25);
            color: #e2e8f0;
            border-top-left-radius: 4px;
        }

        .ai-msg.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #da9a28, #b87b14);
            color: #0f172a;
            font-weight: 600;
            border-top-right-radius: 4px;
            box-shadow: 0 4px 12px rgba(218, 154, 40, 0.3);
        }

        /* Quick Suggestions */
        .ai-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
        }

        .ai-chip {
            background: rgba(218, 154, 40, 0.12);
            border: 1px solid rgba(218, 154, 40, 0.4);
            color: #da9a28;
            font-size: 0.78rem;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .ai-chip:hover {
            background: #da9a28;
            color: #0f172a;
            transform: translateY(-1px);
        }

        /* Typing Indicator */
        .ai-typing {
            align-self: flex-start;
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(218, 154, 40, 0.25);
            padding: 10px 16px;
            border-radius: 16px;
            border-top-left-radius: 4px;
            display: none;
            align-items: center;
            gap: 4px;
        }

        .ai-typing span {
            width: 6px;
            height: 6px;
            background: #da9a28;
            border-radius: 50%;
            animation: typingDot 1.4s infinite ease-in-out both;
        }

        .ai-typing span:nth-child(1) { animation-delay: -0.32s; }
        .ai-typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typingDot {
            0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* Chat Footer & Input */
        .ai-chat-footer {
            padding: 12px;
            background: #0f172a;
            border-top: 1px solid rgba(218, 154, 40, 0.25);
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .ai-input {
            flex: 1;
            background: rgba(30, 41, 59, 0.8) !important;
            border: 1px solid rgba(218, 154, 40, 0.3) !important;
            border-radius: 25px !important;
            padding: 9px 16px !important;
            color: #ffffff !important;
            font-size: 0.85rem !important;
            outline: none !important;
        }

        .ai-input::placeholder {
            color: #94a3b8 !important;
        }

        .ai-send-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #da9a28, #f5c842);
            border: none;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            box-shadow: 0 3px 10px rgba(218, 154, 40, 0.4);
        }

        .ai-send-btn:hover {
            transform: scale(1.08);
            background: #ffffff;
            color: #da9a28;
        }

        .ai-bot-link {
            display: inline-block;
            margin-top: 8px;
            background: #25d366;
            color: #ffffff !important;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 8px;
            text-decoration: none !important;
            font-size: 0.8rem;
            box-shadow: 0 3px 8px rgba(37, 211, 102, 0.4);
            transition: all 0.2s ease;
        }

        .ai-bot-link:hover {
            background: #1eb956;
            transform: translateY(-1px);
        }

        @media (max-width: 480px) {
            #ai-chat-window {
                right: 12px;
                bottom: 85px;
                width: calc(100vw - 24px);
                height: 480px;
            }
            #ai-agent-btn {
                bottom: 18px;
                right: 18px;
                width: 56px;
                height: 56px;
            }
            #cart-button {
                bottom: 86px !important;
                right: 18px !important;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject DOM Elements
    const btnHtml = `
        <button id="ai-agent-btn" aria-label="WhatsApp AI Assistant Chat">
            <i class="fab fa-whatsapp ai-icon"></i>
            <span id="ai-agent-badge">AI 24/7</span>
        </button>
    `;

    const chatModalHtml = `
        <div id="ai-chat-window">
            <div class="ai-chat-header">
                <div class="ai-header-info">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                        <span class="ai-online-dot"></span>
                    </div>
                    <div class="ai-title-box">
                        <h5>Al Harmain AI Agent <i class="fas fa-check-circle" style="color:#25d366; font-size:12px;"></i></h5>
                        <small>Online | Instant Umrah Transport Assistant</small>
                    </div>
                </div>
                <button class="ai-close-btn" id="ai-close-chat" aria-label="Close Chat">&times;</button>
            </div>

            <div class="ai-chat-body" id="ai-chat-body">
                <div class="ai-msg bot">
                    👋 <strong>Assalamu Alaikum!</strong> Welcome to <strong>AL HARMAIN UMRAH TRANSPORT</strong>.<br><br>
                    I am your 24/7 AI Transport Assistant! How can I assist your holy journey today?
                    <div class="ai-suggestions mt-2">
                        <span class="ai-chip" data-query="Book Umrah Transport"><i class="fas fa-kaaba"></i> Book Taxi</span>
                        <span class="ai-chip" data-query="Makkah to Madinah transport"><i class="fas fa-route"></i> Makkah ↔ Madinah</span>
                        <span class="ai-chip" data-query="Jeddah Airport Pick & Drop"><i class="fas fa-plane-arrival"></i> Airport Pickup</span>
                        <span class="ai-chip" data-query="Available Vehicles & Fleet"><i class="fas fa-car-side"></i> Vehicle Fleet</span>
                        <span class="ai-chip" data-query="WhatsApp Contact Number"><i class="fab fa-whatsapp"></i> WhatsApp Support</span>
                    </div>
                </div>
                <div class="ai-typing" id="ai-typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="ai-chat-input" class="ai-input" placeholder="Ask AI Agent (English / اردو)..." />
                <button id="ai-send-btn" class="ai-send-btn" aria-label="Send Message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', btnHtml);
    document.body.insertAdjacentHTML('beforeend', chatModalHtml);

    // 3. Logic & Knowledge Base Engine
    const aiBtn = document.getElementById('ai-agent-btn');
    const aiChat = document.getElementById('ai-chat-window');
    const aiClose = document.getElementById('ai-close-chat');
    const chatBody = document.getElementById('ai-chat-body');
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const typingIndicator = document.getElementById('ai-typing-indicator');

    // Toggle Chat Window
    aiBtn.addEventListener('click', () => {
        aiChat.classList.toggle('active');
        const badge = document.getElementById('ai-agent-badge');
        if (badge) badge.style.display = 'none';
        if (aiChat.classList.contains('active')) {
            chatInput.focus();
        }
    });

    aiClose.addEventListener('click', () => {
        aiChat.classList.remove('active');
    });

    // Handle suggestion chips
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-chip') || e.target.closest('.ai-chip')) {
            const chip = e.target.classList.contains('ai-chip') ? e.target : e.target.closest('.ai-chip');
            const query = chip.getAttribute('data-query');
            if (query) {
                processUserMessage(query);
            }
        }
    });

    // Send Message Event
    sendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) {
            processUserMessage(text);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = chatInput.value.trim();
            if (text) {
                processUserMessage(text);
                chatInput.value = '';
            }
        }
    });

    function processUserMessage(userMsg) {
        // Append user message
        appendMessage(userMsg, 'user');

        // Show typing indicator
        showTyping(true);

        // Generate response with artificial realistic delay
        setTimeout(() => {
            showTyping(false);
            const botReply = generateAIResponse(userMsg);
            appendMessage(botReply, 'bot');
        }, 700);
    }

    function appendMessage(htmlContent, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${type}`;
        msgDiv.innerHTML = htmlContent;
        chatBody.insertBefore(msgDiv, typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTyping(show) {
        typingIndicator.style.display = show ? 'flex' : 'none';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Knowledge Base Intelligence Matcher
    function generateAIResponse(query) {
        const q = query.toLowerCase();

        // 1. Greetings
        if (q.includes('hi') || q.includes('hello') || q.includes('salam') || q.includes('assalam') || q.includes('hey') || q.includes('namaste')) {
            return `
                Walaikum Assalam! 🕋 Welcome to <strong>Al Harmain Umrah Transport</strong>.<br>
                How can I assist your transport planning in Saudi Arabia today? You can ask me about vehicles, routes, or instant bookings!
                <div class="ai-suggestions mt-2">
                    <span class="ai-chip" data-query="Makkah to Madinah transport">Makkah ↔ Madinah</span>
                    <span class="ai-chip" data-query="Jeddah Airport Pick & Drop">Jeddah Airport</span>
                    <span class="ai-chip" data-query="Book on WhatsApp">Book via WhatsApp</span>
                </div>
            `;
        }

        // 2. Booking / How to Book, in Urdu/Roman Urdu or English
        if (q.includes('book') || q.includes('booking') || q.includes('chahiay') || q.includes('chahiye') || q.includes('kiraya') || q.includes('karana')) {
            return `
                🚗 <strong>Instant Booking Process:</strong><br>
                Booking with Al Harmain Umrah Transport is fast & simple!<br>
                1. Select your Pick-up & Drop-off cities (Makkah, Madinah, Jeddah Airport, Taif).<br>
                2. Choose your preferred vehicle (Sedan, SUV Yukon, Hiace, Coaster, Bus).<br>
                3. Get instant confirmation on WhatsApp with our 24/7 support team!<br><br>
                <a href="https://wa.me/966565476113?text=Hello!%20I%20want%20to%20book%20transport%20service." target="_blank" class="ai-bot-link">
                    <i class="fab fa-whatsapp me-1"></i> Click to Book via WhatsApp Now
                </a>
            `;
        }

        // 3. Makkah to Madinah / Intercity
        if (q.includes('makkah') && q.includes('madinah') || q.includes('intercity') || q.includes('city to city')) {
            return `
                🕌 <strong>Makkah ↔ Madinah Intercity Transport:</strong><br>
                We provide private executive transfer between Makkah and Madinah in brand-new luxury vehicles:<br>
                • <strong>Toyota Camry / Sonata</strong> — up to 4 passengers<br>
                • <strong>Hyundai Staria</strong> — up to 7 passengers<br>
                • <strong>GMC Yukon XL</strong> — VIP executive SUV<br>
                • <strong>Hiace Van</strong> — 10 to 13 passengers<br><br>
                Includes doorstep hotel pickup, luggage support, and professional multilingual driver.
                <br><a href="https://wa.me/966565476113?text=I%20want%20to%20book%20Makkah%20to%20Madinah%20transport" target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> Reserve Makkah to Madinah Taxi</a>
            `;
        }

        // 4. Jeddah Airport Transfers
        if (q.includes('jeddah') || q.includes('airport') || q.includes('pickup') || q.includes('drop')) {
            return `
                ✈️ <strong>Jeddah Airport (KAIA) Pick & Drop Service:</strong><br>
                We track your flight arrival to ensure your driver is waiting at the arrival terminal with a name sign.<br>
                • <strong>Jeddah Airport to your Makkah hotel</strong><br>
                • <strong>Jeddah Airport to your Madinah hotel</strong><br><br>
                Available 24 Hours a day, 7 days a week.
                <br><a href="https://wa.me/966565476113?text=I%20need%20Jeddah%20Airport%20Pickup" target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> Book Airport Pickup</a>
            `;
        }

        // 5. Vehicles & Fleet (Camry, Yukon, Hiace, Bus, etc.)
        if (q.includes('fleet') || q.includes('car') || q.includes('vehicle') || q.includes('gmc') || q.includes('yukon') || q.includes('camry') || q.includes('hiace') || q.includes('bus') || q.includes('gaddi')) {
            return `
                🚘 <strong>Our Luxury Vehicle Fleet:</strong><br>
                1. <strong>Toyota Camry / Sonata:</strong> Up to 4 Passengers + 2 Bags<br>
                2. <strong>Hyundai Staria:</strong> Up to 7 Passengers + 5 Bags<br>
                3. <strong>GMC Yukon XL:</strong> VIP Executive SUV (7 Passengers + 6 Bags)<br>
                4. <strong>Hiace Grand Cabin:</strong> 10-13 Passengers + 10 Bags<br>
                5. <strong>Coaster Minibus:</strong> 20-30 Passengers<br>
                6. <strong>VIP 50-Seater Bus:</strong> Group Umrah Delegations<br><br>
                All vehicles feature high-grade dual air conditioning, plush seating, and spotless cleanliness.
                <div class="ai-suggestions mt-2">
                    <span class="ai-chip" data-query="Book GMC Yukon">Book GMC Yukon</span>
                    <span class="ai-chip" data-query="Book Toyota Camry">Book Camry</span>
                </div>
            `;
        }

        // 6. Ziyarat / Sightseeing Tours
        if (q.includes('ziyarat') || q.includes('ziyarat tour') || q.includes('tour') || q.includes('taif') || q.includes('historical')) {
            return `
                🕋 <strong>Sacred Ziyarat Tours:</strong><br>
                • <strong>Makkah Ziyarat:</strong> Jabal Al-Noor (Cave Hira), Mina, Arafat, Muzdalifah, Jabal Thawr & Masjid Taneem.<br>
                • <strong>Madinah Ziyarat:</strong> Masjid Quba, Mount Uhud, Masjid Qiblatain, Seven Mosques & Date Gardens.<br>
                • <strong>Taif City Tour:</strong> Scenic Cable Car, Rose Factories, Al-Hada & Historic Forts.<br><br>
                Flexible 3 to 5 hour tour packages with knowledgeable drivers.
                <br><a href="https://wa.me/966565476113?text=I%20want%20to%20book%20a%20Ziyarat%20Tour" target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> Book Ziyarat Tour</a>
            `;
        }

        // 7. Contact Info / Phone / WhatsApp
        if (q.includes('contact') || q.includes('phone') || q.includes('whatsapp') || q.includes('number') || q.includes('call') || q.includes('support')) {
            return `
                📞 <strong>Direct Contact & 24/7 Support:</strong><br>
                • <strong>Phone / WhatsApp:</strong> <a href="tel:+966596789290" style="color:#da9a28; text-decoration:underline;">+966 59 678 9290</a><br>
                • <strong>Secondary Line:</strong> +966 56 547 6113<br>
                • <strong>Email:</strong> info@alharmainumrahtransport.com<br>
                • <strong>Operating Hours:</strong> 24 Hours / 7 Days a week<br><br>
                <a href="https://wa.me/966565476113" target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> Open WhatsApp Chat</a>
            `;
        }

        // 8. Fares. The team quotes these on WhatsApp, never the bot: a figure
        // baked into a script goes stale, and a guest who was quoted one here
        // and charged another has been misled.
        if (q.includes('rate') || q.includes('price') || q.includes('fare') || q.includes('cost') || q.includes('how much')) {
            return `
                💬 <strong>Fares:</strong><br>
                Your fare depends on the route, the vehicle and the travel date, so our team confirms it for you directly — usually within a few minutes.<br><br>
                Send us your pick-up, your drop-off and your date, and we will send the exact fare back on WhatsApp.
                <br><a href="https://wa.me/966565476113?text=Assalamu%20Alaikum%2C%20I%20would%20like%20a%20fare%20for%20my%20journey." target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> Get a Fare on WhatsApp</a>
            `;
        }

        // 9. Urdu / Roman Urdu queries (Kitne, Kahan, etc.)
        if (q.includes('kitne') || q.includes('kitna') || q.includes('paise') || q.includes('shukriya') || q.includes('kaise')) {
            return `
                Aap Al Harmain Umrah Transport ki kisi bhi gaddi (Camry, Yukon SUV, Hiace ya Bus) ki booking WhatsApp par 2 minute mein kar saktay hain.<br><br>
                • <strong>Makkah se Madinah</strong><br>
                • <strong>Jeddah Airport Pickup</strong><br>
                • <strong>Ziyarat Package:</strong> Full custom tour available<br><br>
                Abhi WhatsApp par rabta karein:
                <br><a href="https://wa.me/966565476113?text=Salam!%20Mujhe%20transport%20booking%20ki%20details%20chahiye" target="_blank" class="ai-bot-link"><i class="fab fa-whatsapp me-1"></i> WhatsApp Par Baat Karein</a>
            `;
        }

        // Default response fallback
        return `
            Thank you for asking! 🕋 <strong>AL HARMAIN UMRAH TRANSPORT</strong> provides luxury private taxis across Saudi Arabia (Makkah, Madinah, Jeddah & Taif).<br><br>
            Would you like to check:
            <div class="ai-suggestions mt-2">
                <span class="ai-chip" data-query="Makkah to Madinah transport">Makkah ↔ Madinah</span>
                <span class="ai-chip" data-query="Jeddah Airport Pick & Drop">Jeddah Airport Transfer</span>
                <span class="ai-chip" data-query="Available Vehicles & Fleet">Vehicle Fleet</span>
                <span class="ai-chip" data-query="WhatsApp Contact Number">Direct WhatsApp Support</span>
            </div>
        `;
    }

})();
