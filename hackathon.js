document.addEventListener('DOMContentLoaded', function() {
    // Check if on registration page
    if (window.location.pathname.includes('hackathon-registration.html')) {
        loadHackathonDetails();
    }
});

function loadHackathonDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const hackathonId = parseInt(urlParams.get('id'));

    const hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];
    const hackathon = hackathons.find(h => h.id === hackathonId);

    if (!hackathon) {
        alert('Hackathon not found!');
        window.location.href = 'student-dashboard.html';
        return;
    }

    // Display hackathon title
    document.getElementById('hackathonTitle').textContent = hackathon.name;

    // Display fee
    document.getElementById('feeAmount').textContent = `₹${hackathon.price}`;

    // Set member constraints
    const memberConstraint = document.getElementById('memberConstraint');
    memberConstraint.textContent = `Team must have between ${hackathon.minMembers} and ${hackathon.maxMembers} members`;

    // Handle number of members change
    const numMembersInput = document.getElementById('numMembers');
    numMembersInput.setAttribute('min', hackathon.minMembers);
    numMembersInput.setAttribute('max', hackathon.maxMembers);

    numMembersInput.addEventListener('input', function() {
        const numMembers = parseInt(this.value);

        if (numMembers < hackathon.minMembers || numMembers > hackathon.maxMembers) {
            memberConstraint.style.color = 'var(--error-color)';
            return;
        } else {
            memberConstraint.style.color = 'var(--text-light)';
        }

        // Update member count display
        document.getElementById('memberCount').textContent = numMembers;

        // Calculate total amount
        const totalAmount = hackathon.price;
        document.getElementById('totalAmount').textContent = `₹${totalAmount}`;

        // Generate team member fields
        generateMemberFields(numMembers);
    });

    // Handle form submission
    const form = document.getElementById('hackathonRegForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration(hackathon);
    });
}

function generateMemberFields(numMembers) {
    const container = document.getElementById('teamMembersContainer');
    const section = document.getElementById('teamMembersSection');

    container.innerHTML = '';

    // Start from 2 because leader is member 1
    for (let i = 2; i <= numMembers; i++) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'section';
        memberDiv.innerHTML = `
            <h4>Member ${i}</h4>
            <div class="form-group">
                <label for="member${i}Name">Full Name</label>
                <input type="text" id="member${i}Name" required placeholder="Enter name">
            </div>
            <div class="form-group">
                <label for="member${i}SRN">SRN Number</label>
                <input type="text" id="member${i}SRN" required placeholder="Enter SRN">
            </div>
            <div class="form-group">
                <label for="member${i}Phone">Phone Number</label>
                <input type="tel" id="member${i}Phone" required placeholder="Enter phone number">
            </div>
        `;
        container.appendChild(memberDiv);
    }

    section.style.display = numMembers > 1 ? 'block' : 'none';
}

function handleRegistration(hackathon) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const numMembers = parseInt(document.getElementById('numMembers').value);

    // Validate member count
    if (numMembers < hackathon.minMembers || numMembers > hackathon.maxMembers) {
        alert(`Team must have between ${hackathon.minMembers} and ${hackathon.maxMembers} members`);
        return;
    }

    // Collect team data
    const teamData = {
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        leaderName: document.getElementById('leaderName').value,
        leaderSRN: document.getElementById('leaderSRN').value,
        leaderPhone: document.getElementById('leaderPhone').value,
        teamName: document.getElementById('teamName').value,
        numMembers: numMembers,
        members: [],
        totalAmount: hackathon.price
    };

    // Collect team members data
    for (let i = 2; i <= numMembers; i++) {
        teamData.members.push({
            name: document.getElementById(`member${i}Name`).value,
            srn: document.getElementById(`member${i}SRN`).value,
            phone: document.getElementById(`member${i}Phone`).value
        });
    }

    // Store registration data temporarily
    sessionStorage.setItem('pendingRegistration', JSON.stringify(teamData));

    // Redirect to payment page
    window.location.href = 'payment.html';
}