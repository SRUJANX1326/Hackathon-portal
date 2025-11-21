// Toggle between student and coordinator forms
document.addEventListener('DOMContentLoaded', function() {
    const typeButtons = document.querySelectorAll('.type-btn');

    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            toggleFormType(type);
        });
    });

    // Login form handlers
    const studentLoginForm = document.getElementById('studentLoginForm');
    const coordinatorLoginForm = document.getElementById('coordinatorLoginForm');

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', handleStudentLogin);
    }

    if (coordinatorLoginForm) {
        coordinatorLoginForm.addEventListener('submit', handleCoordinatorLogin);
    }

    // Registration form handlers
    const studentRegForm = document.getElementById('studentRegForm');
    const coordinatorRegForm = document.getElementById('coordinatorRegForm');

    if (studentRegForm) {
        studentRegForm.addEventListener('submit', handleStudentRegistration);
    }

    if (coordinatorRegForm) {
        coordinatorRegForm.addEventListener('submit', handleCoordinatorRegistration);
    }
});

function toggleFormType(type) {
    const typeButtons = document.querySelectorAll('.type-btn');
    const studentForm = document.getElementById('studentLoginForm') || document.getElementById('studentRegForm');
    const coordinatorForm = document.getElementById('coordinatorLoginForm') || document.getElementById('coordinatorRegForm');

    typeButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (type === 'student') {
        studentForm.style.display = 'block';
        coordinatorForm.style.display = 'none';
    } else {
        studentForm.style.display = 'none';
        coordinatorForm.style.display = 'block';
    }
}

// Handle student login
function handleStudentLogin(e) {
    e.preventDefault();

    const srn = document.getElementById('studentSRN').value;
    const password = document.getElementById('studentPassword').value;

    // Get registered users from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];

    const student = students.find(s => s.srn === srn && s.password === password);

    if (student) {
        // Store current user session
        localStorage.setItem('currentUser', JSON.stringify({
            type: 'student',
            data: student
        }));

        alert('Login successful!');
        window.location.href = 'student-dashboard.html';
    } else {
        alert('Invalid SRN or password. Please try again.');
    }
}

// Handle coordinator login
function handleCoordinatorLogin(e) {
    e.preventDefault();

    const email = document.getElementById('coordinatorEmail').value;
    const password = document.getElementById('coordinatorPassword').value;

    // Get registered coordinators from localStorage
    const coordinators = JSON.parse(localStorage.getItem('coordinators')) || [];

    const coordinator = coordinators.find(c => c.email === email && c.password === password);

    if (coordinator) {
        // Store current user session
        localStorage.setItem('currentUser', JSON.stringify({
            type: 'coordinator',
            data: coordinator
        }));

        alert('Login successful!');
        window.location.href = 'coordinator-dashboard.html';
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

// Handle student registration
function handleStudentRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('regStudentName').value;
    const srn = document.getElementById('regStudentSRN').value;
    const email = document.getElementById('regStudentEmail').value;
    const phone = document.getElementById('regStudentPhone').value;
    const password = document.getElementById('regStudentPassword').value;
    const confirmPassword = document.getElementById('regStudentConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Get existing students
    const students = JSON.parse(localStorage.getItem('students')) || [];

    // Check if SRN already exists
    if (students.some(s => s.srn === srn)) {
        alert('SRN already registered!');
        return;
    }

    // Add new student
    students.push({ name, srn, email, phone, password });
    localStorage.setItem('students', JSON.stringify(students));

    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

// Handle coordinator registration
function handleCoordinatorRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('regCoordName').value;
    const email = document.getElementById('regCoordEmail').value;
    const phone = document.getElementById('regCoordPhone').value;
    const department = document.getElementById('regCoordDepartment').value;
    const password = document.getElementById('regCoordPassword').value;
    const confirmPassword = document.getElementById('regCoordConfirmPassword').value;
    const verificationCode = document.getElementById('regCoordVerification').value;

    // Check verification code (In production, verify with backend)
    if (verificationCode !== 'COORD2025') {
        alert('Invalid verification code!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Get existing coordinators
    const coordinators = JSON.parse(localStorage.getItem('coordinators')) || [];

    // Check if email already exists
    if (coordinators.some(c => c.email === email)) {
        alert('Email already registered!');
        return;
    }

    // Add new coordinator
    coordinators.push({ name, email, phone, department, password });
    localStorage.setItem('coordinators', JSON.stringify(coordinators));

    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

// Check if user is logged in
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }

    return currentUser;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}