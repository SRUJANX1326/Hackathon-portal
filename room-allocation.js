// Room Allocation Management
class RoomAllocationManager {
    constructor() {
        this.STORAGE_KEY = 'hackathon_room_allocations';
        this.allocations = this.loadAllocations();
    }

    loadAllocations() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    saveAllocations() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.allocations));
    }

    assignRoom(registrationId, roomData) {
        this.allocations[registrationId] = {
            roomNumber: roomData.roomNumber,
            building: roomData.building || 'Main Building',
            floor: roomData.floor || '1',
            capacity: roomData.capacity || '30',
            assignedDate: new Date().toISOString(),
            assignedBy: localStorage.getItem('currentUser') || 'Coordinator'
        };
        this.saveAllocations();
        return true;
    }

    getRoomAllocation(registrationId) {
        return this.allocations[registrationId] || null;
    }

    updateRoom(registrationId, roomData) {
        if (this.allocations[registrationId]) {
            this.allocations[registrationId] = {
                ...this.allocations[registrationId],
                ...roomData,
                lastModified: new Date().toISOString()
            };
            this.saveAllocations();
            return true;
        }
        return false;
    }

    removeRoom(registrationId) {
        if (this.allocations[registrationId]) {
            delete this.allocations[registrationId];
            this.saveAllocations();
            return true;
        }
        return false;
    }

    getAllAllocations() {
        return this.allocations;
    }

    getTeamsWithRooms() {
        return Object.keys(this.allocations).length;
    }

    getTeamsWithoutRooms(allRegistrations) {
        const allocatedIds = Object.keys(this.allocations);
        return allRegistrations.filter(reg => !allocatedIds.includes(reg.id.toString()));
    }

    exportAllocations() {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const csvData = [];

        csvData.push(['Team Name', 'Hackathon', 'Room Number', 'Building', 'Floor', 'Capacity', 'Assigned Date']);

        registrations.forEach(reg => {
            const room = this.getRoomAllocation(reg.id);
            if (room) {
                csvData.push([
                    reg.teamName,
                    reg.hackathonName,
                    room.roomNumber,
                    room.building,
                    room.floor,
                    room.capacity,
                    new Date(room.assignedDate).toLocaleDateString()
                ]);
            }
        });

        return csvData;
    }
}

// Initialize room manager
const roomManager = new RoomAllocationManager();

// Student View Functions
function displayStudentRoomAllocation() {
    const container = document.getElementById('roomAllocationContent');
    if (!container) return;

    const currentUser = localStorage.getItem('currentUser');
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');

    // Find user's registrations
    const userRegistrations = registrations.filter(reg =>
        reg.members && reg.members.some(member => member.email === currentUser)
    );

    if (userRegistrations.length === 0) {
        container.innerHTML = `
            <div class="no-room-assigned">
                <h3>📋 No Registrations Found</h3>
                <p>You haven't registered for any hackathons yet. Register for a hackathon to get room allocation.</p>
            </div>
        `;
        return;
    }

    let html = '';
    userRegistrations.forEach(reg => {
        const roomData = roomManager.getRoomAllocation(reg.id);

        if (roomData) {
            html += `
                <div class="room-allocation-container">
                    <h3 style="color: #667eea; margin-bottom: 20px;">
                        🏆 ${reg.hackathonName}
                    </h3>
                    <div class="room-info-card">
                        <h2>Room ${roomData.roomNumber}</h2>
                        <p>Your team has been assigned to this room</p>
                    </div>
                    <div class="room-details">
                        <h4 style="margin-bottom: 15px;">Room Details</h4>
                        <div class="room-details-grid">
                            <div class="room-detail-item">
                                <label>Team Name</label>
                                <span>${reg.teamName}</span>
                            </div>
                            <div class="room-detail-item">
                                <label>Building</label>
                                <span>${roomData.building}</span>
                            </div>
                            <div class="room-detail-item">
                                <label>Floor</label>
                                <span>${roomData.floor}</span>
                            </div>
                            <div class="room-detail-item">
                                <label>Capacity</label>
                                <span>${roomData.capacity} people</span>
                            </div>
                            <div class="room-detail-item">
                                <label>Team Size</label>
                                <span>${reg.members ? reg.members.length : 0} members</span>
                            </div>
                            <div class="room-detail-item">
                                <label>Assigned Date</label>
                                <span>${new Date(roomData.assignedDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="room-allocation-container">
                    <h3 style="color: #667eea; margin-bottom: 20px;">
                        🏆 ${reg.hackathonName}
                    </h3>
                    <div class="no-room-assigned">
                        <h3>⏳ Room Not Yet Assigned</h3>
                        <p>Team: ${reg.teamName}</p>
                        <p>Room allocation is pending. Please check back later or contact the coordinator.</p>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

// Coordinator View Functions
function displayCoordinatorRoomManagement() {
    const container = document.getElementById('roomManagementContent');
    if (!container) return;

    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const hackathons = JSON.parse(localStorage.getItem('hackathons') || '[]');

    // Calculate statistics
    const totalTeams = registrations.length;
    const teamsWithRooms = roomManager.getTeamsWithRooms();
    const teamsWithoutRooms = totalTeams - teamsWithRooms;

    // Populate hackathon filter
    const filterSelect = document.getElementById('roomFilterHackathon');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Hackathons</option>';
        hackathons.forEach(hack => {
            filterSelect.innerHTML += `<option value="${hack.id}">${hack.name}</option>`;
        });
    }

    let html = `
        <div class="stats-summary">
            <div class="summary-card">
                <h4>${totalTeams}</h4>
                <p>Total Teams</p>
            </div>
            <div class="summary-card">
                <h4>${teamsWithRooms}</h4>
                <p>Rooms Assigned</p>
            </div>
            <div class="summary-card">
                <h4>${teamsWithoutRooms}</h4>
                <p>Pending Assignment</p>
            </div>
            <div class="summary-card">
                <h4>${totalTeams > 0 ? Math.round((teamsWithRooms/totalTeams)*100) : 0}%</h4>
                <p>Completion Rate</p>
            </div>
        </div>

        <div class="room-management-grid">
    `;

    registrations.forEach(reg => {
                const roomData = roomManager.getRoomAllocation(reg.id);
                const hasRoom = roomData !== null;
                const memberCount = reg.members ? reg.members.length : 0;

                html += `
            <div class="team-room-card ${hasRoom ? 'has-room' : 'no-room'}" data-hackathon-id="${reg.hackathonId}">
                <div class="team-header">
                    <div>
                        <div class="team-name">${reg.teamName}</div>
                        <small style="color: #666;">${reg.hackathonName}</small>
                    </div>
                    <span class="team-status ${hasRoom ? 'assigned' : 'unassigned'}">
                        ${hasRoom ? '✓ Assigned' : '⚠ Unassigned'}
                    </span>
                </div>

                <div class="team-info">
                    <div class="team-info-item">
                        <strong>Team Size:</strong> ${memberCount} members
                    </div>
                    <div class="team-info-item">
                        <strong>Leader:</strong> ${reg.leaderName || reg.members[0]?.name || 'N/A'}
                    </div>
                    <div class="team-info-item">
                        <strong>Email:</strong> ${reg.leaderEmail || reg.members[0]?.email || 'N/A'}
                    </div>
                    <div class="team-info-item">
                        <strong>Phone:</strong> ${reg.leaderPhone || reg.members[0]?.phone || 'N/A'}
                    </div>
                </div>

                ${hasRoom ? `
                    <div class="current-room-display">
                        <div>
                            <div class="room-number">Room ${roomData.roomNumber}</div>
                            <small>${roomData.building} - Floor ${roomData.floor}</small>
                        </div>
                        <button onclick="changeRoom(${reg.id})" class="btn btn-secondary change-btn">
                            Change Room
                        </button>
                    </div>
                ` : `
                    <div class="room-assignment-form">
                        <div>
                            <label style="font-size: 12px; color: #666; margin-bottom: 5px;">Room Number</label>
                            <input type="text" 
                                   id="roomInput_${reg.id}" 
                                   placeholder="e.g., 101, A-205" 
                                   style="width: 100%;">
                        </div>
                        <button onclick="assignRoomQuick(${reg.id})" class="btn btn-primary">
                            Assign Room
                        </button>
                    </div>
                `}

                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="openRoomDetailsModal(${reg.id})" class="btn btn-secondary" style="flex: 1;">
                        📋 Full Details
                    </button>
                    ${hasRoom ? `
                        <button onclick="removeRoomAssignment(${reg.id})" class="btn" style="flex: 1; background: #dc3545; color: white;">
                            🗑️ Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function assignRoomQuick(registrationId) {
    const roomInput = document.getElementById(`roomInput_${registrationId}`);
    const roomNumber = roomInput.value.trim();

    if (!roomNumber) {
        alert('Please enter a room number');
        return;
    }

    const roomData = {
        roomNumber: roomNumber,
        building: 'Main Building',
        floor: '1',
        capacity: '30'
    };

    if (roomManager.assignRoom(registrationId, roomData)) {
        showNotification('Room assigned successfully!', 'success');
        displayCoordinatorRoomManagement();
    } else {
        showNotification('Failed to assign room', 'error');
    }
}

function changeRoom(registrationId) {
    openRoomDetailsModal(registrationId, true);
}

function removeRoomAssignment(registrationId) {
    if (confirm('Are you sure you want to remove this room assignment?')) {
        if (roomManager.removeRoom(registrationId)) {
            showNotification('Room assignment removed successfully!', 'success');
            displayCoordinatorRoomManagement();
        } else {
            showNotification('Failed to remove room assignment', 'error');
        }
    }
}

function openRoomDetailsModal(registrationId, isEdit = false) {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration) return;

    const roomData = roomManager.getRoomAllocation(registrationId);
    const modal = document.getElementById('roomDetailsModal');
    const modalTitle = document.getElementById('roomModalTitle');
    const modalContent = document.getElementById('roomModalContent');

    modalTitle.textContent = isEdit ? 'Edit Room Assignment' : 'Assign Room';

    modalContent.innerHTML = `
        <div class="modal-room-form">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>Team:</strong> ${registration.teamName}<br>
                <strong>Hackathon:</strong> ${registration.hackathonName}<br>
                <strong>Members:</strong> ${registration.members ? registration.members.length : 0}
            </div>

            <form id="roomAssignmentForm" onsubmit="saveRoomAssignment(event, ${registrationId})">
                <div class="form-group">
                    <label for="modalRoomNumber">Room Number *</label>
                    <input type="text" 
                           id="modalRoomNumber" 
                           value="${roomData ? roomData.roomNumber : ''}" 
                           required 
                           placeholder="e.g., 101, A-205, Lab-3">
                </div>

                <div class="form-group">
                    <label for="modalBuilding">Building</label>
                    <select id="modalBuilding">
                        <option value="Main Building" ${roomData?.building === 'Main Building' ? 'selected' : ''}>Main Building</option>
                        <option value="Block A" ${roomData?.building === 'Block A' ? 'selected' : ''}>Block A</option>
                        <option value="Block B" ${roomData?.building === 'Block B' ? 'selected' : ''}>Block B</option>
                        <option value="Block C" ${roomData?.building === 'Block C' ? 'selected' : ''}>Block C</option>
                        <option value="Laboratory Block" ${roomData?.building === 'Laboratory Block' ? 'selected' : ''}>Laboratory Block</option>
                        <option value="Auditorium" ${roomData?.building === 'Auditorium' ? 'selected' : ''}>Auditorium</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="modalFloor">Floor</label>
                    <select id="modalFloor">
                        <option value="Ground" ${roomData?.floor === 'Ground' ? 'selected' : ''}>Ground Floor</option>
                        <option value="1" ${roomData?.floor === '1' ? 'selected' : ''}>1st Floor</option>
                        <option value="2" ${roomData?.floor === '2' ? 'selected' : ''}>2nd Floor</option>
                        <option value="3" ${roomData?.floor === '3' ? 'selected' : ''}>3rd Floor</option>
                        <option value="4" ${roomData?.floor === '4' ? 'selected' : ''}>4th Floor</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="modalCapacity">Room Capacity</label>
                    <input type="number" 
                           id="modalCapacity" 
                           value="${roomData ? roomData.capacity : '30'}" 
                           min="1" 
                           placeholder="e.g., 30">
                </div>

                <div class="form-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        ${isEdit ? 'Update Room' : 'Assign Room'}
                    </button>
                    <button type="button" onclick="closeRoomDetailsModal()" class="btn btn-secondary" style="flex: 1;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.style.display = 'block';
}

function closeRoomDetailsModal() {
    const modal = document.getElementById('roomDetailsModal');
    modal.style.display = 'none';
}

function saveRoomAssignment(event, registrationId) {
    event.preventDefault();

    const roomData = {
        roomNumber: document.getElementById('modalRoomNumber').value.trim(),
        building: document.getElementById('modalBuilding').value,
        floor: document.getElementById('modalFloor').value,
        capacity: document.getElementById('modalCapacity').value
    };

    const existingRoom = roomManager.getRoomAllocation(registrationId);
    let success;

    if (existingRoom) {
        success = roomManager.updateRoom(registrationId, roomData);
    } else {
        success = roomManager.assignRoom(registrationId, roomData);
    }

    if (success) {
        showNotification(existingRoom ? 'Room updated successfully!' : 'Room assigned successfully!', 'success');
        closeRoomDetailsModal();
        displayCoordinatorRoomManagement();
    } else {
        showNotification('Failed to save room assignment', 'error');
    }
}

function filterRoomsByHackathon() {
    const filterValue = document.getElementById('roomFilterHackathon').value;
    const cards = document.querySelectorAll('.team-room-card');

    cards.forEach(card => {
        if (filterValue === 'all' || card.dataset.hackathonId === filterValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function exportRoomAllocations() {
    const csvData = roomManager.exportAllocations();
    
    let csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room_allocations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Room allocations exported successfully!', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('roomDetailsModal');
    if (event.target === modal) {
        closeRoomDetailsModal();
    }
}