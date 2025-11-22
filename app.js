// app.js - Complete version with both registration and display
import { database, ref, set, push, onValue } from './firebase-config.js';

// ========== REGISTRATION HANDLER (from Step 4) ==========
function registerTeam(event) {
  event.preventDefault();
  
  const teamName = document.getElementById('teamName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const members = document.getElementById('members').value;
  
  if (!teamName || !email || !phone) {
    alert('Please fill all required fields');
    return;
  }
  
  const registrationsRef = ref(database, 'registrations');
  const newRegistrationRef = push(registrationsRef);
  
  set(newRegistrationRef, {
    teamName: teamName,
    email: email,
    phone: phone,
    members: members,
    timestamp: Date.now(),
    status: 'pending'
  })
  .then(() => {
    alert('Registration successful!');
    document.getElementById('registrationForm').reset();
  })
  .catch((error) => {
    alert('Error: ' + error.message);
  });
}

// ========== DISPLAY REAL-TIME DATA (Step 5) ==========
function displayRegistrations() {
  const registrationsRef = ref(database, 'registrations');
  
  // Listen for real-time changes
  onValue(registrationsRef, (snapshot) => {
    const data = snapshot.val();
    const registrationsList = document.getElementById('registrationsList');
    
    if (data) {
      let html = '<h3>Registered Teams</h3>';
      let count = 0;
      
      Object.keys(data).forEach((key) => {
        const team = data[key];
        count++;
        html += `
          <div class="team-card">
            <h4>${count}. ${team.teamName}</h4>
            <p><strong>Email:</strong> ${team.email}</p>
            <p><strong>Phone:</strong> ${team.phone}</p>
            <p><strong>Members:</strong> ${team.members || 'N/A'}</p>
            <p><strong>Status:</strong> ${team.status}</p>
          </div>
        `;
      });
      registrationsList.innerHTML = html;
    } else {
      registrationsList.innerHTML = '<p>No registrations yet.</p>';
    }
  });
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  // Attach form submission handler
  const form = document.getElementById('registrationForm');
  if (form) {
    form.addEventListener('submit', registerTeam);
  }
  
  // Start listening for registrations display
  const listElement = document.getElementById('registrationsList');
  if (listElement) {
    displayRegistrations();
  }
});
