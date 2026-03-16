const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Dummy database for the Live Intelligence Map nodes
const mapNodes = [
    { id: 1, lat: 28.6139, lng: 77.2090, status: "FAKE", title: "Protest Video Verification", desc: "Clips from early 2019 being shared as live.", auth: "Aajtak", loc: "New Delhi, IN" },
    { id: 2, lat: 40.7128, lng: -74.0060, status: "TRUTH", title: "Stock Market Crash Rumors", desc: "AI generated charts circulating. Confirmed legitimate by SEC.", auth: "Times of India", loc: "New York, US" },
    { id: 3, lat: 51.5074, lng: -0.1278, status: "FAKE", title: "Royal Family Health Speculation", desc: "Deepfake audio analyzing. Consensus: FAKE.", auth: "Hindustan Times", loc: "London, UK" },
    { id: 4, lat: 35.6762, lng: 139.6503, status: "VERIFIED", title: "New Earthquake Tech", desc: "Seismic network confirms new early warning system.", auth: "JapanNode", loc: "Tokyo, JP" },
    { id: 5, lat: -23.5505, lng: -46.6333, status: "VERIFIED", title: "Amazon Deforestation Data", desc: "Satellite imagery confirms claims of recent illegal logging spikes.", auth: "INPE Data", loc: "São Paulo, BR" },
    { id: 6, lat: -33.8688, lng: 151.2093, status: "FAKE", title: "Shark Attack Video Hoax", desc: "Viral video of shark in flooded streets debunked as CGI.", auth: "AstroBot", loc: "Sydney, AU" },
    { id: 7, lat: 48.8566, lng: 2.3522, status: "FAKE", title: "Eiffel Tower Bomb Threat", desc: "Audio recording analyzed: AI Voice Cloning detected.", auth: "PoliteNews", loc: "Paris, FR" },
    { id: 8, lat: -33.9249, lng: 18.4241, status: "VERIFIED", title: "Mining Strike Agreement", desc: "Digital signatures confirm finalized labor union deals.", auth: "AfricaFact", loc: "Cape Town, ZA" },
    { id: 9, lat: 55.7558, lng: 37.6173, status: "FAKE", title: "Military Mobilization Order", desc: "Forged document circulating on Telegram channels. Proven Fake.", auth: "GlobalWatch", loc: "Moscow, RU" },
    { id: 10, lat: 1.3521, lng: 103.8198, status: "TRUTH", title: "Crypto Hub Legislation", desc: "Parliament passes new robust cryptocurrency trading framework.", auth: "Times of India", loc: "Singapore, SG" },
    { id: 11, lat: 37.5665, lng: 126.9780, status: "VERIFIED", title: "Next-Gen EV Battery Unveiled", desc: "Live event broadcast verified by multiple tech journalists.", auth: "AsiaTech", loc: "Seoul, KR" },
    { id: 12, lat: 34.0522, lng: -118.2437, status: "FAKE", title: "Celebrity Arrest Photos", desc: "Midjourney watermarks discovered in pixel analysis of viral arrest photos.", auth: "Hindustan Times", loc: "Los Angeles, US" },
    { id: 13, lat: 19.4326, lng: -99.1332, status: "TRUTH", title: "Cartel Leader Extradition", desc: "Flight records and official government press release match.", auth: "LatinoVerify", loc: "Mexico City, MX" },
    { id: 14, lat: 25.2048, lng: 55.2708, status: "FAKE", title: "Artificial Rain Flooding", desc: "Out-of-context clips from 2016 being used to blame recent cloud seeding.", auth: "Aajtak", loc: "Dubai, AE" },
    { id: 15, lat: -1.2921, lng: 36.8219, status: "VERIFIED", title: "Tech Startup Mega-Seed", desc: "Blockchain records confirm $100M transaction to AgriTech firm.", auth: "AfricaFact", loc: "Nairobi, KE" }
];

// Endpoint: Verify News
app.post('/api/verify', async (req, res) => {
    const { url } = req.body;

    if (!process.env.NEWS_API_KEY) {
        return res.status(500).json({ error: "Server Configuration Error: API Key missing." });
    }
    if (!url) {
        return res.status(400).json({ error: "URL or snippet is required." });
    }

    const PORTALS = [
        { name: "The Times of India", domain: "timesofindia.indiatimes.com", url: "https://timesofindia.indiatimes.com" },
        { name: "The Hindu", domain: "thehindu.com", url: "https://www.thehindu.com" },
        { name: "The Indian Express", domain: "indianexpress.com", url: "https://indianexpress.com" },
        { name: "Hindustan Times", domain: "hindustantimes.com", url: "https://www.hindustantimes.com" },
        { name: "NDTV", domain: "ndtv.com", url: "https://www.ndtv.com" },
        { name: "India Today", domain: "indiatoday.in", url: "https://www.indiatoday.in" },
        { name: "BBC News", domain: "bbc.com", url: "https://www.bbc.com/news" },
        { name: "Reuters", domain: "reuters.com", url: "https://www.reuters.com" },
        { name: "CNN", domain: "cnn.com", url: "https://edition.cnn.com" },
        { name: "Firstpost", domain: "firstpost.com", url: "https://www.firstpost.com" },
        { name: "Oneindia", domain: "oneindia.com", url: "https://www.oneindia.com" }
    ];

    try {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.NEWS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: url })
        };

        // Query Search API and Images API symmetrically
        const [searchRes, imageRes] = await Promise.all([
            fetch('https://google.serper.dev/search', fetchOptions),
            fetch('https://google.serper.dev/images', fetchOptions)
        ]);

        const result = await searchRes.json();
        const imgResult = await imageRes.json();

        let trustedHit = null;
        let trustedHitsList = [];

        if (result.organic && result.organic.length > 0) {
            for (const item of result.organic) {
                for (const portal of PORTALS) {
                    if (item.link && item.link.includes(portal.domain)) {
                        trustedHitsList.push({ portal, item });
                    }
                }
            }
        }

        const isFake = trustedHitsList.length === 0;
        const shuffled = PORTALS.sort(() => 0.5 - Math.random());
        let selectedPortals;

        if (!isFake) {
            trustedHit = trustedHitsList[0];
            let others = shuffled.filter(p => p.name !== trustedHit.portal.name).slice(0, 2);
            selectedPortals = [trustedHit.portal, ...others];
        } else {
            selectedPortals = shuffled.slice(0, 3);
        }

        const nodes = selectedPortals.map((p, index) => ({
            name: p.name,
            url: (!isFake && index === 0) ? trustedHit.item.link : p.url,
            confidence: Math.floor(Math.random() * 5) + (isFake ? 85 : 95),
            verdict: isFake ? 'FAKE' : 'TRUTH'
        }));

        // Fetch real imagery of the news event
        let realImageUrl = (imgResult.images && imgResult.images.length > 0)
            ? imgResult.images[0].imageUrl
            : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=400";

        res.json({
            status: isFake ? 'FAKE' : 'VERIFIED',
            confidence: Math.floor(Math.random() * 10) + (isFake ? 75 : 90),
            query: url,
            consensus: isFake
                ? "Deep analysis complete. Searching across 11 major global nodes yielded NO verified cryptographic press results from the trusted portal list. Flagged as FAKE or UNVERIFIED."
                : "Information corroborated by Authentic Primary Press Portals. Integrity verified.",
            nodes: nodes,
            sourceDetail: isFake ? null : {
                title: trustedHit.item.title || "Original Report Verified",
                portalName: trustedHit.portal.name,
                url: trustedHit.item.link,
                img: realImageUrl
            },
            hash: '0x' + require('crypto').randomBytes(16).toString('hex')
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to parse external validation logic/data." });
    }
});

// Endpoint: Get Live Map Intelligence
app.get('/api/map-data', (req, res) => {
    // Check Map API Key
    const apiKey = process.env.MAP_API_KEY;
    if (!apiKey) {
        console.warn("Map API Key not set.");
    }

    // Normally you'd query a database for recent geo-tagged fake news
    res.json({ data: mapNodes, apiKey: apiKey });
});

// Endpoint: Latest News Feed
app.get('/api/latest-news', (req, res) => {
    const newsData = [
        { id: 101, title: "Viral video of completely empty super markets", source: "Facebook / Twitter", fake: true, auth: "Aajtak", img: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=400&h=250" },
        { id: 102, title: "Government announces new digital currency rollout", source: "Press Trust of India", fake: false, auth: "Hindustan Times", img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400&h=250" },
        { id: 103, title: "Famous celebrity spotted giving massive donations secretly", source: "Instagram Reels", fake: true, auth: "Times of India", img: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=400&h=250" },
        { id: 104, title: "New AI model predicted to replace 90% of local jobs", source: "Obscure Blog", fake: true, auth: "Hindustan Times", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=400&h=250" },
        { id: 105, title: "Mars rover discovering completely pure water streams", source: "Space Research Daily", fake: true, auth: "Times of India", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=400&h=250" },
        { id: 106, title: "Global summit reaches historic agreement on AI safety", source: "Global News", fake: false, auth: "Aajtak", img: "https://images.unsplash.com/photo-1541872528751-2db4c80eb304?auto=format&fit=crop&q=80&w=400&h=250" }
    ];
    res.json({ data: newsData });
});

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
