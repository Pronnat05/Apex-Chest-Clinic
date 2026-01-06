
if (localStorage.getItem('isDoctorLoggedIn') !== 'true') {
    window.location.href = "login.html";
}

const allClinicSlots = ["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"];

document.addEventListener('DOMContentLoaded', function() {
   
    autoClearOldVisitedPatients();
    
  
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

    database.ref('appointments').on('value', (snapshot) => {
        const data = snapshot.val();
        let appts = [];
        for (let id in data) {
            appts.push({ firebaseId: id, ...data[id] });
        }
      
        window.allAppts = appts;
        renderTable(appts);
    });
});


function autoClearOldVisitedPatients() {
    const today = new Date().toISOString().split('T')[0];
    const lastCleanup = localStorage.getItem('lastCleanupDate');

    if (lastCleanup !== today) {
        
        
        localStorage.setItem('lastCleanupDate', today);
    }
}

window.loadAvailability = function() {
    const date = document.getElementById('manage-date').value;
    const container = document.getElementById('slot-manager-container');
    if (!date) return;

    
    database.ref('blockedSlots/' + date).on('value', (snapshot) => {
        const dailyBlocked = snapshot.val() || [];
        container.innerHTML = "";
        
        allClinicSlots.forEach(slot => {
            const isBlocked = dailyBlocked.includes(slot);
            const btn = document.createElement('button');
            btn.innerText = slot;
            
            btn.style.padding = "10px";
            btn.style.borderRadius = "8px";
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "bold";
            btn.style.transition = "0.3s";
            
            if (isBlocked) {
                btn.style.background = "#ef4444"; 
                btn.style.color = "white";
            } else {
                btn.style.background = "rgba(56, 189, 248, 0.1)"; 
                btn.style.color = "#38bdf8";
                btn.style.border = "1px solid #38bdf8";
            }

            btn.onclick = () => toggleSlot(date, slot, dailyBlocked);
            container.appendChild(btn);
        });
    });
};

window.toggleSlot = function(date, slot, currentBlocked) {
    let updatedBlocked = currentBlocked.includes(slot) 
        ? currentBlocked.filter(s => s !== slot) 
        : [...currentBlocked, slot];

    
    database.ref('blockedSlots/' + date).set(updatedBlocked);
};


function renderTable(dataToDisplay) {
    const tableBody = document.getElementById('appointmentTableBody');
    if (!tableBody) return;

    document.getElementById('totalCount').innerText = dataToDisplay.length;
    tableBody.innerHTML = "";

    
    dataToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));

    dataToDisplay.forEach((app) => {
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
                `<button class="btn-action" onclick="markAsDone('${app.firebaseId}')">MARK DONE</button>`}
            </td>
        `;
        tableBody.appendChild(row);
    });
}


window.markAsDone = function(firebaseId) {
    database.ref('appointments/' + firebaseId).update({
        status: "Completed"
    });
    
};

window.searchPatients = function() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = window.allAppts.filter(a => 
        a.name.toLowerCase().includes(term) || a.phone.includes(term)
    );
    renderTable(filtered);
};

window.logout = function() {
    localStorage.removeItem('isDoctorLoggedIn');
    window.location.href = "index.html";
};

window.closeDoctorModal = function() {
    document.getElementById('doctorWelcomeModal').style.display = 'none';
};

