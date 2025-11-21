// Ticket Management System - Core Functions

function generateTicketNumber() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const todayTickets = tickets.filter(t => {
        const ticketDate = t.ticketNumber.split(',')[0].replace('#', '');
        const today = `${day}-${month}-${year}`;
        return ticketDate === today;
    });

    const ticketCount = todayTickets.length + 1;
    return `#${day}-${month}-${year},${ticketCount}`;
}

function createTicket(subject, description, studentSRN, studentName) {
    const ticketNumber = generateTicketNumber();
    const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const ticket = {
        ticketNumber: ticketNumber,
        subject: subject,
        description: description,
        studentSRN: studentSRN,
        studentName: studentName,
        status: 'Open',
        priority: 'Normal',
        createdAt: timestamp,
        createdTimestamp: Date.now(),
        responses: [],
        lastUpdated: timestamp
    };

    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    console.log('✓ Ticket created:', ticket);
    return ticket;
}

function getStudentTickets(studentSRN) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    return tickets.filter(t => t.studentSRN === studentSRN)
        .sort((a, b) => b.createdTimestamp - a.createdTimestamp);
}

function getAllTickets() {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    return tickets.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
}

function getTicketByNumber(ticketNumber) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    return tickets.find(t => t.ticketNumber === ticketNumber);
}

function addTicketResponse(ticketNumber, response, respondedBy, respondentType) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticketIndex = tickets.findIndex(t => t.ticketNumber === ticketNumber);

    if (ticketIndex === -1) {
        console.error('Ticket not found:', ticketNumber);
        return false;
    }

    const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const responseObj = {
        message: response,
        respondedBy: respondedBy,
        respondentType: respondentType,
        timestamp: timestamp,
        timestampValue: Date.now()
    };

    tickets[ticketIndex].responses.push(responseObj);
    tickets[ticketIndex].lastUpdated = timestamp;

    if (respondentType === 'coordinator' && tickets[ticketIndex].status === 'Open') {
        tickets[ticketIndex].status = 'In Progress';
    }

    localStorage.setItem('tickets', JSON.stringify(tickets));
    console.log('✓ Response added to ticket:', ticketNumber);
    return true;
}

function updateTicketStatus(ticketNumber, newStatus) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticketIndex = tickets.findIndex(t => t.ticketNumber === ticketNumber);

    if (ticketIndex === -1) return false;

    tickets[ticketIndex].status = newStatus;
    tickets[ticketIndex].lastUpdated = new Date().toLocaleString('en-IN');
    localStorage.setItem('tickets', JSON.stringify(tickets));
    return true;
}

function updateTicketPriority(ticketNumber, newPriority) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticketIndex = tickets.findIndex(t => t.ticketNumber === ticketNumber);

    if (ticketIndex === -1) return false;

    tickets[ticketIndex].priority = newPriority;
    tickets[ticketIndex].lastUpdated = new Date().toLocaleString('en-IN');
    localStorage.setItem('tickets', JSON.stringify(tickets));
    return true;
}

function getTicketStats(studentSRN = null) {
    const tickets = studentSRN ?
        getStudentTickets(studentSRN) :
        getAllTickets();

    return {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
        closed: tickets.filter(t => t.status === 'Closed').length
    };
}