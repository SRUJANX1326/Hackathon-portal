// Coordinator Ticket Management

function loadCoordinatorTickets() {
    const tickets = getAllTickets();
    const ticketsList = document.getElementById('coordinatorTicketsList');

    const stats = getTicketStats();
    if (document.getElementById('coordTotalTickets')) {
        document.getElementById('coordTotalTickets').textContent = stats.total;
        document.getElementById('coordOpenTickets').textContent = stats.open;
        document.getElementById('coordInProgressTickets').textContent = stats.inProgress;
        document.getElementById('coordResolvedTickets').textContent = stats.resolved;
    }

    const openCount = stats.open;
    const badge = document.getElementById('coordTicketBadge');
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
                <p>No tickets have been created yet.</p>
            </div>
        `;
        return;
    }

    displayCoordinatorTickets(tickets);
}

function displayCoordinatorTickets(tickets) {
    const ticketsList = document.getElementById('coordinatorTicketsList');
    ticketsList.innerHTML = '';

    tickets.forEach(ticket => {
        const needsResponse = ticket.responses.length === 0 ||
            ticket.responses[ticket.responses.length - 1].respondentType === 'student';

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
                    ${needsResponse ? '<span class="needs-response-badge">Needs Response</span>' : ''}
                </div>
                <div class="ticket-student">
                    👤 ${ticket.studentName} (${ticket.studentSRN})
                </div>
            </div>
            <div class="ticket-body">
                <h4 class="ticket-subject">${ticket.subject}</h4>
                <p class="ticket-description">${ticket.description.substring(0, 150)}${ticket.description.length > 150 ? '...' : ''}</p>
            </div>
            <div class="ticket-footer">
                <div class="ticket-meta">
                    <span>💬 ${ticket.responses.length} responses</span>
                    <span>📅 ${ticket.createdAt}</span>
                </div>
                <button onclick="viewCoordTicketDetails('${ticket.ticketNumber}')" class="btn btn-primary btn-small">
                    Respond
                </button>
            </div>
        `;

        ticketsList.appendChild(card);
    });
}

function viewCoordTicketDetails(ticketNumber) {
    const ticket = getTicketByNumber(ticketNumber);
    if (!ticket) {
        alert('Ticket not found!');
        return;
    }

    const modal = document.getElementById('coordViewTicketModal');
    const content = document.getElementById('coordViewTicketContent');

    document.getElementById('coordViewTicketNumber').textContent = `Ticket ${ticketNumber}`;

    let responsesHTML = '';
    if (ticket.responses.length === 0) {
        responsesHTML = '<p class="no-responses">No responses yet.</p>';
    } else {
        responsesHTML = ticket.responses.map(response => {
            const isCoordinator = response.respondentType === 'coordinator';
            return `
                <div class="response-item ${isCoordinator ? 'response-coordinator' : 'response-student'}">
                    <div class="response-header">
                        <span class="response-author">
                            ${isCoordinator ? '👨‍💼 ' : '👤 '}${response.respondedBy}
                            ${isCoordinator ? '<span class="coordinator-badge">Coordinator</span>' : '<span class="student-badge">Student</span>'}
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
                <div class="ticket-student-info">
                    <h4>Submitted by: ${ticket.studentName}</h4>
                    <p>SRN: ${ticket.studentSRN}</p>
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
                
                <div class="add-response-section coordinator-response">
                    <h3>Respond to Student</h3>
                    <textarea id="coordinatorResponseText" rows="4" placeholder="Type your response..."></textarea>
                    <button onclick="addCoordinatorResponse('${ticketNumber}')" class="btn btn-primary btn-large">
                        Send Response to Student
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeCoordViewTicketModal() {
    document.getElementById('coordViewTicketModal').style.display = 'none';
}

function addCoordinatorResponse(ticketNumber) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const responseText = document.getElementById('coordinatorResponseText').value.trim();

    if (!responseText) {
        alert('Please enter a response!');
        return;
    }

    const success = addTicketResponse(ticketNumber, responseText, currentUser.data.name, 'coordinator');

    if (success) {
        if (typeof showToast === 'function') {
            showToast('✓ Response sent to student!');
        } else {
            alert('✓ Response sent!');
        }
        viewCoordTicketDetails(ticketNumber);
        loadCoordinatorTickets();
    } else {
        alert('Failed to send response.');
    }
}

function filterCoordinatorTickets() {
    const filterValue = document.getElementById('ticketFilterStatus').value;
    const allTickets = getAllTickets();

    if (filterValue === 'all') {
        displayCoordinatorTickets(allTickets);
    } else {
        const filtered = allTickets.filter(t => t.status === filterValue);
        displayCoordinatorTickets(filtered);
    }
}

function refreshCoordinatorTickets() {
    loadCoordinatorTickets();
    if (typeof showToast === 'function') {
        showToast('✓ Tickets refreshed!');
    }
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('coordViewTicketModal');
    if (event.target === modal) closeCoordViewTicketModal();
});

window.viewCoordTicketDetails = viewCoordTicketDetails;
window.closeCoordViewTicketModal = closeCoordViewTicketModal;
window.addCoordinatorResponse = addCoordinatorResponse;
window.filterCoordinatorTickets = filterCoordinatorTickets;
window.refreshCoordinatorTickets = refreshCoordinatorTickets;
window.loadCoordinatorTickets = loadCoordinatorTickets;