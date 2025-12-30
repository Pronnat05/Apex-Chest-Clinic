// 1. Configuration & Security
if (localStorage.getItem('isDoctorLoggedIn') !== 'true') {
    window.location.href = "login.html";
}

const allClinicSlots = ["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"];

document.addEventListener('DOMContentLoaded', function() {
    autoClearOldVisitedPatients();
    
    // Set Date Display
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.innerText = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    if (!sessionStorage.getItem('welcomeShown')) {
        document.getElementById('doctorWelcomeModal').style.display = 'flex';
        sessionStorage.setItem('welcomeShown', 'true');
    }

    renderTable();
});

// 2. Midnight Cleanup Logic
function autoClearOldVisitedPatients() {
    const today = new Date().toISOString().split('T')[0];
    const lastCleanup = localStorage.getItem('lastCleanupDate');

    if (lastCleanup !== today) {
        let allAppointments = JSON.parse(localStorage.getItem('apexAppointments')) || [];
        const updated = allAppointments.filter(app => app.status !== "Completed");
        localStorage.setItem('apexAppointments', JSON.stringify(updated));
        localStorage.setItem('lastCleanupDate', today);
    }
}

// 3. Slot Availability Manager (NEW)
window.loadAvailability = function() {
    const date = document.getElementById('manage-date').value;
    const container = document.getElementById('slot-manager-container');
    if (!date) return;

    // Get blocked slots from storage
    const blockedData = JSON.parse(localStorage.getItem('blockedSlots')) || {};
    const dailyBlocked = blockedData[date] || [];

    container.innerHTML = "";
    
    allClinicSlots.forEach(slot => {
        const isBlocked = dailyBlocked.includes(slot);
        const btn = document.createElement('button');
        btn.innerText = slot;
        
        // Styling the button based on status
        btn.style.padding = "10px";
        btn.style.borderRadius = "8px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.fontWeight = "bold";
        btn.style.transition = "0.3s";
        
        if (isBlocked) {
            btn.style.background = "#ef4444"; // Red for Blocked
            btn.style.color = "white";
        } else {
            btn.style.background = "rgba(56, 189, 248, 0.1)"; // Blue tint for Available
            btn.style.color = "#38bdf8";
            btn.style.border = "1px solid #38bdf8";
        }

        btn.onclick = () => toggleSlot(date, slot);
        container.appendChild(btn);
    });
};

window.toggleSlot = function(date, slot) {
    let blockedData = JSON.parse(localStorage.getItem('blockedSlots')) || {};
    if (!blockedData[date]) blockedData[date] = [];

    if (blockedData[date].includes(slot)) {
        // Unblock
        blockedData[date] = blockedData[date].filter(s => s !== slot);
    } else {
        // Block
        blockedData[date].push(slot);
    }

    localStorage.setItem('blockedSlots', JSON.stringify(blockedData));
    loadAvailability(); // Refresh UI
};

// 4. Patient Table Rendering
function renderTable(filteredData = null) {
    const tableBody = document.getElementById('appointmentTableBody');
    const allAppointments = JSON.parse(localStorage.getItem('apexAppointments')) || [];
    const dataToDisplay = filteredData || allAppointments;

    document.getElementById('totalCount').innerText = dataToDisplay.length;
    tableBody.innerHTML = "";

    dataToDisplay.forEach((app, index) => {
        const isDone = app.status === "Completed";
        const row = document.createElement('tr');
        if (isDone) row.classList.add('row-completed');

        row.innerHTML = `
            <td style="color: ${isDone ? '#10b981' : '#38bdf8'}; font-weight: 800;">${app.slot}</td>
            <td style="font-weight: 700; color: white;">${app.name}</td>
            <td style="color: white;">${app.phone}</td>
            <td style="color: #cbd5e1;">${app.date}</td>
            <td>${app.report ? `<a href="${app.report}" target="_blank" style="color: #38bdf8;">VIEW</a>` : 'NONE'}</td>
            <td>
                ${isDone ? `<span class="status-badge status-done">✓ Visited</span>` : 
                `<button class="btn-action" onclick="markAsDone(${index})">MARK DONE</button>`}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 5. Action Functions
window.markAsDone = function(index) {
    let allAppointments = JSON.parse(localStorage.getItem('apexAppointments')) || [];
    allAppointments[index].status = "Completed";
    localStorage.setItem('apexAppointments', JSON.stringify(allAppointments));
    renderTable();
};

window.searchPatients = function() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const all = JSON.parse(localStorage.getItem('apexAppointments')) || [];
    const filtered = all.filter(a => a.name.toLowerCase().includes(term) || a.phone.includes(term));
    renderTable(filtered);
};

window.logout = function() {
    localStorage.removeItem('isDoctorLoggedIn');
    window.location.href = "index.html";
};

window.closeDoctorModal = function() {
    document.getElementById('doctorWelcomeModal').style.display = 'none';
};