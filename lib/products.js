// Mock product database
let products = [
    {
        id: '1',
        name: 'Wireless Headphones Pro',
        description: 'Experience audio perfection with our Premium Wireless Headphones Pro. Engineered with advanced active noise cancellation technology, these headphones deliver crystal-clear sound that adapts to your environment.\n\nWhether you\'re commuting, working from home, or traveling, enjoy uninterrupted listening with 30 hours of continuous playback. The ergonomic design ensures all-day comfort, while premium materials provide durability that lasts.\n\nConnect seamlessly with Bluetooth 5.0 technology and experience studio-quality sound with deep bass, clear mids, and crisp highs. Perfect for music lovers, professionals, and anyone who demands excellence in audio.',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
        category: 'Electronics',
        stock: 45,
        rating: 4.8,
        features: [
            'Advanced Active Noise Cancellation - Blocks up to 95% of ambient noise',
            'Bluetooth 5.0 Connectivity - Stable connection up to 33 feet',
            '30-Hour Battery Life - Extended playback with quick charge support',
            'Premium Sound Quality - 40mm drivers with Hi-Res audio certification',
            'Comfortable Design - Memory foam ear cushions and adjustable headband',
            'Built-in Microphone - Crystal clear calls with noise reduction',
            'Foldable Design - Compact carrying case included'
        ],
        specifications: {
            'Driver Size': '40mm dynamic drivers',
            'Frequency Response': '20Hz - 20kHz',
            'Impedance': '32 Ohms',
            'Bluetooth Version': '5.0',
            'Battery Life': '30 hours (ANC on), 40 hours (ANC off)',
            'Charging Time': '2 hours (USB-C fast charging)',
            'Weight': '250g',
            'Warranty': '2 years manufacturer warranty'
        },
        reviews: [
            {
                name: 'Michael Chen',
                rating: 5,
                comment: 'Best headphones I\'ve ever owned! The noise cancellation is incredible - I can finally focus on my work in a busy office. Sound quality is phenomenal with deep bass and clear vocals.',
                date: '2 days ago',
                verified: true
            },
            {
                name: 'Sarah Johnson',
                rating: 5,
                comment: 'Worth every penny! Battery life is amazing, I charge them once a week. Super comfortable for long flights. The case is compact and protective.',
                date: '5 days ago',
                verified: true
            },
            {
                name: 'David Martinez',
                rating: 4,
                comment: 'Great headphones overall. Sound quality is excellent and the ANC works really well. Only minor complaint is they can feel a bit tight after several hours, but quality is top-notch.',
                date: '1 week ago',
                verified: true
            }
        ]
    },
    {
        id: '2',
        name: 'Smart Watch Elite',
        description: 'Transform your fitness journey with the Smart Watch Elite. This advanced wearable combines cutting-edge health monitoring with intelligent features that keep you connected throughout your day.\n\nTrack your workouts with precision using built-in GPS, monitor your heart rate 24/7, and gain insights into your sleep patterns. With water resistance up to 50 meters, take it swimming, showering, or anywhere life takes you.\n\nStay connected with smart notifications, contactless payments, and voice assistant integration. The vibrant AMOLED display ensures perfect visibility in any lighting condition, while the premium build quality makes a statement on your wrist.',
        price: 399.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
        category: 'Electronics',
        stock: 32,
        rating: 4.6,
        features: [
            'Advanced Heart Rate Monitoring - Continuous tracking with irregular rhythm notifications',
            'Built-in GPS - Accurate distance and route tracking without your phone',
            '50m Water Resistance - Swim-proof design for pool and ocean activities',
            'Smart Notifications - Calls, texts, and app alerts on your wrist',
            'Sleep Tracking - Detailed sleep stage analysis and recommendations',
            'Contactless Payments - NFC chip for secure mobile payments',
            '7-Day Battery Life - Extended use with power-saving modes'
        ],
        specifications: {
            'Display': '1.4" AMOLED touchscreen (454x454 resolution)',
            'Processor': 'Dual-core 1.2GHz',
            'Memory': '1GB RAM, 8GB storage',
            'Sensors': 'Heart rate, GPS, accelerometer, gyroscope, compass, blood oxygen',
            'Connectivity': 'Bluetooth 5.0, WiFi, NFC',
            'Battery': '7 days typical use, 2 days with always-on display',
            'Water Resistance': '5ATM (50 meters)',
            'Compatibility': 'iOS 12+ and Android 7.0+'
        },
        reviews: [
            {
                name: 'Emma Wilson',
                rating: 5,
                comment: 'This watch has been a game-changer for my fitness routine! The GPS tracking is spot-on, and I love the detailed workout summaries. Battery lasts almost a week with daily workouts.',
                date: '3 days ago',
                verified: true
            },
            {
                name: 'James Thompson',
                rating: 4,
                comment: 'Excellent smartwatch with great features. Heart rate monitoring seems very accurate compared to chest straps. The app ecosystem could be better, but overall very satisfied.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Lisa Rodriguez',
                rating: 5,
                comment: 'Love the sleep tracking feature! It\'s helped me understand my sleep patterns and make improvements. The watch is comfortable to wear all day and night.',
                date: '2 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '3',
        name: 'Ultra HD Camera',
        description: 'Capture life\'s precious moments in stunning 4K Ultra HD with our professional-grade camera. Designed for both enthusiasts and professionals, this camera delivers exceptional image quality that brings your creative vision to life.\n\nThe 24-megapixel sensor combined with advanced image processing ensures every photo is sharp, vibrant, and true to life. Advanced 5-axis image stabilization keeps your shots steady, whether you\'re shooting handheld videos or low-light photography.\n\nWith intuitive controls, built-in WiFi for instant sharing, and a robust weather-sealed body, this camera is your perfect companion for any adventure. From weddings to wildlife, landscapes to portraits, achieve professional results every time.',
        price: 899.99,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop',
        category: 'Photography',
        stock: 18,
        rating: 4.9,
        features: [
            '4K Ultra HD Video - Cinema-quality 4K at 60fps with HDR support',
            '24MP APS-C Sensor - Exceptional detail and low-light performance',
            '5-Axis Image Stabilization - Sharp handheld shots up to 5 stops',
            'WiFi & Bluetooth - Instant transfer and remote camera control',
            'Weather-Sealed Body - Dust and moisture resistant for outdoor use',
            'Tilting Touchscreen - 3.2" LCD with intuitive touch controls',
            'Fast Autofocus - 425-point hybrid AF system with eye tracking'
        ],
        specifications: {
            'Sensor': '24.2MP APS-C CMOS sensor',
            'Image Processor': 'DIGIC X processor',
            'ISO Range': '100-25600 (expandable to 51200)',
            'Video Recording': '4K UHD at 60fps, Full HD at 120fps',
            'Autofocus Points': '425 phase-detection points',
            'Continuous Shooting': '10 fps mechanical, 20 fps electronic',
            'Screen': '3.2" tilting touchscreen LCD',
            'Weight': '650g (body only)'
        },
        reviews: [
            {
                name: 'Robert Kim',
                rating: 5,
                comment: 'As a professional photographer, this camera exceeds expectations. Image quality is outstanding, autofocus is lightning fast, and the 4K video is cinema-grade. Best investment for my business!',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Jennifer Lee',
                rating: 5,
                comment: 'Upgraded from my old DSLR and wow, what a difference! The image stabilization is incredible - I can shoot handheld in low light. The WiFi feature is so convenient for sharing.',
                date: '2 weeks ago',
                verified: true
            },
            {
                name: 'Mark Patterson',
                rating: 4,
                comment: 'Fantastic camera with pro features. Learning curve is moderate but worth it. Build quality feels premium and weather sealing gives me confidence in any condition.',
                date: '3 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '4',
        name: 'Gaming Laptop X1',
        description: 'Dominate the competition with the Gaming Laptop X1, engineered for peak gaming performance. Powered by the latest NVIDIA RTX graphics and a high-performance processor, this laptop delivers desktop-level power in a portable form factor.\n\nThe stunning 144Hz display ensures buttery-smooth gameplay with minimal motion blur, while advanced cooling technology keeps temperatures in check during intense gaming sessions. With 16GB of high-speed RAM and a lightning-fast SSD, experience zero lag and instant load times.\n\nThe customizable RGB keyboard not only looks spectacular but provides the tactile feedback gamers demand. Whether you\'re into competitive esports, AAA titles, or content creation, this laptop handles it all with ease. Stream, game, and create without compromise.',
        price: 1499.99,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=800&fit=crop',
        category: 'Computers',
        stock: 12,
        rating: 4.7,
        features: [
            'NVIDIA RTX 4060 Graphics - Ray tracing and DLSS for ultimate visuals',
            '144Hz FHD Display - Ultra-smooth gameplay with 3ms response time',
            'Intel Core i7 Processor - 12th Gen with 8 performance cores',
            '16GB DDR5 RAM - High-speed memory for multitasking',
            '1TB NVMe SSD - Lightning-fast storage and boot times',
            'Advanced Cooling System - Dual fans with optimized airflow',
            'Customizable RGB Keyboard - Per-key lighting with gaming profiles'
        ],
        specifications: {
            'Processor': 'Intel Core i7-12700H (2.3GHz base, 4.7GHz boost)',
            'Graphics': 'NVIDIA GeForce RTX 4060 8GB GDDR6',
            'Display': '15.6" FHD (1920x1080) 144Hz, 3ms, 300 nits',
            'Memory': '16GB DDR5-4800MHz (expandable to 32GB)',
            'Storage': '1TB PCIe Gen 4 NVMe SSD',
            'Ports': '3x USB-A 3.2, 1x USB-C Thunderbolt 4, HDMI 2.1, Ethernet',
            'Battery': '90Wh, up to 6 hours mixed use',
            'Weight': '2.3kg'
        },
        reviews: [
            {
                name: 'Alex Turner',
                rating: 5,
                comment: 'Beast of a laptop! Runs Cyberpunk 2077 at ultra settings with ray tracing at 80+ fps. The cooling is impressive - never throttles even during long gaming sessions. Best gaming laptop I\'ve owned.',
                date: '4 days ago',
                verified: true
            },
            {
                name: 'Chris Anderson',
                rating: 5,
                comment: 'Perfect for both gaming and video editing. The RTX 4060 handles rendering like a champ. Display is gorgeous with vibrant colors. Battery life is decent for a gaming laptop.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Taylor Brooks',
                rating: 4,
                comment: 'Excellent performance and build quality. Fans can get loud under heavy load but that\'s expected. The RGB keyboard is fun and responsive. Highly recommend for serious gamers.',
                date: '2 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '5',
        name: 'Portable Speaker Max',
        description: 'Take your music anywhere with the Portable Speaker Max. This rugged Bluetooth speaker delivers powerful 360-degree sound that fills any space, from intimate gatherings to outdoor parties.\n\nBuilt to withstand the elements, the IP67 waterproof rating means you can enjoy your favorite tunes by the pool, at the beach, or even in the rain without worry. The shock-resistant design ensures it survives drops and bumps during your adventures.\n\nWith 20 hours of continuous playtime, the party doesn\'t have to stop. Pair two speakers for true stereo sound, or connect via the mobile app for customizable EQ settings. Premium drivers deliver deep bass, clear mids, and crisp highs that bring your music to life.',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop',
        category: 'Audio',
        stock: 67,
        rating: 4.5,
        features: [
            'IP67 Waterproof Rating - Fully submersible and dustproof',
            '360-Degree Sound - Omnidirectional audio for even coverage',
            '20-Hour Battery Life - All-day music on a single charge',
            'Deep Bass Technology - Dual passive radiators for powerful low end',
            'PartyBoost Mode - Connect multiple speakers for bigger sound',
            'Built-in Power Bank - Charge your devices on the go',
            'Durable Construction - Shock-resistant with rubberized exterior'
        ],
        specifications: {
            'Audio Output': '30W RMS (2x15W drivers)',
            'Frequency Response': '65Hz - 20kHz',
            'Bluetooth': 'Version 5.3 with 100ft range',
            'Water Resistance': 'IP67 certified',
            'Battery': '7500mAh, 20 hours playtime',
            'Charging': 'USB-C, 3 hours full charge',
            'Dimensions': '8.5" x 3.5" x 3.5"',
            'Weight': '1.2 lbs'
        },
        reviews: [
            {
                name: 'Ryan Cooper',
                rating: 5,
                comment: 'Incredible sound for the size! I\'ve taken this to the beach multiple times and it still works perfectly. Battery lasts forever and the bass is surprisingly deep.',
                date: '3 days ago',
                verified: true
            },
            {
                name: 'Amanda Scott',
                rating: 4,
                comment: 'Great speaker for outdoor use. Sound quality is excellent and it\'s truly waterproof - tested it in the pool! Only wish it came in more color options.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Kevin Zhang',
                rating: 5,
                comment: 'Best portable speaker I\'ve purchased. The 360-degree sound is perfect for parties. Paired two together and the stereo effect is amazing. Highly recommended!',
                date: '2 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '6',
        name: 'Smart Home Hub',
        description: 'Transform your house into a smart home with our intelligent Smart Home Hub. This central command center seamlessly connects and controls all your smart devices through a single, intuitive interface.\n\nSimplify your life with voice control powered by advanced AI. Just speak your commands to adjust lighting, temperature, security systems, and entertainment devices. The hub learns your routines and preferences, automating your home to match your lifestyle.\n\nWith support for over 1000 compatible devices and protocols including Zigbee, Z-Wave, and WiFi, easily expand your smart home ecosystem. The sleek design fits perfectly in any room, while the companion mobile app gives you complete control from anywhere in the world.',
        price: 179.99,
        image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop',
        category: 'Smart Home',
        stock: 41,
        rating: 4.4,
        features: [
            'Universal Compatibility - Works with 1000+ smart devices',
            'Advanced Voice Control - Built-in AI assistant with natural language',
            'Multi-Protocol Support - Zigbee, Z-Wave, WiFi, and Bluetooth',
            'Automation Routines - Create custom scenes and schedules',
            'Mobile App Control - Manage your home from anywhere',
            'Local Processing - Works without internet for privacy and reliability',
            'Easy Setup - Guided installation in under 10 minutes'
        ],
        specifications: {
            'Processor': 'Quad-core ARM Cortex-A53',
            'Connectivity': 'Dual-band WiFi, Zigbee 3.0, Z-Wave Plus, Bluetooth 5.0',
            'Voice Assistant': 'Built-in AI with multi-language support',
            'Supported Devices': '1000+ brands and protocols',
            'Storage': '8GB internal memory',
            'Ports': 'Ethernet, USB 3.0, Audio out',
            'Power': '12V DC adapter included',
            'Dimensions': '5" x 5" x 2"'
        },
        reviews: [
            {
                name: 'Patricia Moore',
                rating: 5,
                comment: 'Game changer for home automation! Setup was incredibly easy and it connected to all my devices without issues. The voice control is responsive and accurate.',
                date: '5 days ago',
                verified: true
            },
            {
                name: 'Daniel Foster',
                rating: 4,
                comment: 'Solid smart home hub. Works well with all my devices and the app is user-friendly. Automation features are powerful once you learn them. Great value for money.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Michelle Harris',
                rating: 4,
                comment: 'Very impressed with the compatibility. Connected my lights, thermostat, and security cameras easily. Local processing is a nice privacy feature.',
                date: '3 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '7',
        name: 'Fitness Tracker Band',
        description: 'Achieve your fitness goals with the Fitness Tracker Band, your personal health companion on your wrist. This sleek and lightweight band monitors every aspect of your wellness journey, from steps and calories to heart rate and sleep quality.\n\nThe advanced optical heart rate sensor provides accurate 24/7 monitoring, alerting you to abnormal patterns and helping you optimize your workouts. Detailed sleep tracking analyzes your sleep stages, offering personalized recommendations for better rest and recovery.\n\nWith 14 sport modes and automatic activity recognition, accurately track everything from running and cycling to swimming and yoga. The vibrant color display is easy to read in any lighting, while the 7-day battery life means less time charging and more time moving.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop',
        category: 'Fitness',
        stock: 89,
        rating: 4.3,
        features: [
            '24/7 Heart Rate Monitoring - Continuous tracking with resting HR',
            'Advanced Sleep Analysis - Track light, deep, and REM sleep stages',
            '14 Sport Modes - Running, cycling, swimming, and more',
            '5ATM Water Resistance - Swim-proof up to 50 meters',
            '7-Day Battery Life - Week-long use on single charge',
            'Smart Notifications - Call, text, and app alerts',
            'Menstrual Cycle Tracking - Period and fertility predictions'
        ],
        specifications: {
            'Display': '1.1" AMOLED color touchscreen',
            'Sensors': 'Optical heart rate, 3-axis accelerometer',
            'Water Resistance': '5ATM (50 meters)',
            'Battery Life': '7 days typical, 14 days power saving',
            'Charging': 'Magnetic USB charging (2 hours)',
            'Connectivity': 'Bluetooth 5.0',
            'Compatibility': 'iOS 10+ and Android 5.0+',
            'Weight': '24g with strap'
        },
        reviews: [
            {
                name: 'Sophie Turner',
                rating: 5,
                comment: 'Perfect fitness tracker for the price! Tracks my runs accurately and the sleep monitoring has helped me improve my sleep habits. Battery lasts exactly as advertised.',
                date: '2 days ago',
                verified: true
            },
            {
                name: 'Mike Johnson',
                rating: 4,
                comment: 'Great value fitness band. Heart rate seems accurate compared to my chest strap. The display is bright and easy to read outdoors. Would buy again.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Rachel Green',
                rating: 4,
                comment: 'Love this fitness tracker! Comfortable to wear all day and night. The app is intuitive with helpful insights. Only wish it had built-in GPS.',
                date: '2 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '8',
        name: 'Mechanical Keyboard RGB',
        description: 'Elevate your typing and gaming experience with the Mechanical Keyboard RGB. Crafted for enthusiasts and professionals who demand precision, this keyboard features premium mechanical switches that deliver satisfying tactile feedback with every keystroke.\n\nCustomize your setup with stunning per-key RGB lighting, choosing from millions of colors and dynamic effects. Create profiles for different applications, from subtle office lighting to vibrant gaming scenes. The durable aluminum frame provides stability during intense gaming sessions while adding a premium aesthetic to your desk.\n\nWith programmable macro keys, N-key rollover, and anti-ghosting technology, every input is registered accurately, no matter how fast you type or game. The detachable braided cable and onboard memory ensure your settings travel with you wherever you go.',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop',
        category: 'Accessories',
        stock: 54,
        rating: 4.7,
        features: [
            'Premium Mechanical Switches - Choice of tactile, linear, or clicky',
            'Per-Key RGB Lighting - 16.8 million colors with custom effects',
            'Programmable Macros - Assign complex commands to any key',
            'N-Key Rollover - Simultaneous key presses recognized',
            'Aluminum Construction - Military-grade durability and stability',
            'Ergonomic Design - Adjustable feet and included wrist rest',
            'Onboard Memory - Save profiles directly to the keyboard'
        ],
        specifications: {
            'Switch Type': 'Hot-swappable mechanical (Blue/Red/Brown)',
            'Actuation Force': '50g (varies by switch)',
            'Key Travel': '4mm total, 2mm actuation',
            'Backlighting': 'Per-key RGB with 16.8M colors',
            'Connectivity': 'USB-C braided cable (detachable)',
            'Polling Rate': '1000Hz (1ms response)',
            'Material': 'Aluminum top plate, ABS keycaps',
            'Weight': '1.1kg'
        },
        reviews: [
            {
                name: 'Eric Thompson',
                rating: 5,
                comment: 'Best mechanical keyboard I\'ve used! The switches feel amazing and the RGB lighting is gorgeous. Build quality is solid and the typing experience is premium.',
                date: '3 days ago',
                verified: true
            },
            {
                name: 'Jessica Miller',
                rating: 5,
                comment: 'Absolutely love this keyboard! Switched from membrane and can\'t believe the difference. The tactile feedback is perfect for coding. RGB customization is endless.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Brandon Lee',
                rating: 4,
                comment: 'Excellent keyboard for gaming and typing. The macro keys are super useful. Keycaps feel good but might upgrade to PBT later. Overall great value.',
                date: '2 weeks ago',
                verified: true
            }
        ]
    },
    {
        id: '9',
        name: 'Drone Pro 4K',
        description: 'Take your aerial photography to new heights with the Drone Pro 4K. This advanced quadcopter combines professional-grade camera technology with intelligent flight features, making it perfect for both hobbyists and content creators.\n\nCapture stunning 4K video at 60fps with a 3-axis gimbal that ensures silky-smooth footage even in windy conditions. The 1/2.3" CMOS sensor delivers exceptional image quality with vibrant colors and impressive dynamic range. Advanced computer vision enables intelligent flight modes including object tracking, orbit, and waypoint navigation.\n\nWith up to 30 minutes of flight time and a range of 4 miles, explore vast areas and capture breathtaking perspectives. Obstacle avoidance sensors in all directions ensure safe flight, while the automatic return-to-home feature brings your drone back safely with the press of a button.',
        price: 699.99,
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=800&fit=crop',
        category: 'Photography',
        stock: 23,
        rating: 4.6,
        features: [
            '4K/60fps Camera - Professional video quality with HDR',
            '3-Axis Gimbal - Ultra-smooth stabilization for cinematic shots',
            'GPS Navigation - Precise positioning and waypoint flight',
            '30-Minute Flight Time - Extended aerial exploration',
            'Omnidirectional Obstacle Avoidance - Safe flight in any direction',
            'Intelligent Flight Modes - ActiveTrack, Point of Interest, Orbit',
            'Automatic Return-to-Home - Safe landing with one button'
        ],
        specifications: {
            'Camera': '1/2.3" CMOS, 12MP photos',
            'Video Resolution': '4K at 60fps, 2.7K at 120fps',
            'Gimbal': '3-axis mechanical (±0.005° precision)',
            'Flight Time': '30 minutes (no wind)',
            'Max Speed': '45 mph (Sport mode)',
            'Transmission Range': '4 miles (FCC), 2.5 miles (CE)',
            'Obstacle Sensing': 'Front, rear, left, right, top, bottom',
            'Weight': '570g'
        },
        reviews: [
            {
                name: 'Carlos Rivera',
                rating: 5,
                comment: 'Incredible drone for the price! Video quality is absolutely stunning and the gimbal is buttery smooth. Intelligent flight modes make it easy to get cinematic shots. Best purchase this year!',
                date: '4 days ago',
                verified: true
            },
            {
                name: 'Nicole Adams',
                rating: 5,
                comment: 'As a real estate photographer, this drone has been a game changer. Easy to fly, stable in wind, and the 4K footage is professional grade. Obstacle avoidance works flawlessly.',
                date: '1 week ago',
                verified: true
            },
            {
                name: 'Tom Bradley',
                rating: 4,
                comment: 'Fantastic drone with great features. Flight time is solid and the camera quality exceeds expectations. Learning curve is minimal with the intuitive controls. Highly recommend!',
                date: '3 weeks ago',
                verified: true
            }
        ]
    }
]

export function getAllProducts() {
    return products
}

export function getProductById(id) {
    return products.find(product => product.id === id)
}

export function addProduct(productData) {
    const newProduct = {
        id: String(products.length + 1),
        ...productData,
        rating: 0,
        features: productData.features || [],
        specifications: productData.specifications || {},
        reviews: productData.reviews || [],
        image: productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'
    }
    products.push(newProduct)
    return newProduct
}

export function updateProduct(id, updates) {
    const index = products.findIndex(p => p.id === id)
    if (index !== -1) {
        products[index] = { ...products[index], ...updates }
        return products[index]
    }
    return null
}

export function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id)
    if (index !== -1) {
        products.splice(index, 1)
        return true
    }
    return false
}
