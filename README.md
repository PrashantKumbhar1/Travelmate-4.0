# Travelmate 🚌

Travelmate is a web-based bus booking platform designed to provide a seamless experience for users to search, book, and track bus journeys. Built with HTML, CSS, JavaScript, and Firebase, this project includes user authentication, bus search with filters, seat selection, payment processing, and a dynamic UI with dark mode support.

## Features

- **User Authentication**: Sign up and log in with email and password, with user data stored in Firebase Firestore.
- **Bus Search**: Search for buses by specifying pickup location, drop location, and travel date.
- **Bus Listing**: Display available buses with details (e.g., type, timing, fare, amenities) fetched from Firestore.
- **Seat Selection**: Interactive seat selection interface with availability status (available, booked, selected, ladies-only).
- **Payment Gateway**: Simulate payment processing with options for card and UPI.
- **Booking Confirmation**: Display booking confirmation with a unique ID and auto-redirect to the homepage.
- **Real-Time Tracking**: Simulated live bus tracking with animations.
- **Dark Mode**: Toggle between light and dark themes for enhanced accessibility.
- **Responsive Design**: Optimized for desktop and mobile devices.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Firestore for database, Authentication for user management)
- **Libraries**:
  - Font Awesome for icons
  - Animate.css for animations
  - Leaflet.js for the map on the About Us page
- **Tools**: VS Code Live Server for local development

## Project Structure

Travelmate/
│
├── index.html          # Homepage with search, features, and tracking preview
├── Book.html           # Bus search form page
├── list_bus.html       # Bus listing page with filters
├── About Us.html       # About Us page with company details and map
├── confirmation.html   # Booking confirmation page
├── Login.html          # Login page
├── payment.html        # Payment gateway page
├── select_seat.html    # Seat selection page
├── signup.html         # Signup page
├── styles.css          # Stylesheet for the entire project
├── script.js           # JavaScript logic for Firebase integration and functionality
└── README.md           # Project documentation


## Setup Instructions

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox)
- [Node.js](https://nodejs.org/) (optional, for running a local server)
- [VS Code](https://code.visualstudio.com/) with the Live Server extension
- A Firebase project (set up Firestore and Authentication)

### Firebase Setup
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project named "Travelmate".
   - Enable Firestore and Authentication (Email/Password provider).

2. **Configure Firestore**:
   - Create two collections:
     - `users`: For storing user data (name, email, mobile, createdAt).
     - `bus`: For storing bus data (e.g., name, from, to, departure, arrival, fare, seats, type, amenities).
   - Example `bus` document:
     ```json
     {
       "name": "Express Bus 101",
       "from": "mumbai",
       "to": "pune",
       "departure": "14:00",
       "arrival": "18:00",
       "fare": 500,
       "seats": 30,
       "type": ["ac", "sleeper"],
       "amenities": ["wifi", "charging"]
     }
