// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHackathons();
});

// Sample hackathons data (In production, fetch from backend)
const sampleHackathons = [{
        id: 1,
        name: "Innovation Challenge 2025",
        date: "2025-12-15",
        time: "09:00",
        price: 500,
        description: "Transform ideas into reality through innovative solutions for real-world problems.",
        minMembers: 2,
        maxMembers: 4,
        requiresVerification: true
    },
    {
        id: 2,
        name: "AI & ML Hackathon",
        date: "2025-12-20",
        time: "10:00",
        price: 750,
        description: "Build intelligent solutions using artificial intelligence and machine learning.",
        minMembers: 1,
        maxMembers: 3,
        requiresVerification: false
    },
    {
        id: 3,
        name: "Web Development Marathon",
        date: "2025-12-25",
        time: "08:00",
        price: 600,
        description: "Create stunning web applications using modern frameworks and technologies.",
        minMembers: 2,
        maxMembers: 5,
        requiresVerification: true
    }
];

// Load hackathons on homepage
function loadHackathons() {
    const hackathonList = document.getElementById('hackathonList');
    if (!hackathonList) return;

    // Get hackathons from localStorage or use sample data
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || sampleHackathons;

    if (hackathons.length === 0) {
        hackathonList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No hackathons available at the moment.</p>';
        return;
    }

    hackathonList.innerHTML = '';
    hackathons.forEach(hackathon => {
        const card = createHackathonCard(hackathon);
        hackathonList.appendChild(card);
    });
}

// Create hackathon card
function createHackathonCard(hackathon) {
    const card = document.createElement('div');
    card.className = 'hackathon-card';

    const date = new Date(hackathon.date);
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <h3>${hackathon.name}</h3>
        <div class="date">📅 ${formattedDate} at ${hackathon.time}</div>
        <div class="price">₹${hackathon.price}</div>
        <p class="description">${hackathon.description}</p>
        <p class="team-size">Team Size: ${hackathon.minMembers}-${hackathon.maxMembers} members</p>
        <a href="login.html" class="btn btn-primary">Register Now</a>
    `;

    return card;
}

// Initialize sample data in localStorage
function initializeSampleData() {
    if (!localStorage.getItem('hackathons')) {
        localStorage.setItem('hackathons', JSON.stringify(sampleHackathons));
    }
}

// Call initialization
initializeSampleData();