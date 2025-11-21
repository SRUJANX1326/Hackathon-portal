// Coordinator Sponsor Management

function loadCoordinatorSponsors() {
    const sponsorsList = document.getElementById('sponsorsListCoord');
    if (!sponsorsList) return;

    const sponsors = getAllSponsors();

    if (sponsors.length === 0) {
        sponsorsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🤝</div>
                <h3>No Sponsors Added</h3>
                <p>Add sponsors to showcase your event partners and supporters.</p>
                <button onclick="openAddSponsorModal()" class="btn btn-primary">Add First Sponsor</button>
            </div>
        `;
        return;
    }

    sponsorsList.innerHTML = '';

    const tierPriority = { platinum: 1, gold: 2, silver: 3, bronze: 4, community: 5 };
    sponsors.sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier]);

    sponsors.forEach(sponsor => {
                const tierInfo = getTierInfo(sponsor.tier);

                const card = document.createElement('div');
                card.className = 'sponsor-manage-card';

                card.innerHTML = `
            <div class="sponsor-manage-header">
                <span class="sponsor-tier-badge" style="background: ${tierInfo.color};">
                    ${tierInfo.icon} ${tierInfo.label}
                </span>
                <button onclick="deleteSponsorConfirm(${sponsor.id})" class="btn-delete" title="Delete Sponsor">
                    🗑️
                </button>
            </div>
            <div class="sponsor-logo-container">
                <img src="${sponsor.logo}" alt="${sponsor.name}" class="sponsor-logo-large">
            </div>
            <div class="sponsor-info">
                <h3>${sponsor.name}</h3>
                ${sponsor.website ? `<a href="${sponsor.website}" target="_blank" class="sponsor-website">🔗 Visit Website</a>` : ''}
                <p class="sponsor-date">Added: ${sponsor.addedAt}</p>
            </div>
        `;
        
        sponsorsList.appendChild(card);
    });
}

function openAddSponsorModal() {
    const modal = document.getElementById('addSponsorModal');
    modal.style.display = 'block';
    document.getElementById('addSponsorForm').reset();
    document.getElementById('logoPreview').innerHTML = '';
}

function closeAddSponsorModal() {
    document.getElementById('addSponsorModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const logoInput = document.getElementById('sponsorLogo');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('logoPreview');
                    preview.innerHTML = `
                        <img src="${event.target.result}" alt="Logo Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #e5e7eb;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    const addSponsorForm = document.getElementById('addSponsorForm');
    if (addSponsorForm) {
        addSponsorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('sponsorName').value.trim();
            const tier = document.getElementById('sponsorTier').value;
            const website = document.getElementById('sponsorWebsite').value.trim();
            const logoFile = document.getElementById('sponsorLogo').files[0];
            
            if (!name || !tier || !logoFile) {
                alert('Please fill all required fields!');
                return;
            }
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '⏳ Uploading...';
            submitBtn.disabled = true;
            
            try {
                const logoBase64 = await convertImageToBase64(logoFile);
                addSponsor(name, tier, website, logoBase64);
                closeAddSponsorModal();
                loadCoordinatorSponsors();
                
                if (typeof showToast === 'function') {
                    showToast('✓ Sponsor added successfully!');
                } else {
                    alert('✓ Sponsor added successfully!');
                }
                
            } catch (error) {
                alert('❌ Error: ' + error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

function deleteSponsorConfirm(sponsorId) {
    const sponsors = getAllSponsors();
    const sponsor = sponsors.find(s => s.id === sponsorId);
    
    if (!sponsor) {
        alert('Sponsor not found!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${sponsor.name}"?\n\nThis action cannot be undone.`)) {
        deleteSponsor(sponsorId);
        loadCoordinatorSponsors();
        
        if (typeof showToast === 'function') {
            showToast('✓ Sponsor deleted successfully!');
        } else {
            alert('✓ Sponsor deleted!');
        }
    }
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('addSponsorModal');
    if (event.target === modal) {
        closeAddSponsorModal();
    }
});

window.openAddSponsorModal = openAddSponsorModal;
window.closeAddSponsorModal = closeAddSponsorModal;
window.deleteSponsorConfirm = deleteSponsorConfirm;
window.loadCoordinatorSponsors = loadCoordinatorSponsors;