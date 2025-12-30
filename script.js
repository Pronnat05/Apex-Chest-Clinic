document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('appointmentForm');
    const dateInput = document.getElementById('p-date');
    const slots = document.querySelectorAll('.slot');
    const modal = document.getElementById('successModal');
    const modalDetails = document.getElementById('modalDetails');
    let selectedSlotText = "";

    // 1. Function to Check and Disable Slots (Booked or Doctor-Blocked)
    function updateSlotAvailability() {
        const selectedDate = dateInput.value;
        if (!selectedDate) return;

        // Fetch data from storage
        const allAppointments = JSON.parse(localStorage.getItem('apexAppointments')) || [];
        const blockedByDoctor = JSON.parse(localStorage.getItem('blockedSlots')) || {};
        const dailyBlocked = blockedByDoctor[selectedDate] || [];

        // Reset all slots to default state first
        slots.forEach(slot => {
            slot.classList.remove('booked');
            slot.classList.remove('active');
            slot.disabled = false;
            slot.style.pointerEvents = "auto";
            // Restore original text if it was changed
            if(slot.getAttribute('data-time')) {
                slot.innerText = slot.getAttribute('data-time');
            }
        });

        // Loop through slots to apply restrictions
        slots.forEach(slot => {
            const slotTime = slot.innerText.trim();
            
            // Check if booked by another patient
            const isAlreadyBooked = allAppointments.some(app => 
                app.date === selectedDate && app.slot === slotTime
            );

            // Check if manually blocked by Dr. Gaurav
            const isBlockedByDoc = dailyBlocked.includes(slotTime);

            if (isAlreadyBooked || isBlockedByDoc) {
                slot.classList.add('booked');
                slot.disabled = true;
                slot.style.pointerEvents = "none";
                
                // Store original time and update text for clarity
                if(!slot.getAttribute('data-time')) {
                    slot.setAttribute('data-time', slotTime);
                }
                slot.innerText = isBlockedByDoc ? "Unavailable" : "Booked";
            }
        });
    }

    // 2. Refresh slots when the date changes
    dateInput.addEventListener('change', updateSlotAvailability);

    // 3. Slot Selection Logic
    slots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('booked')) return;

            // Clear previous selection
            slots.forEach(s => s.classList.remove('active'));
            
            // Set new selection
            this.classList.add('active');
            selectedSlotText = this.innerText;
        });
    });

    // 4. Form Submission Logic
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('p-name').value;
            const phone = document.getElementById('p-phone').value;
            const date = document.getElementById('p-date').value;
            const reportFile = document.getElementById('p-report').files[0];

            if (!selectedSlotText) {
                alert("Please select an available time slot.");
                return;
            }

            const finalizeBooking = (fileData = null) => {
                const newAppointment = {
                    name,
                    phone,
                    date,
                    slot: selectedSlotText,
                    report: fileData,
                    status: "Pending", // Default status
                    timestamp: new Date().getTime()
                };

                // Save to LocalStorage
                let appointments = JSON.parse(localStorage.getItem('apexAppointments')) || [];
                appointments.push(newAppointment);
                localStorage.setItem('apexAppointments', JSON.stringify(appointments));

                // Show Success Modal
                modalDetails.innerText = `Confirmed for ${name} on ${date} at ${selectedSlotText}.`;
                modal.style.display = 'flex';

                // Reset Form
                bookingForm.reset();
                selectedSlotText = "";
                updateSlotAvailability();
            };

            if (reportFile) {
                const reader = new FileReader();
                reader.onload = (event) => finalizeBooking(event.target.result);
                reader.readAsDataURL(reportFile);
            } else {
                finalizeBooking();
            }
        });
    }

    window.closeModal = function() {
        modal.style.display = 'none';
    };
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70, // Adjust for navbar height
                behavior: 'smooth'
            });
        }
    });
});