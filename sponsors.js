// Sponsor Management System

// Initialize sponsors if not exists
function initSponsors() {
    if (!localStorage.getItem('sponsors')) {
        localStorage.setItem('sponsors', JSON.stringify([]));
    }
}

// Get all sponsors
function getAllSponsors() {
    return JSON.parse(localStorage.getItem('sponsors')) || [];
}

// Add sponsor
function addSponsor(name, tier, website, logoBase64) {
    const sponsors = getAllSponsors();

    const newSponsor = {
        id: Date.now(),
        name: name,
        tier: tier,
        website: website,
        logo: logoBase64,
        addedAt: new Date().toLocaleString('en-IN'),
        addedTimestamp: Date.now()
    };

    sponsors.push(newSponsor);
    localStorage.setItem('sponsors', JSON.stringify(sponsors));

    console.log('✓ Sponsor added:', newSponsor);
    return newSponsor;
}

// Delete sponsor
function deleteSponsor(sponsorId) {
    const sponsors = getAllSponsors();
    const updatedSponsors = sponsors.filter(s => s.id !== sponsorId);
    localStorage.setItem('sponsors', JSON.stringify(updatedSponsors));

    console.log('✓ Sponsor deleted:', sponsorId);
    return true;
}

// Update sponsor
function updateSponsor(sponsorId, updates) {
    const sponsors = getAllSponsors();
    const index = sponsors.findIndex(s => s.id === sponsorId);

    if (index === -1) return false;

    sponsors[index] = {...sponsors[index], ...updates };
    localStorage.setItem('sponsors', JSON.stringify(sponsors));

    console.log('✓ Sponsor updated:', sponsorId);
    return true;
}

// Get sponsor tiers
function getSponsorTiers() {
    return [
        { value: 'platinum', label: 'Platinum Sponsor', icon: '💎', color: '#e5e4e2' },
        { value: 'gold', label: 'Gold Sponsor', icon: '🥇', color: '#ffd700' },
        { value: 'silver', label: 'Silver Sponsor', icon: '🥈', color: '#c0c0c0' },
        { value: 'bronze', label: 'Bronze Sponsor', icon: '🥉', color: '#cd7f32' },
        { value: 'community', label: 'Community Partner', icon: '🤝', color: '#4a90e2' }
    ];
}

// Get tier info
function getTierInfo(tierValue) {
    const tiers = getSponsorTiers();
    return tiers.find(t => t.value === tierValue) || tiers[4];
}

// Convert image file to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file provided');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            reject('File must be an image');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            reject('Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            resolve(e.target.result);
        };

        reader.onerror = function() {
            reject('Error reading file');
        };

        reader.readAsDataURL(file);
    });
}

// Initialize on load
initSponsors();