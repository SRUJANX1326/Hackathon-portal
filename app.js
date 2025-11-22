// app.js
import { database, ref, set, push } from './firebase-config.js';

// Handle team registration
function registerTeam(event) {
  event.preventDefault();
  
  // Get form values
  const teamName = document.getElementById('teamName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const members = document.getElementById('members').value;
  
  // Validate inputs
  if (!teamName || !email || !phone) {
    alert('Please fill all required fields');
    return;
  }
  
  // Create new registration reference
  const registrationsRef = ref(database, 'registrations');
  const newRegistrationRef = push(registrationsRef);
  
  // Save to Firebase
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

// Attach event listener to form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (form) {
    form.addEventListener('submit', registerTeam);
  }
});
