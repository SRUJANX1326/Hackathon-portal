// Student Dashboard Management

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkAuth();

    if (!currentUser || currentUser.type !== 'student') {
        alert('Access denied! Student login required.');
        window.location.href = 'login.html';
        return;
    }

    displayStudentInfo(currentUser);
    loadStudentDashboard();
    setupTabNavigation();
});

function displayStudentInfo(user) {
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `Welcome, ${user.data.name}`;
    }
}

function loadStudentDashboard() {
    updateStudentStats();
    loadHackathonsList();
    loadMyRegistrations();
    loadNotifications();
    loadSponsors();
    setupSocialMedia();
    loadStudentTickets();
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

    if (tabName === 'notifications') {
        markNotificationsAsRead();
    }

    if (tabName === 'myregistrations') {
        updateStudentStats();
        loadMyRegistrations();
    } else if (tabName === 'hackathons') {
        loadHackathonsList();
    } else if (tabName === 'notifications') {
        markNotificationsAsRead();
        loadNotifications();
    } else if (tabName === 'tickets') {
        loadStudentTickets();
    } else if (tabName === 'sponsors') {
        loadSponsors();
    }
}

function updateStudentStats() {
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const now = new Date();
    const upcomingHackathons = hackathons.filter(h => new Date(h.date) >= now);
    const totalHackathonsEl = document.getElementById('totalHackathons');
    if (totalHackathonsEl) {
        totalHackathonsEl.textContent = upcomingHackathons.length;
    }

    const myRegs = registrations.filter(r => {
        return r.leaderSRN === currentUser.data.srn;
    });

    const myRegistrationsEl = document.getElementById('myRegistrations');
    if (myRegistrationsEl) {
        myRegistrationsEl.textContent = myRegs.length;
    }
}

function loadHackathonsList() {
    const hackathonsList = document.getElementById('hackathonsList');
    if (!hackathonsList) return;

    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (hackathons.length === 0) {
        hackathonsList.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-light); padding: 40px;">No hackathons available at the moment. Check back soon!</p>';
        return;
    }

    hackathonsList.innerHTML = '';

    const now = new Date();
    const upcomingHackathons = hackathons.filter(h => new Date(h.date) >= now);

    if (upcomingHackathons.length === 0) {
        hackathonsList.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-light); padding: 40px;">No upcoming hackathons available.</p>';
        return;
    }

    upcomingHackathons.forEach(hackathon => {
                const card = document.createElement('div');
                card.className = 'hackathon-card';

                const date = new Date(hackathon.date);
                const formattedDate = date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const isRegistered = registrations.some(r =>
                    r.hackathonId === hackathon.id && r.leaderSRN === currentUser.data.srn
                );

                const regCount = registrations.filter(r => r.hackathonId === hackathon.id).length;

                card.innerHTML = `
            <div class="hackathon-badge ${isRegistered ? 'registered' : 'open'}">
                ${isRegistered ? '✓ Registered' : '🔓 Open'}
            </div>
            <h3>${hackathon.name}</h3>
            <div class="date">📅 ${formattedDate} at ${hackathon.time}</div>
            ${hackathon.venue ? `<div class="venue">📍 ${hackathon.venue}</div>` : ''}
            <div class="price">₹${hackathon.price}</div>
            <p class="description">${hackathon.description}</p>
            <p class="team-size">👥 Team Size: ${hackathon.minMembers}-${hackathon.maxMembers} members</p>
            <p class="reg-count">📊 ${regCount} team${regCount !== 1 ? 's' : ''} registered</p>
            ${isRegistered 
                ? '<button class="btn btn-registered" disabled>Already Registered ✓</button>'
                : `<a href="hackathon-registration.html?id=${hackathon.id}" class="btn btn-primary">Register Now</a>`
            }
        `;
        
        hackathonsList.appendChild(card);
    });
}

function loadMyRegistrations() {
    const registrationsList = document.getElementById('registrationsList');
    if (!registrationsList) return;
    
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const myRegs = registrations.filter(r => {
        return r.leaderSRN === currentUser.data.srn;
    });
    
    if (myRegs.length === 0) {
        registrationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Registrations Yet</h3>
                <p>You haven't registered for any hackathons yet. Browse available hackathons and register now!</p>
                <button onclick="switchTab('hackathons')" class="btn btn-primary">Browse Hackathons</button>
            </div>
        `;
        return;
    }
    
    registrationsList.innerHTML = '';
    
    myRegs.sort((a, b) => {
        const dateA = new Date(a.transactionDate || 0);
        const dateB = new Date(b.transactionDate || 0);
        return dateB - dateA;
    });
    
    myRegs.forEach(reg => {
        const card = document.createElement('div');
        card.className = 'registration-card';
        
        const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
        const hackathon = hackathons.find(h => h.id === reg.hackathonId);
        const eventDate = hackathon ? new Date(hackathon.date) : null;
        const isPast = eventDate && eventDate < new Date();
        
        let teamMembersList = '';
        if (reg.members && reg.members.length > 0) {
            teamMembersList = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                    <strong style="display: block; margin-bottom: 10px; color: var(--primary-color);">Team Members:</strong>
                    <ol style="margin-left: 20px;">
                        <li style="margin-bottom: 5px;">${reg.leaderName} (Leader) - ${reg.leaderSRN}</li>
                        ${reg.members.map(m => `<li style="margin-bottom: 5px;">${m.name} - ${m.srn}</li>`).join('')}
                    </ol>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="registration-header">
                <h3>${reg.hackathonName}</h3>
                <span class="status-badge ${isPast ? 'completed' : 'upcoming'}">
                    ${isPast ? '✓ Completed' : '⏳ Upcoming'}
                </span>
            </div>
            <div class="registration-details">
                <div class="detail-item">
                    <strong>Team Name</strong>
                    <span>${reg.teamName}</span>
                </div>
                <div class="detail-item">
                    <strong>Team Leader</strong>
                    <span>${reg.leaderName}</span>
                </div>
                <div class="detail-item">
                    <strong>Leader SRN</strong>
                    <span>${reg.leaderSRN}</span>
                </div>
                <div class="detail-item">
                    <strong>Team Members</strong>
                    <span>${reg.numMembers} members</span>
                </div>
                <div class="detail-item">
                    <strong>Amount Paid</strong>
                    <span class="amount">₹${reg.amountPaid}</span>
                </div>
                <div class="detail-item">
                    <strong>Transaction ID</strong>
                    <span class="transaction-id">${reg.transactionId}</span>
                </div>
                <div class="detail-item">
                    <strong>Registration Date</strong>
                    <span>${reg.transactionDate || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Payment Status</strong>
                    <span style="color: #059669; font-weight: 700;">✓ ${reg.paymentStatus || 'Completed'}</span>
                </div>
            </div>
            ${teamMembersList}
            <div class="registration-actions">
                <button onclick="viewRegistrationDetails('${reg.transactionId}')" class="btn btn-secondary btn-small">
                    👁️ View Full Details
                </button>
                <button onclick="downloadRegistrationBill('${reg.transactionId}')" class="btn btn-primary btn-small">
                    📥 Download Bill
                </button>
            </div>
        `;
        
        registrationsList.appendChild(card);
    });
}

function viewRegistrationDetails(transactionId) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const reg = registrations.find(r => r.transactionId === transactionId);
    
    if (!reg) {
        alert('Registration not found!');
        return;
    }

    let membersList = `Team Leader:\n1. ${reg.leaderName} (${reg.leaderSRN})\n   Phone: ${reg.leaderPhone}\n\n`;
    
    if (reg.members && reg.members.length > 0) {
        membersList += 'Team Members:\n';
        reg.members.forEach((member, i) => {
            membersList += `${i + 2}. ${member.name} (${member.srn})\n   Phone: ${member.phone}\n`;
        });
    }

    const details = `
═══════════════════════════════════
    REGISTRATION DETAILS
═══════════════════════════════════

Hackathon: ${reg.hackathonName}
Team Name: ${reg.teamName}

${membersList}

PAYMENT INFORMATION
───────────────────────────────────
Amount Paid: ₹${reg.amountPaid}
Transaction ID: ${reg.transactionId}
Payment Date: ${reg.transactionDate}
Status: ${reg.paymentStatus || 'Completed'}

═══════════════════════════════════
    `;
    
    alert(details);
}

function downloadRegistrationBill(transactionId) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const reg = registrations.find(r => r.transactionId === transactionId);
    
    if (!reg) {
        alert('Registration not found!');
        return;
    }

    let membersList = `Team Leader:\n  - ${reg.leaderName} (${reg.leaderSRN}) - ${reg.leaderPhone}\n\n`;
    
    if (reg.members && reg.members.length > 0) {
        membersList += 'Team Members:\n';
        reg.members.forEach((member, i) => {
            membersList += `  - ${member.name} (${member.srn}) - ${member.phone}\n`;
        });
    }

    const billContent = `
═════════════════════════════════════════════════════
          SAPTHAGIRI NPS UNIVERSITY
       Hackathon Registration Receipt
═════════════════════════════════════════════════════

HACKATHON DETAILS
─────────────────────────────────────────────────────
Hackathon Name: ${reg.hackathonName}
Team Name: ${reg.teamName}

TEAM DETAILS
─────────────────────────────────────────────────────
${membersList}

Total Members: ${reg.numMembers}

PAYMENT DETAILS
─────────────────────────────────────────────────────
Registration Fee: ₹${reg.amountPaid}
Transaction ID: ${reg.transactionId}
Payment Date: ${reg.transactionDate}
Payment Status: ${reg.paymentStatus || 'Completed'}

═════════════════════════════════════════════════════
This is a computer-generated receipt.
Thank you for registering!
═════════════════════════════════════════════════════
    `;
    
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registration_${reg.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Bill downloaded successfully!');
}

function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const myRegs = registrations.filter(r => r.leaderSRN === currentUser.data.srn);
    
    const notifications = [];
    
    myRegs.forEach(reg => {
        notifications.push({
            id: `reg-${reg.transactionId}`,
            title: 'Registration Confirmed',
            message: `Your registration for "${reg.hackathonName}" has been confirmed. Transaction ID: ${reg.transactionId}`,
            time: reg.transactionDate || 'Recently',
            type: 'success',
            unread: false
        });
    });
    
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    myRegs.forEach(reg => {
        const hackathon = hackathons.find(h => h.id === reg.hackathonId);
        if (hackathon) {
            const eventDate = new Date(hackathon.date);
            if (eventDate >= now && eventDate <= threeDaysFromNow) {
                notifications.push({
                    id: `reminder-${hackathon.id}`,
                    title: '🔔 Upcoming Event Reminder',
                    message: `"${hackathon.name}" is coming up on ${eventDate.toLocaleDateString('en-IN')}. Get ready!`,
                    time: 'Today',
                    type: 'reminder',
                    unread: true
                });
            }
        }
    });
    
    const recentHackathons = hackathons.filter(h => {
        if (!h.createdAt) return false;
        const created = new Date(h.createdAt);
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
        return created >= twoDaysAgo && new Date(h.date) >= now;
    });
    
    recentHackathons.forEach(h => {
        notifications.push({
            id: `new-${h.id}`,
            title: '🎉 New Hackathon Available',
            message: `"${h.name}" has been added. Register now before spots fill up!`,
            time: '1 day ago',
            type: 'info',
            unread: true
        });
    });
    
    if (notifications.length === 0) {
        notifications.push({
            id: 'welcome',
            title: '👋 Welcome to SNPS Hackathon Portal',
            message: 'Browse available hackathons and register for events that interest you. Good luck!',
            time: 'Today',
            type: 'info',
            unread: false
        });
    }
    
    const unreadCount = notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No notifications</p>';
        return;
    }
    
    notificationsList.innerHTML = '';
    
    notifications.sort((a, b) => b.unread - a.unread);
    
    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.unread ? 'unread' : ''} type-${notif.type}`;
        
        item.innerHTML = `
            <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <div class="notification-time">${notif.time}</div>
            </div>
        `;
        
        notificationsList.appendChild(item);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'reminder': return '⏰';
        case 'info': return 'ℹ️';
        case 'warning': return '⚠️';
        default: return '🔔';
    }
}

function markNotificationsAsRead() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.style.display = 'none';
    }
    
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        setTimeout(() => {
            item.classList.remove('unread');
        }, 500);
    });
}

function loadSponsors() {
    const sponsorsGrid = document.querySelector('#sponsorsTab .sponsors-grid');
    if (!sponsorsGrid) return;
    
    const sponsors = getAllSponsors();
    
    if (sponsors.length === 0) {
        sponsorsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🤝</div>
                <h3>No Sponsors Yet</h3>
                <p>Check back soon for our amazing sponsors and partners!</p>
            </div>
        `;
        return;
    }
    
    sponsorsGrid.innerHTML = '';
    
    const tierPriority = { platinum: 1, gold: 2, silver: 3, bronze: 4, community: 5 };
    sponsors.sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier]);
    
    sponsors.forEach(sponsor => {
        const tierInfo = getTierInfo(sponsor.tier);
        
        const card = document.createElement('div');
        card.className = 'sponsor-card';
        
        card.innerHTML = `
            <div class="sponsor-tier-badge-small" style="background: ${tierInfo.color};">
                ${tierInfo.icon} ${tierInfo.label}
            </div>
            <div class="sponsor-logo-wrapper">
                <img src="${sponsor.logo}" alt="${sponsor.name}" class="sponsor-logo">
            </div>
            <h3>${sponsor.name}</h3>
            ${sponsor.website 
                ? `<a href="${sponsor.website}" target="_blank" class="btn btn-secondary btn-small">Visit Website</a>`
                : '<p style="color: var(--text-light); font-size: 0.9rem;">No website available</p>'
            }
        `;
        
        sponsorsGrid.appendChild(card);
    });
}

function setupSocialMedia() {
    const socialLinks = document.querySelectorAll('.social-card');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('h3').textContent;
            showToast(`Opening ${platform}... (Demo mode)`);
        });
    });
}

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