// Coordinator Dashboard Management

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkAuth();

    if (!currentUser || currentUser.type !== 'coordinator') {
        alert('Access denied! Coordinator login required.');
        window.location.href = 'login.html';
        return;
    }

    displayCoordinatorInfo(currentUser);
    loadCoordinatorDashboard();
    setupTabNavigation();
    setupAddHackathonForm();
});

function displayCoordinatorInfo(user) {
    const coordName = document.getElementById('coordName');
    if (coordName) {
        coordName.textContent = `Welcome, ${user.data.name}`;
    }
}

function loadCoordinatorDashboard() {
    updateOverviewStats();
    loadManageHackathons();
    loadAllRegistrations();
    loadLiveStats();
    loadCoordinatorTickets();
    loadCoordinatorSponsors();
}

function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) activeTab.classList.add('active');

    if (tabName === 'manage') {
        loadManageHackathons();
    } else if (tabName === 'registrations') {
        loadAllRegistrations();
    } else if (tabName === 'livestats') {
        loadLiveStats();
    } else if (tabName === 'tickets') {
        loadCoordinatorTickets();
    } else if (tabName === 'sponsors') {
        loadCoordinatorSponsors();
    }
}

// ============= OVERVIEW STATS =============
function updateOverviewStats() {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    const now = new Date();
    const activeHackathons = hackathons.filter(h => new Date(h.date) >= now);
    const totalParticipants = registrations.reduce((sum, r) => sum + (r.numMembers || 0), 0);

    document.getElementById('totalHackathonsCount').textContent = hackathons.length;
    document.getElementById('totalRegistrationsCount').textContent = registrations.length;
    document.getElementById('activeHackathonsCount').textContent = activeHackathons.length;
    document.getElementById('totalParticipantsCount').textContent = totalParticipants;

    loadRecentActivity();
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;

    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const recentRegs = registrations.slice(-5).reverse();

    if (recentRegs.length === 0) {
        activityList.innerHTML = '<p style="color: #6b7280; padding: 20px;">No recent activity</p>';
        return;
    }

    activityList.innerHTML = recentRegs.map(reg => `
        <div class="activity-item">
            <div class="activity-icon">✅</div>
            <div class="activity-content">
                <p><strong>${reg.teamName}</strong> registered for <strong>${reg.hackathonName}</strong></p>
                <small>${reg.transactionDate || 'Recently'}</small>
            </div>
        </div>
    `).join('');
}

// ============= ADD HACKATHON =============
function setupAddHackathonForm() {
    const form = document.getElementById('addHackathonForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('hackathonName').value.trim();
        const price = document.getElementById('hackathonPrice').value;
        const date = document.getElementById('hackathonDate').value;
        const time = document.getElementById('hackathonTime').value;
        const minMembers = document.getElementById('minMembers').value;
        const maxMembers = document.getElementById('maxMembers').value;
        const description = document.getElementById('hackathonDescription').value.trim();
        const venue = document.getElementById('hackathonVenue').value.trim();
        const requiresVerification = document.getElementById('requiresVerification').checked;

        if (parseInt(minMembers) > parseInt(maxMembers)) {
            showMessage('error', 'Minimum members cannot be greater than maximum members!');
            return;
        }

        const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];

        const newHackathon = {
            id: Date.now(),
            name: name,
            price: parseInt(price),
            date: date,
            time: time,
            minMembers: parseInt(minMembers),
            maxMembers: parseInt(maxMembers),
            description: description,
            venue: venue,
            requiresVerification: requiresVerification,
            createdAt: new Date().toISOString(),
            createdBy: JSON.parse(localStorage.getItem('currentUser')).data.name
        };

        hackathons.push(newHackathon);
        localStorage.setItem('hackathons', JSON.stringify(hackathons));

        showMessage('success', `✓ Hackathon "${name}" created successfully!`);
        form.reset();

        updateOverviewStats();
    });
}

function showMessage(type, message) {
    const messageBox = document.getElementById('addHackathonMessage');
    if (!messageBox) return;

    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// ============= MANAGE HACKATHONS =============
function loadManageHackathons() {
    const manageList = document.getElementById('manageHackathonsList');
    if (!manageList) return;

    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    if (hackathons.length === 0) {
        manageList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Hackathons Created</h3>
                <p>Create your first hackathon to get started!</p>
            </div>
        `;
        return;
    }

    manageList.innerHTML = '';

    hackathons.sort((a, b) => new Date(b.date) - new Date(a.date));

    hackathons.forEach(hackathon => {
        const card = document.createElement('div');
        card.className = 'manage-card';

        const eventDate = new Date(hackathon.date);
        const now = new Date();
        const isPast = eventDate < now;

        const hackathonRegs = registrations.filter(r => r.hackathonId === hackathon.id);
        const totalParticipants = hackathonRegs.reduce((sum, r) => sum + (r.numMembers || 0), 0);

        card.innerHTML = `
            <div class="manage-header">
                <h3>${hackathon.name}</h3>
                <span class="status-badge ${isPast ? 'past' : 'upcoming'}">
                    ${isPast ? 'Completed' : 'Upcoming'}
                </span>
            </div>
            <div class="manage-details">
                <p><strong>📅 Date:</strong> ${eventDate.toLocaleDateString('en-IN')} at ${hackathon.time}</p>
                <p><strong>📍 Venue:</strong> ${hackathon.venue || 'Not specified'}</p>
                <p><strong>💰 Fee:</strong> ₹${hackathon.price}</p>
                <p><strong>👥 Team Size:</strong> ${hackathon.minMembers}-${hackathon.maxMembers} members</p>
                <p><strong>✅ Registrations:</strong> ${hackathonRegs.length} teams (${totalParticipants} participants)</p>
            </div>
            <div class="manage-actions">
                <button onclick="viewHackathonDetails(${hackathon.id})" class="btn btn-secondary btn-small">
                    👁️ View
                </button>
                <button onclick="editHackathon(${hackathon.id})" class="btn btn-primary btn-small">
                    ✏️ Edit
                </button>
                <button onclick="deleteHackathon(${hackathon.id})" class="btn btn-danger btn-small">
                    🗑️ Delete
                </button>
            </div>
        `;

        manageList.appendChild(card);
    });
}

function viewHackathonDetails(hackathonId) {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const hackathon = hackathons.find(h => h.id === hackathonId);

    if (!hackathon) {
        alert('Hackathon not found!');
        return;
    }

    const modal = document.getElementById('viewHackathonModal');
    const content = document.getElementById('viewHackathonContent');

    const eventDate = new Date(hackathon.date);
    const now = new Date();
    const isPast = eventDate < now;
    const isToday = eventDate.toDateString() === now.toDateString();

    let status = 'upcoming';
    let statusText = 'Upcoming';
    if (isPast) {
        status = 'completed';
        statusText = 'Completed';
    } else if (isToday) {
        status = 'active';
        statusText = 'Today';
    }

    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const hackathonRegs = registrations.filter(r => r.hackathonId === hackathon.id);
    const totalParticipants = hackathonRegs.reduce((sum, r) => sum + (r.numMembers || 0), 0);
    const totalRevenue = hackathonRegs.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    content.innerHTML = `
        <div class="details-container">
            <div class="details-header">
                <h3>${hackathon.name}</h3>
                <p class="subtitle">Complete Hackathon Information</p>
                <span class="status-badge-large status-${status}">${statusText}</span>
            </div>
            
            <div class="details-section">
                <h4>📅 Event Information</h4>
                <div class="detail-row">
                    <span class="detail-label">📆 Date:</span>
                    <span class="detail-value highlight">${eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🕐 Time:</span>
                    <span class="detail-value highlight">${hackathon.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📍 Venue:</span>
                    <span class="detail-value">${hackathon.venue || 'Not specified'}</span>
                </div>
            </div>
            
            <div class="details-section">
                <h4>💰 Pricing & Team Size</h4>
                <div class="detail-row">
                    <span class="detail-label">💵 Registration Fee:</span>
                    <span class="detail-value price">₹${hackathon.price}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👥 Team Size:</span>
                    <span class="detail-value">${hackathon.minMembers} - ${hackathon.maxMembers} members</span>
                </div>
            </div>
            
            <div class="details-section">
                <h4>📝 Description</h4>
                <div class="description-box">${hackathon.description}</div>
            </div>
            
            <div class="details-section">
                <h4>📊 Registration Statistics</h4>
                <div class="detail-row">
                    <span class="detail-label">✅ Total Teams:</span>
                    <span class="detail-value highlight">${hackathonRegs.length}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👤 Total Participants:</span>
                    <span class="detail-value highlight">${totalParticipants}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💰 Total Revenue:</span>
                    <span class="detail-value price">₹${totalRevenue}</span>
                </div>
            </div>
            
            <div class="info-box">
                <span class="info-box-icon">ℹ️</span>
                <span class="info-box-text">
                    This hackathon was ${hackathon.requiresVerification ? 'set to require' : 'not set to require'} coordinator verification for registrations.
                </span>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeViewHackathonModal() {
    document.getElementById('viewHackathonModal').style.display = 'none';
}

function editHackathon(hackathonId) {
    alert('Edit functionality coming soon!');
}

function deleteHackathon(hackathonId) {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const hackathon = hackathons.find(h => h.id === hackathonId);

    if (!hackathon) {
        alert('Hackathon not found!');
        return;
    }

    if (confirm(`Are you sure you want to delete "${hackathon.name}"?\n\nThis action cannot be undone.`)) {
        const updatedHackathons = hackathons.filter(h => h.id !== hackathonId);
        localStorage.setItem('hackathons', JSON.stringify(updatedHackathons));

        loadManageHackathons();
        updateOverviewStats();

        if (typeof showToast === 'function') {
            showToast('✓ Hackathon deleted successfully!');
        } else {
            alert('✓ Hackathon deleted!');
        }
    }
}

function refreshManageList() {
    loadManageHackathons();
    if (typeof showToast === 'function') {
        showToast('✓ List refreshed!');
    }
}

// ============= ALL REGISTRATIONS =============
function loadAllRegistrations() {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrationsList = document.getElementById('allRegistrationsList');
    const filterSelect = document.getElementById('filterHackathon');

    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Hackathons</option>';
        hackathons.forEach(h => {
            filterSelect.innerHTML += `<option value="${h.id}">${h.name}</option>`;
        });
    }

    if (!registrationsList) return;

    if (registrations.length === 0) {
        registrationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Registrations Yet</h3>
                <p>No teams have registered for any hackathons yet.</p>
            </div>
        `;
        return;
    }

    const sortedRegs = [...registrations].sort((a, b) => {
        return (b.createdTimestamp || 0) - (a.createdTimestamp || 0);
    });

    registrationsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hackathon</th>
                        <th>Team Name</th>
                        <th>Leader Name</th>
                        <th>Leader SRN</th>
                        <th>Members</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRegs.map((reg, index) => {
                        const hackathon = hackathons.find(h => h.id === reg.hackathonId);
                        const eventDate = hackathon ? new Date(hackathon.date) : null;
                        const isPast = eventDate && eventDate < new Date();
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${reg.hackathonName}</strong></td>
                                <td>${reg.teamName}</td>
                                <td>${reg.leaderName}</td>
                                <td>${reg.leaderSRN}</td>
                                <td>
                                    <span class="badge-info">${reg.numMembers} ${reg.numMembers === 1 ? 'member' : 'members'}</span>
                                </td>
                                <td><strong style="color: #dc2626;">₹${reg.amountPaid}</strong></td>
                                <td><code style="font-size: 0.85rem;">${reg.transactionId}</code></td>
                                <td>${reg.transactionDate || 'N/A'}</td>
                                <td>
                                    <button onclick='viewRegistrationDetails("${reg.transactionId}")' class="btn btn-small btn-primary">
                                        👁️ View
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function viewRegistrationDetails(transactionId) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const reg = registrations.find(r => r.transactionId === transactionId);
    
    if (!reg) {
        alert('Registration not found!');
        return;
    }
    
    const modal = document.getElementById('viewRegistrationModal');
    const content = document.getElementById('viewRegistrationContent');
    
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const hackathon = hackathons.find(h => h.id === reg.hackathonId);
    const eventDate = hackathon ? new Date(hackathon.date) : null;
    const isPast = eventDate && eventDate < new Date();
    
    let teamMembersHTML = '';
    if (reg.members && reg.members.length > 0) {
        teamMembersHTML = `
            <div class="team-members-list">
                <div class="team-member-item">
                    <div class="member-number">1</div>
                    <div class="member-info">
                        <div class="member-name">${reg.leaderName} <span class="leader-badge">👑 LEADER</span></div>
                        <div class="member-details">📱 ${reg.leaderPhone} | 🆔 ${reg.leaderSRN}</div>
                    </div>
                </div>
                ${reg.members.map((member, index) => `
                    <div class="team-member-item">
                        <div class="member-number">${index + 2}</div>
                        <div class="member-info">
                            <div class="member-name">${member.name}</div>
                            <div class="member-details">📱 ${member.phone} | 🆔 ${member.srn}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        teamMembersHTML = `
            <div class="team-members-list">
                <div class="team-member-item">
                    <div class="member-number">1</div>
                    <div class="member-info">
                        <div class="member-name">${reg.leaderName} <span class="leader-badge">👑 LEADER</span></div>
                        <div class="member-details">📱 ${reg.leaderPhone} | 🆔 ${reg.leaderSRN}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="details-container">
            <div class="details-header">
                <h3>${reg.hackathonName}</h3>
                <p class="subtitle">Team Registration Details</p>
                <span class="status-badge-large ${isPast ? 'status-completed' : 'status-upcoming'}">
                    ${isPast ? '✓ Event Completed' : '⏳ Upcoming Event'}
                </span>
            </div>
            
            <div class="details-section">
                <h4>👥 Team Information</h4>
                <div class="detail-row">
                    <span class="detail-label">🏆 Team Name:</span>
                    <span class="detail-value highlight">${reg.teamName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👤 Team Leader:</span>
                    <span class="detail-value">${reg.leaderName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🆔 Leader SRN:</span>
                    <span class="detail-value">${reg.leaderSRN}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📱 Contact:</span>
                    <span class="detail-value">${reg.leaderPhone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👥 Total Members:</span>
                    <span class="detail-value highlight">${reg.numMembers} ${reg.numMembers === 1 ? 'member' : 'members'}</span>
                </div>
            </div>
            
            <div class="details-section">
                <h4>👨‍👩‍👧‍👦 Team Members</h4>
                ${teamMembersHTML}
            </div>
            
            <div class="details-section payment-details">
                <h4>💳 Payment Information</h4>
                <div class="detail-row">
                    <span class="detail-label">💰 Amount Paid:</span>
                    <span class="detail-value price">₹${reg.amountPaid}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Payment Date:</span>
                    <span class="detail-value">${reg.transactionDate || 'Not available'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">✅ Status:</span>
                    <span class="detail-value success">${reg.paymentStatus || 'Completed'}</span>
                </div>
                <div style="margin-top: 15px;">
                    <span class="detail-label" style="display: block; margin-bottom: 8px;">🔢 Transaction ID:</span>
                    <div class="transaction-id-box">${reg.transactionId}</div>
                </div>
            </div>
            
            <div class="info-box">
                <span class="info-box-icon">💡</span>
                <span class="info-box-text">
                    This registration was completed on ${reg.transactionDate || 'N/A'}. All payment details have been verified.
                </span>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeViewRegistrationModal() {
    document.getElementById('viewRegistrationModal').style.display = 'none';
}

function filterRegistrations() {
    const filterValue = document.getElementById('filterHackathon').value;
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrationsList = document.getElementById('allRegistrationsList');
    
    if (!registrationsList) return;
    
    let filteredRegs = registrations;
    
    if (filterValue !== 'all') {
        filteredRegs = registrations.filter(r => r.hackathonId === parseInt(filterValue));
    }
    
    if (filteredRegs.length === 0) {
        registrationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Registrations Found</h3>
                <p>No registrations match the selected filter.</p>
            </div>
        `;
        return;
    }
    
    const sortedRegs = [...filteredRegs].sort((a, b) => {
        return (b.createdTimestamp || 0) - (a.createdTimestamp || 0);
    });
    
    registrationsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hackathon</th>
                        <th>Team Name</th>
                        <th>Leader Name</th>
                        <th>Leader SRN</th>
                        <th>Members</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRegs.map((reg, index) => {
                        const hackathon = hackathons.find(h => h.id === reg.hackathonId);
                        const eventDate = hackathon ? new Date(hackathon.date) : null;
                        const isPast = eventDate && eventDate < new Date();
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${reg.hackathonName}</strong></td>
                                <td>${reg.teamName}</td>
                                <td>${reg.leaderName}</td>
                                <td>${reg.leaderSRN}</td>
                                <td>
                                    <span class="badge-info">${reg.numMembers} ${reg.numMembers === 1 ? 'member' : 'members'}</span>
                                </td>
                                <td><strong style="color: #dc2626;">₹${reg.amountPaid}</strong></td>
                                <td><code style="font-size: 0.85rem;">${reg.transactionId}</code></td>
                                <td>${reg.transactionDate || 'N/A'}</td>
                                <td>
                                    <button onclick='viewRegistrationDetails("${reg.transactionId}")' class="btn btn-small btn-primary">
                                        👁️ View
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function refreshRegistrations() {
    loadAllRegistrations();
    if (typeof showToast === 'function') {
        showToast('✓ Registrations refreshed!');
    }
}

function exportRegistrations() {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    
    if (registrations.length === 0) {
        alert('No registrations to export!');
        return;
    }
    
    let csv = 'Hackathon,Team Name,Leader Name,Leader SRN,Leader Phone,Members,Amount,Transaction ID,Date\n';
    
    registrations.forEach(reg => {
        csv += `"${reg.hackathonName}","${reg.teamName}","${reg.leaderName}","${reg.leaderSRN}","${reg.leaderPhone}",${reg.numMembers},${reg.amountPaid},"${reg.transactionId}","${reg.transactionDate}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('✓ CSV exported successfully!');
    }
}

// ============= LIVE STATS =============
function loadLiveStats() {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    
    const totalRevenue = registrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const totalParticipants = registrations.reduce((sum, r) => sum + (r.numMembers || 0), 0);
    const avgTeamSize = registrations.length > 0 ? (totalParticipants / registrations.length).toFixed(1) : 0;
    
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue}`;
    document.getElementById('avgTeamSize').textContent = avgTeamSize;
    
    const hackathonRegCounts = hackathons.map(h => ({
        name: h.name,
        count: registrations.filter(r => r.hackathonId === h.id).length
    })).sort((a, b) => b.count - a.count);
    
    const mostPopular = hackathonRegCounts[0];
    document.getElementById('mostPopular').textContent = mostPopular ? mostPopular.name : 'N/A';
    
    displayRegistrationsChart(hackathonRegCounts);
    displayTeamSizeChart(registrations);
}

function displayRegistrationsChart(data) {
    const chart = document.getElementById('registrationsChart');
    if (!chart || data.length === 0) return;
    
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    chart.innerHTML = data.map(item => `
        <div class="chart-bar">
            <div class="bar-label">${item.name}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${(item.count / maxCount) * 100}%">
                    ${item.count}
                </div>
            </div>
        </div>
    `).join('');
}

function displayTeamSizeChart(registrations) {
    const chart = document.getElementById('teamSizeChart');
    if (!chart) return;
    
    const sizeGroups = {};
    registrations.forEach(r => {
        const size = r.numMembers || 0;
        sizeGroups[size] = (sizeGroups[size] || 0) + 1;
    });
    
    const data = Object.keys(sizeGroups).map(size => ({
        size: `${size} member${size > 1 ? 's' : ''}`,
        count: sizeGroups[size]
    })).sort((a, b) => parseInt(a.size) - parseInt(b.size));
    
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    chart.innerHTML = data.map(item => `
        <div class="chart-bar">
            <div class="bar-label">${item.size}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${(item.count / maxCount) * 100}%; background: #10b981;">
                    ${item.count} teams
                </div>
            </div>
        </div>
    `).join('');
}

// ============= UTILITY =============
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const hackathonModal = document.getElementById('viewHackathonModal');
    const registrationModal = document.getElementById('viewRegistrationModal');
    
    if (event.target === hackathonModal) {
        closeViewHackathonModal();
    }
    if (event.target === registrationModal) {
        closeViewRegistrationModal();
    }
});

// Make functions global
window.viewHackathonDetails = viewHackathonDetails;
window.closeViewHackathonModal = closeViewHackathonModal;
window.viewRegistrationDetails = viewRegistrationDetails;
window.closeViewRegistrationModal = closeViewRegistrationModal;
window.editHackathon = editHackathon;
window.deleteHackathon = deleteHackathon;
window.refreshManageList = refreshManageList;
window.filterRegistrations = filterRegistrations;
window.refreshRegistrations = refreshRegistrations;
window.exportRegistrations = exportRegistrations;