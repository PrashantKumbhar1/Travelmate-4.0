// Firebase Initialization
const firebaseConfig = {
    apiKey: "AIzaSyCqsthTY1CAikVYNq69SYWWWEQD_GKNm6E",
    authDomain: "travelmate-95235.firebaseapp.com",
    databaseURL: "https://travelmate-95235-default-rtdb.firebaseio.com",
    projectId: "travelmate-95235",
    storageBucket: "travelmate-95235.firebasestorage.app",
    messagingSenderId: "231528120298",
    appId: "1:231528120298:web:9e01d37179a07aa5033c93",
    measurementId: "G-E1ZCNKK9VV"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// User Authentication
let currentUser = null;

// Form Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
    return /^\d{10}$/.test(mobile);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Password Strength
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength');
    if (!strengthBar) return;
    
    const strength = password.length > 10 ? 100 : password.length * 10;
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.background = strength > 70 ? '#2ecc71' : strength > 40 ? '#f1c40f' : '#e74c3c';
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify({ email: user.email, uid: user.uid }));
    } else {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
});

// UI Functions (Merged showToast)
function showToast(message, isSuccess) {
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? '' : 'error'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Auth Functions
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            localStorage.setItem('currentUser', JSON.stringify({ email: currentUser.email, uid: currentUser.uid }));
            showToast('Login successful! Redirecting...', true);
            setTimeout(() => window.location.href = 'index.html', 1500);
        })
        .catch((error) => {
            console.error('Login error:', error);
            showToast(`Login failed: ${error.message}`, false);
        });
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const mobile = document.getElementById('signup-mobile').value;
    const password = document.getElementById('signup-password').value;

    console.log('Signup clicked with:', { name, email, mobile, password });

    if (!validateEmail(email)) {
        showToast('Please enter a valid email!', false);
        return;
    }
    if (!validateMobile(mobile)) {
        showToast('Mobile number must be 10 digits!', false);
        return;
    }
    if (!validatePassword(password)) {
        showToast('Password must be at least 8 characters!', false);
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created:', user.uid);
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                mobile: mobile,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            console.log('User data saved to Firestore');
            currentUser = auth.currentUser;
            localStorage.setItem('currentUser', JSON.stringify({ email: currentUser.email, uid: currentUser.uid }));
            showToast('Account created successfully! Redirecting...', true);
            setTimeout(() => window.location.href = 'login.html', 1500);
        })
        .catch((error) => {
            console.error('Signup error:', error.code, error.message);
            showToast(`Signup failed: ${error.message}`, false);
        });
}

// Bus Listing Functions
async function renderBuses() {
    const busContainer = document.getElementById('buses');
    const searchData = JSON.parse(localStorage.getItem('searchData'));

    const querySnapshot = await db.collection('bus')
        .where('from', '==', searchData.from)
        .where('to', '==', searchData.to)
        .get();

    const buses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    busContainer.innerHTML = buses.map(bus => `
        <div class="bus-card">
            <div class="bus-info">
                <h3>${bus.name}</h3>
                <p class="bus-type">${bus.type.join(' · ')}</p>
                <div class="amenities">
                    ${bus.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                </div>
            </div>
            <div class="bus-timing">
                <p><i class="fas fa-clock"></i> ${bus.departure}</p>
                <p><i class="fas fa-arrow-right"></i> ${bus.arrival}</p>
                <p class="duration">${calculateDuration(bus.departure, bus.arrival)}</p>
            </div>
            <div class="bus-action">
                <p class="fare">₹${bus.fare}</p>
                <p class="seats">${bus.seats} Seats Left</p>
                <button onclick="selectBus('${bus.id}')">Select Seats</button>
            </div>
        </div>
    `).join('');
}

function calculateDuration(start, end) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let hours = endH - startH;
    let mins = endM - startM;
    if (mins < 0) { hours--; mins += 60; }
    return `${hours}h ${mins}m`;
}

function selectBus(busId) {
    db.collection('bus').doc(busId).get()
        .then((doc) => {
            if (doc.exists) {
                localStorage.setItem('selectedBus', JSON.stringify({ id: doc.id, ...doc.data() }));
                window.location.href = 'select_seat.html';
            }
        });
}

// Seat Selection Functions
function generateSeatLayout(bus) {
    const seatRows = document.getElementById('seat-rows');
    seatRows.innerHTML = '';
    const isSleeper = bus.type.includes('sleeper');
    const totalSeats = isSleeper ? 36 : 40;
    const rows = isSleeper ? 12 : 10;
    let seatCounter = 1;

    for (let i = 0; i < rows; i++) {
        const row = document.createElement('div');
        row.className = 'seat-row';

        const leftGroup = document.createElement('div');
        leftGroup.className = 'seat-group left-group';
        for (let j = 0; j < 2; j++) {
            if (seatCounter <= totalSeats) {
                const seat = createSeat(seatCounter++, bus.fare);
                leftGroup.appendChild(seat);
            }
        }
        row.appendChild(leftGroup);

        const passage = document.createElement('div');
        passage.className = 'passage';
        row.appendChild(passage);

        const rightGroup = document.createElement('div');
        rightGroup.className = 'seat-group right-group';
        const rightSeats = isSleeper ? 1 : 2;
        for (let j = 0; j < rightSeats; j++) {
            if (seatCounter <= totalSeats) {
                const seat = createSeat(seatCounter++, bus.fare);
                rightGroup.appendChild(seat);
            }
        }
        row.appendChild(rightGroup);

        seatRows.appendChild(row);
    }
}

function createSeat(seatNumber, baseFare) {
    const seat = document.createElement('div');
    seat.className = `seat ${Math.random() < 0.3 ? 'unavailable' : 'available'}`;
    seat.textContent = seatNumber;
    seat.dataset.price = baseFare;
    if (!seat.classList.contains('unavailable')) {
        seat.addEventListener('click', () => toggleSeatSelection(seat, seatNumber));
    }
    return seat;
}

let selectedSeats = [];
let totalFare = 0;

function toggleSeatSelection(seat, seatNumber) {
    if (seat.classList.contains('selected')) {
        seat.classList.remove('selected');
        selectedSeats = selectedSeats.filter(num => num !== seatNumber);
        totalFare -= parseInt(seat.dataset.price);
    } else {
        seat.classList.add('selected');
        selectedSeats.push(seatNumber);
        totalFare += parseInt(seat.dataset.price);
    }
    updateSummary();
}

function updateSummary() {
    document.getElementById('selected-seats').textContent = selectedSeats.join(', ') || 'None';
    document.getElementById('total-price').textContent = totalFare;
}

document.getElementById('proceed-to-payment')?.addEventListener('click', async () => {
    if (selectedSeats.length > 0) {
        const bookingData = {
            userId: currentUser ? currentUser.uid : 'guest',
            busId: JSON.parse(localStorage.getItem('selectedBus')).id,
            seats: selectedSeats,
            totalFare: totalFare,
            bookingDate: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('bookings').add(bookingData);
        localStorage.setItem('bookingId', docRef.id);
        localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        localStorage.setItem('totalFare', JSON.stringify(totalFare));
        showToast('Booking saved! Proceeding to payment...', true);
        setTimeout(() => window.location.href = 'payment.html', 1500);
    } else {
        showToast('Please select at least one seat!', false);
    }
});

document.getElementById('apply-filters')?.addEventListener('click', () => {
    renderBuses(); // Add filter logic if needed
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        console.log('Signup button found, attaching listener');
        signupBtn.addEventListener('click', signup);
    } else {
        console.error('Signup button not found');
    }

    document.getElementById('signup-password')?.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    if (document.getElementById('seat-rows')) {
        const selectedBus = JSON.parse(localStorage.getItem('selectedBus'));
        generateSeatLayout(selectedBus);
    }

    if (document.getElementById('buses')) {
        renderBuses();
    }

    const searchInput = document.getElementById('destination-input');
    const searchBtn = document.getElementById('search-btn');
    const suggestionBox = document.getElementById('suggestions');
    const popularDestinations = [
        'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Banglore',
        'Goa', 'Nagpur', 'Jaipur', 'Kolhapur', 'Thane'
    ];

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            suggestionBox.innerHTML = '';
            if (value) {
                const filtered = popularDestinations.filter(dest => 
                    dest.toLowerCase().includes(value)
                );
                filtered.forEach(dest => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = dest;
                    item.addEventListener('click', () => {
                        searchInput.value = dest;
                        suggestionBox.classList.add('hidden');
                    });
                    suggestionBox.appendChild(item);
                });
                suggestionBox.classList.remove('hidden');
            } else {
                suggestionBox.classList.add('hidden');
            }
        });

        searchBtn.addEventListener('click', () => {
            if (searchInput.value) {
                showToast(`Searching buses to ${searchInput.value}...`, true);
                setTimeout(() => window.location.href = 'Book.html', 1000);
            } else {
                showToast('Please enter a destination!', false);
            }
        });
    }

    const busMarker = document.querySelector('.bus-marker');
    if (busMarker) {
        let position = 20;
        setInterval(() => {
            position = (position + 1) % 80;
            busMarker.style.left = `${position}%`;
        }, 100);
    }

    // Updated Dark Mode Toggle with Emoji Switch
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Switch emoji based on mode
            if (document.body.classList.contains('dark-mode')) {
                darkModeToggle.textContent = '🌙'; // Moon for dark mode
            } else {
                darkModeToggle.textContent = '☀️'; // Sun for light mode
            }
        });
    }
});

