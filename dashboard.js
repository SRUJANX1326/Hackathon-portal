document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = checkAuth();

    if (currentUser) {
        displayUserInfo(currentUser);
        loadDashboardData(currentUser);
    }

    // Tab navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

function displayUserInfo(user) {
    const userName = document.getElementById('userName') || document.getElementById('coordName');
    if (userName) {
        userName.textContent = `Welcome, ${user.data.name}`;
    }
}

function loadDashboardData(user) {
    if (user.type === 'student') {
        loadStudentDashboard();
    } else {
        loadCoordinatorDashboard();
    }
}

function loadStudentDashboard() {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Update stats
    document.getElementById('totalHackathons').textContent = hackathons.length;

    const myRegs = registrations.filter(r => r.leaderSRN === currentUser.data.srn);
    document.getElementById('myRegistrations').textContent = myRegs.length;

    // Load hackathons list
    loadHackathonsList(hackathons);

    // Load my registrations
    loadMyRegistrations(myRegs);

    // Load notifications
    loadNotifications();
}

function loadCoordinatorDashboard() {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    // Update stats
    document.getElementById('totalHackathonsCount').textContent = hackathons.length;
    document.getElementById('totalRegistrationsCount').textContent = registrations.length;

    const activeHackathons = hackathons.filter(h => new Date(h.date) >= new Date());
    document.getElementById('activeHackathonsCount').textContent = activeHackathons.length;

    const totalParticipants = registrations.reduce((sum, r) => sum + parseInt(r.numMembers), 0);
    document.getElementById('totalParticipantsCount').textContent = totalParticipants;

    // Load manage hackathons
    loadManageHackathons(hackathons);

    // Load all registrations
    loadAllRegistrations(registrations, hackathons);

    // Add hackathon form handler
    const addHackathonForm = document.getElementById('addHackathonForm');
    if (addHackathonForm) {
        addHackathonForm.addEventListener('submit', handleAddHackathon);
    }
}

function loadHackathonsList(hackathons) {
    const hackathonsList = document.getElementById('hackathonsList');
    if (!hackathonsList) return;

    hackathonsList.innerHTML = '';

    hackathons.forEach(hackathon => {
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
            <a href="hackathon-registration.html?id=${hackathon.id}" class="btn btn-primary">Register Now</a>
        `;

        hackathonsList.appendChild(card);
    });
}

function loadMyRegistrations(registrations) {
    const registrationsList = document.getElementById('registrationsList');
    if (!registrationsList) return;

    registrationsList.innerHTML = '';

    if (registrations.length === 0) {
        registrationsList.innerHTML = '<p>You have not registered for any hackathons yet.</p>';
        return;
    }

    registrations.forEach(reg => {
        const card = document.createElement('div');
        card.className = 'registration-card';

        card.innerHTML = `
            <h3>${reg.hackathonName}</h3>
            <div class="registration-details">
                <div class="detail-item">
                    <strong>Team Name</strong>
                    ${reg.teamName}
                </div>
                <div class="detail-item">
                    <strong>Members</strong>
                    ${reg.numMembers}
                </div>
                <div class="detail-item">
                    <strong>Amount Paid</strong>
                    ₹${reg.amountPaid}
                </div>
                <div class="detail-item">
                    <strong>Transaction ID</strong>
                    ${reg.transactionId}
                </div>
            </div>
        `;

        registrationsList.appendChild(card);
    });
}

function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;

    const notifications = [{
            title: 'Registration Confirmed',
            message: 'Your registration for Innovation Challenge 2025 has been confirmed.',
            time: '2 hours ago',
            unread: true
        },
        {
            title: 'New Hackathon Added',
            message: 'A new hackathon "AI & ML Challenge" has been added. Register now!',
            time: '1 day ago',
            unread: true
        },
        {
            title: 'Payment Successful',
            message: 'Your payment of ₹500 has been processed successfully.',
            time: '2 days ago',
            unread: false
        }
    ];

    notificationsList.innerHTML = '';

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.unread ? 'unread' : ''}`;

        item.innerHTML = `
            <h4>${notif.title}</h4>
            <p>${notif.message}</p>
            <div class="time">${notif.time}</div>
        `;

        notificationsList.appendChild(item);
    });
}

function loadManageHackathons(hackathons) {
    const manageList = document.getElementById('manageHackathonsList');
    if (!manageList) return;

    manageList.innerHTML = '';

    hackathons.forEach(hackathon => {
        const item = document.createElement('div');
        item.className = 'manage-item';

        const date = new Date(hackathon.date);
        const formattedDate = date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        item.innerHTML = `
            <div class="manage-item-info">
                <h3>${hackathon.name}</h3>
                <p>Date: ${formattedDate} | Fee: ₹${hackathon.price}</p>
            </div>
            <div class="manage-item-actions">
                <button class="btn btn-edit" onclick="editHackathon(${hackathon.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteHackathon(${hackathon.id})">Delete</button>
            </div>
        `;

        manageList.appendChild(item);
    });
}

function loadAllRegistrations(registrations, hackathons) {
    const registrationsTable = document.getElementById('allRegistrationsList');
    if (!registrationsTable) return;

    registrationsTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Hackathon</th>
                    <th>Team Name</th>
                    <th>Leader</th>
                    <th>Members</th>
                    <th>Amount</th>
                    <th>Transaction ID</th>
                </tr>
            </thead>
            <tbody id="registrationsTableBody">
            </tbody>
        </table>
    `;

    const tbody = document.getElementById('registrationsTableBody');

    registrations.forEach(reg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reg.hackathonName}</td>
            <td>${reg.teamName}</td>
            <td>${reg.leaderName}</td>
            <td>${reg.numMembers}</td>
            <td>₹${reg.amountPaid}</td>
            <td>${reg.transactionId}</td>
        `;
        tbody.appendChild(row);
    });
}

function switchTab(tabName) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to clicked nav item
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function handleAddHackathon(e) {
    e.preventDefault();

    const hackathon = {
        id: Date.now(),
        name: document.getElementById('hackathonName').value,
        price: parseInt(document.getElementById('hackathonPrice').value),
        date: document.getElementById('hackathonDate').value,
        time: document.getElementById('hackathonTime').value,
        minMembers: parseInt(document.getElementById('minMembers').value),
        maxMembers: parseInt(document.getElementById('maxMembers').value),
        description: document.getElementById('hackathonDescription').value,
        requiresVerification: document.getElementById('requiresVerification').checked
    };

    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    hackathons.push(hackathon);
    localStorage.setItem('hackathons', JSON.stringify(hackathons));

    alert('Hackathon added successfully!');
    e.target.reset();

    // Reload dashboard
    location.reload();
}

function editHackathon(id) {
    alert('Edit functionality - Coming soon!');
}

function deleteHackathon(id) {
    if (confirm('Are you sure you want to delete this hackathon?')) {
        const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
        const updated = hackathons.filter(h => h.id !== id);
        localStorage.setItem('hackathons', JSON.stringify(updated));
        location.reload();
    }
}