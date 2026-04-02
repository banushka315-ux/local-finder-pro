let lat, lon;
let map;

// 📍 Get Location
function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        map = L.map('map').setView([lat, lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            .addTo(map);

        L.marker([lat, lon])
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();
    });
}

// 📏 Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;

    let a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
}

// 🔍 Search Places
function searchPlaces(typeValue) {

    let type = typeValue || document.getElementById("type").value;

    let query = `
        [out:json];
        node["amenity"="${type}"](around:2000, ${lat}, ${lon});
        out;
    `;

    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    })
    .then(res => res.json())
    .then(data => {

        document.getElementById("results").innerHTML = "";

        data.elements.forEach(place => {

            let name = place.tags.name || "Unnamed";

            let dist = getDistance(lat, lon, place.lat, place.lon);

            // Map Marker
            L.marker([place.lat, place.lon])
                .addTo(map)
                .bindPopup(name + " (" + dist + " km)");

            // Card UI
            let card = `
                <div class="card">
                    <h3>${name}</h3>
                    <p>Distance: ${dist} km</p>
                </div>
            `;

            document.getElementById("results").innerHTML += card;
        });
    });
}

// 🚨 Emergency (Auto hospital search)
function emergency() {
    searchPlaces("hospital");
}

// 🎤 Voice Search
function startVoice() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    recognition.onresult = function(event) {
        let speech = event.results[0][0].transcript.toLowerCase();

        if (speech.includes("hospital")) searchPlaces("hospital");
        else if (speech.includes("restaurant")) searchPlaces("restaurant");
        else if (speech.includes("atm")) searchPlaces("atm");
        else alert("Try saying hospital, restaurant, or ATM");
    };

    recognition.start();
}