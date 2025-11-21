// Payment Processing - Complete Working Version

document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page loaded');

    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }

    console.log('Current User:', currentUser);

    // Load payment summary
    const registrationData = loadPaymentSummary();
    if (!registrationData) return;

    // Setup payment method toggle
    setupPaymentMethodToggle();

    // Handle payment form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePayment(registrationData, currentUser);
        });
    }
});

function loadPaymentSummary() {
    const registrationData = JSON.parse(sessionStorage.getItem('pendingRegistration'));

    console.log('Pending Registration Data:', registrationData);

    if (!registrationData) {
        alert('No registration data found! Please complete the registration form first.');
        window.location.href = 'student-dashboard.html';
        return null;
    }

    // Display payment summary
    document.getElementById('payHackathonName').textContent = registrationData.hackathonName;
    document.getElementById('payTeamName').textContent = registrationData.teamName;
    document.getElementById('payMemberCount').textContent = registrationData.numMembers;
    document.getElementById('payTotalAmount').textContent = `₹${registrationData.totalAmount}`;

    return registrationData;
}

function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all sections
            document.getElementById('upiSection').style.display = 'none';
            document.getElementById('cardSection').style.display = 'none';
            document.getElementById('netbankingSection').style.display = 'none';

            // Show selected section
            if (this.value === 'upi') {
                document.getElementById('upiSection').style.display = 'block';
            } else if (this.value === 'card') {
                document.getElementById('cardSection').style.display = 'block';
            } else if (this.value === 'netbanking') {
                document.getElementById('netbankingSection').style.display = 'block';
            }
        });
    });
}

function handlePayment(registrationData, currentUser) {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    console.log('Processing payment...', paymentMethod);

    // Basic validation
    if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value.trim();
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., yourname@paytm)');
            return;
        }
    } else if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        if (!cardNumber || cardNumber.length < 16) {
            alert('Please enter a valid card number');
            return;
        }
        if (!expiryDate || !expiryDate.includes('/')) {
            alert('Please enter expiry date in MM/YY format');
            return;
        }
        if (!cvv || cvv.length < 3) {
            alert('Please enter a valid CVV');
            return;
        }
    } else if (paymentMethod === 'netbanking') {
        const bank = document.getElementById('bankSelect').value;
        if (!bank) {
            alert('Please select a bank');
            return;
        }
    }

    // Show processing message
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Processing Payment...';
    submitBtn.disabled = true;

    // Simulate payment processing (2 seconds delay)
    setTimeout(() => {
        const success = processPayment(registrationData, currentUser, paymentMethod);

        if (success) {
            console.log('Payment successful!');
        } else {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('Payment processing failed. Please try again.');
        }
    }, 2000);
}

function processPayment(registrationData, currentUser, paymentMethod) {
    try {
        // Generate transaction details
        const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
        const transactionDate = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Get payment method details
        let paymentDetails = '';
        if (paymentMethod === 'upi') {
            paymentDetails = document.getElementById('upiId').value;
        } else if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            paymentDetails = 'Card ending in ' + cardNumber.slice(-4);
        } else if (paymentMethod === 'netbanking') {
            const bank = document.getElementById('bankSelect').selectedOptions[0].text;
            paymentDetails = bank;
        }

        // Create complete registration object with all required fields
        const completeRegistration = {
            // Hackathon Info
            hackathonId: registrationData.hackathonId,
            hackathonName: registrationData.hackathonName,

            // Team Info
            teamName: registrationData.teamName,
            numMembers: registrationData.numMembers,

            // Leader Info (CRITICAL - must match current user)
            leaderName: registrationData.leaderName,
            leaderSRN: currentUser.data.srn, // Use current user's SRN explicitly
            leaderPhone: registrationData.leaderPhone,

            // Team Members
            members: registrationData.members || [],

            // Payment Info
            totalAmount: registrationData.totalAmount,
            amountPaid: registrationData.totalAmount,
            transactionId: transactionId,
            transactionDate: transactionDate,
            paymentStatus: 'Completed',
            paymentMethod: paymentMethod.toUpperCase(),
            paymentDetails: paymentDetails,

            // Additional Info
            registeredBy: currentUser.data.name,
            registeredEmail: currentUser.data.email || 'N/A',
            registrationTimestamp: Date.now()
        };

        console.log('Complete Registration Object:', completeRegistration);

        // Get existing registrations
        const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
        console.log('Existing Registrations:', registrations.length);

        // Add new registration
        registrations.push(completeRegistration);

        // Save to localStorage
        localStorage.setItem('registrations', JSON.stringify(registrations));
        console.log('Saved! Total Registrations:', registrations.length);

        // Verify save was successful
        const verifyRegistrations = JSON.parse(localStorage.getItem('registrations')) || [];
        console.log('Verification - Registrations in storage:', verifyRegistrations.length);

        // Store for bill generation
        sessionStorage.setItem('lastTransaction', JSON.stringify(completeRegistration));

        // Clear pending registration
        sessionStorage.removeItem('pendingRegistration');

        // Show success message
        displayPaymentSuccess(transactionId, transactionDate, registrationData.totalAmount, completeRegistration);

        return true;

    } catch (error) {
        console.error('Error processing payment:', error);
        return false;
    }
}

function displayPaymentSuccess(transactionId, transactionDate, amount, registrationData) {
    // Hide payment form
    document.getElementById('paymentForm').style.display = 'none';
    document.querySelector('.payment-summary').style.display = 'none';

    // Show success section
    const successDiv = document.getElementById('paymentSuccess');
    successDiv.style.display = 'block';

    // Update success details
    document.getElementById('transactionId').textContent = transactionId;
    document.getElementById('transactionDate').textContent = transactionDate;
    document.getElementById('amountPaid').textContent = `₹${amount}`;

    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Store registration data for bill download
    window.currentRegistration = registrationData;

    console.log('Success screen displayed');
}

function downloadBill() {
    const registrationData = window.currentRegistration ||
        JSON.parse(sessionStorage.getItem('lastTransaction')) ||
        JSON.parse(localStorage.getItem('registrations')).slice(-1)[0];

    if (!registrationData) {
        alert('Registration data not found!');
        return;
    }

    // Generate bill content
    const billContent = generateBillContent(registrationData);

    // Create and download text file
    downloadTextBill(billContent, registrationData.transactionId);

    // Also generate HTML bill
    generateHTMLBill(registrationData);
}

function generateBillContent(reg) {
    let membersList = `Team Leader:\n  • ${reg.leaderName}\n    SRN: ${reg.leaderSRN}\n    Phone: ${reg.leaderPhone}\n\n`;

    if (reg.members && reg.members.length > 0) {
        membersList += 'Team Members:\n';
        reg.members.forEach((member, i) => {
            membersList += `  ${i + 2}. ${member.name}\n     SRN: ${member.srn}\n     Phone: ${member.phone}\n\n`;
        });
    }

    const billContent = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          SAPTHAGIRI NPS UNIVERSITY                        ║
║          Hackathon Registration Receipt                   ║
║          UNMATCHED EXCELLENCE, UNLIMITED POTENTIAL        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    REGISTRATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hackathon Name   : ${reg.hackathonName}
Team Name        : ${reg.teamName}
Registration Date: ${reg.transactionDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      TEAM INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${membersList}
Total Team Members: ${reg.numMembers}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Registration Fee : ₹${reg.amountPaid}
Payment Method   : ${reg.paymentMethod || 'ONLINE'}
Payment Details  : ${reg.paymentDetails || 'N/A'}
Transaction ID   : ${reg.transactionId}
Payment Status   : ${reg.paymentStatus || 'COMPLETED'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           ✓ PAYMENT SUCCESSFUL - REGISTRATION CONFIRMED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        This is a computer-generated receipt.
        Thank you for registering with SNPS University!

╔═══════════════════════════════════════════════════════════╗
║           © 2025 Sapthagiri NPS University                ║
╚═══════════════════════════════════════════════════════════╝
    `;

    return billContent;
}

function downloadTextBill(billContent, transactionId) {
    const blob = new Blob([billContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SNPS_Registration_Receipt_${transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function generateHTMLBill(reg) {
    let memberRows = `
        <tr>
            <td>1</td>
            <td>${reg.leaderName}</td>
            <td>${reg.leaderSRN}</td>
            <td>${reg.leaderPhone}</td>
            <td><span class="badge">Leader</span></td>
        </tr>
    `;

    if (reg.members && reg.members.length > 0) {
        reg.members.forEach((member, i) => {
            memberRows += `
                <tr>
                    <td>${i + 2}</td>
                    <td>${member.name}</td>
                    <td>${member.srn}</td>
                    <td>${member.phone}</td>
                    <td><span class="badge badge-member">Member</span></td>
                </tr>
            `;
        });
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Receipt - ${reg.transactionId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            color: #333;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .success-badge {
            background: #10b981;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }
        .content { padding: 40px; }
        .section { margin-bottom: 35px; }
        .section-title {
            color: #1e40af;
            font-size: 1.3rem;
            margin-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; color: #1e40af; font-weight: 700; }
        .badge {
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        .payment-box {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #f59e0b;
        }
        .amount {
            font-size: 2.5rem;
            color: #d97706;
            font-weight: 900;
            margin: 10px 0;
        }
        .print-btn {
            background: #3b82f6;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
        }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Sapthagiri NPS University</h1>
            <p>HACKATHON REGISTRATION RECEIPT</p>
        </div>
        <div class="success-badge">✓ PAYMENT SUCCESSFUL</div>
        <div class="content">
            <div class="section">
                <h2 class="section-title">Registration Details</h2>
                <p><strong>Hackathon:</strong> ${reg.hackathonName}</p>
                <p><strong>Team:</strong> ${reg.teamName}</p>
                <p><strong>Date:</strong> ${reg.transactionDate}</p>
            </div>
            <div class="section">
                <h2 class="section-title">Team Members</h2>
                <table>
                    <thead>
                        <tr><th>#</th><th>Name</th><th>SRN</th><th>Phone</th><th>Role</th></tr>
                    </thead>
                    <tbody>${memberRows}</tbody>
                </table>
            </div>
            <div class="section">
                <h2 class="section-title">Payment</h2>
                <div class="payment-box">
                    <div class="amount">₹${reg.amountPaid}</div>
                    <p>Transaction ID: ${reg.transactionId}</p>
                </div>
            </div>
            <div style="text-align: center;">
                <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
            </div>
        </div>
    </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
}