// Student Ticket Management UI

function loadStudentTickets() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const tickets = getStudentTickets(currentUser.data.srn);
    const ticketsList = document.getElementById('studentTicketsList');

    const stats = getTicketStats(currentUser.data.srn);
    if (document.getElementById('myTotalTickets')) {
        document.getElementById('myTotalTickets').textContent = stats.total;
        document.getElementById('myOpenTickets').textContent = stats.open;
        document.getElementById('myInProgressTickets').textContent = stats.inProgress;
        document.getElementById('myResolvedTickets').textContent = stats.resolved;
    }

    const openCount = stats.open + stats.inProgress;
    const badge = document.getElementById('ticketBadge');
    if (badge) {
        badge.textContent = openCount;
        badge.style.display = openCount > 0 ? 'flex' : 'none';
    }

    if (!ticketsList) return;

    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <h3>No Support Tickets</h3>
                <p>You haven't created any support tickets yet.</p>
                <button onclick="openCreateTicketModal()" class="btn btn-primary">Create Your First Ticket</button>
            </div>
        `;
        return;
    }

    ticketsList.innerHTML = '';

    tickets.forEach(ticket => {
        const hasNewResponse = ticket.responses.length > 0 &&
            ticket.responses[ticket.responses.length - 1].respondentType === 'coordinator';

        const card = document.createElement('div');
        card.className = 'ticket-card';

        const statusClass = ticket.status.toLowerCase().replace(' ', '-');
        const priorityClass = ticket.priority.toLowerCase();

        card.innerHTML = `
            <div class="ticket-header">
                <div class="ticket-info">
                    <h3 class="ticket-number">${ticket.ticketNumber}</h3>
                    <span class="ticket-status status-${statusClass}">${ticket.status}</span>
                    <span class="ticket-priority priority-${priorityClass}">${ticket.priority}</span>
                    ${hasNewResponse ? '<span class="new-response-badge">New Response</span>' : ''}
                </div>
                <div class="ticket-date">${ticket.createdAt}</div>
            </div>
            <div class="ticket-body">
                <h4 class="ticket-subject">${ticket.subject}</h4>
                <p class="ticket-description">${ticket.description.substring(0, 150)}${ticket.description.length > 150 ? '...' : ''}</p>
            </div>
            <div class="ticket-footer">
                <div class="ticket-meta">
                    <span>💬 ${ticket.responses.length} response${ticket.responses.length !== 1 ? 's' : ''}</span>
                    <span>🕒 Updated: ${ticket.lastUpdated}</span>
                </div>
                <button onclick="viewTicketDetails('${ticket.ticketNumber}')" class="btn btn-secondary btn-small">
                    View Details
                </button>
            </div>
        `;

        ticketsList.appendChild(card);
    });
}

function openCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    modal.style.display = 'block';
    document.getElementById('createTicketForm').reset();
}

function closeCreateTicketModal() {
    document.getElementById('createTicketModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const createTicketForm = document.getElementById('createTicketForm');
    if (createTicketForm) {
        createTicketForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please login first!');
                return;
            }

            const subject = document.getElementById('ticketSubject').value.trim();
            const description = document.getElementById('ticketDescription').value.trim();

            if (!subject || !description) {
                alert('Please fill all fields!');
                return;
            }

            const ticket = createTicket(subject, description, currentUser.data.srn, currentUser.data.name);
            closeCreateTicketModal();
            loadStudentTickets();

            if (typeof showToast === 'function') {
                showToast(`✓ Ticket ${ticket.ticketNumber} created successfully!`);
            } else {
                alert(`✓ Ticket ${ticket.ticketNumber} created!`);
            }
        });
    }
});

function viewTicketDetails(ticketNumber) {
    const ticket = getTicketByNumber(ticketNumber);
    if (!ticket) {
        alert('Ticket not found!');
        return;
    }

    const modal = document.getElementById('viewTicketModal');
    const content = document.getElementById('viewTicketContent');

    document.getElementById('viewTicketNumber').textContent = `Ticket ${ticketNumber}`;

    const statusClass = ticket.status.toLowerCase().replace(' ', '-');
    const priorityClass = ticket.priority.toLowerCase();

    let responsesHTML = '';
    if (ticket.responses.length === 0) {
        responsesHTML = '<p class="no-responses">No responses yet. Our support team will respond soon.</p>';
    } else {
        responsesHTML = ticket.responses.map(response => {
            const isCoordinator = response.respondentType === 'coordinator';
            return `
                <div class="response-item ${isCoordinator ? 'response-coordinator' : 'response-student'}">
                    <div class="response-header">
                        <span class="response-author">
                            ${isCoordinator ? '👨‍💼 ' : '👤 '}${response.respondedBy}
                            ${isCoordinator ? '<span class="coordinator-badge">Coordinator</span>' : ''}
                        </span>
                        <span class="response-time">${response.timestamp}</span>
                    </div>
                    <div class="response-message">${response.message}</div>
                </div>
            `;
        }).join('');
    }

    content.innerHTML = `
        <div class="ticket-detail">
            <div class="ticket-detail-header">
                <div class="ticket-badges">
                    <span class="ticket-status status-${statusClass}">${ticket.status}</span>
                    <span class="ticket-priority priority-${priorityClass}">${ticket.priority}</span>
                </div>
                <div class="ticket-dates">
                    <div>Created: ${ticket.createdAt}</div>
                    <div>Last Updated: ${ticket.lastUpdated}</div>
                </div>
            </div>
            
            <div class="ticket-detail-body">
                <h3>Subject</h3>
                <p class="ticket-subject-full">${ticket.subject}</p>
                
                <h3>Description</h3>
                <p class="ticket-description-full">${ticket.description}</p>
                
                <h3>Conversation (${ticket.responses.length})</h3>
                <div class="responses-container">
                    ${responsesHTML}
                </div>
                
                <div class="add-response-section">
                    <h3>Add Response</h3>
                    <textarea id="studentResponseText" rows="4" placeholder="Type your response here..."></textarea>
                    <button onclick="addStudentResponse('${ticketNumber}')" class="btn btn-primary">
                        Send Response
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeViewTicketModal() {
    document.getElementById('viewTicketModal').style.display = 'none';
}

function addStudentResponse(ticketNumber) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const responseText = document.getElementById('studentResponseText').value.trim();

    if (!responseText) {
        alert('Please enter a response!');
        return;
    }

    const success = addTicketResponse(ticketNumber, responseText, currentUser.data.name, 'student');

    if (success) {
        if (typeof showToast === 'function') {
            showToast('✓ Response added!');
        }
        viewTicketDetails(ticketNumber);
        loadStudentTickets();
    } else {
        alert('Failed to add response.');
    }
}

window.addEventListener('click', function(event) {
    const createModal = document.getElementById('createTicketModal');
    const viewModal = document.getElementById('viewTicketModal');

    if (event.target === createModal) closeCreateTicketModal();
    if (event.target === viewModal) closeViewTicketModal();
});

window.openCreateTicketModal = openCreateTicketModal;
window.closeCreateTicketModal = closeCreateTicketModal;
window.viewTicketDetails = viewTicketDetails;
window.closeViewTicketModal = closeViewTicketModal;
window.addStudentResponse = addStudentResponse;
window.loadStudentTickets = loadStudentTickets;