document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('appointmentForm');
    const dateInput = document.getElementById('p-date');
    const slots = document.querySelectorAll('.slot');
    const modal = document.getElementById('successModal');
    const modalDetails = document.getElementById('modalDetails');
    let selectedSlotText = "";

    
    function updateSlotAvailability() {
        const selectedDate = dateInput.value;
        if (!selectedDate) return;

        // Reset all slots to default state first
        slots.forEach(slot => {
            slot.classList.remove('booked');
            slot.classList.remove('active');
            slot.disabled = false;
            slot.style.pointerEvents = "auto";
            if(slot.getAttribute('data-time')) {
                slot.innerText = slot.getAttribute('data-time');
            }
        });

        
        database.ref('appointments').orderByChild('date').equalTo(selectedDate).on('value', (snapshot) => {
            const appointments = snapshot.val() || {};
            const bookedTimes = Object.values(appointments).map(a => a.slot);

           
            database.ref('blockedSlots/' + selectedDate).on('value', (blockSnapshot) => {
                const dailyBlocked = blockSnapshot.val() || [];

                
                slots.forEach(slot => {
                    const slotTime = slot.innerText.trim();
                    
                    const isAlreadyBooked = bookedTimes.includes(slotTime);
                    const isBlockedByDoc = dailyBlocked.includes(slotTime);

                    if (isAlreadyBooked || isBlockedByDoc) {
                        slot.classList.add('booked');
                        slot.disabled = true;
                        slot.style.pointerEvents = "none";
                        
                        if(!slot.getAttribute('data-time')) {
                            slot.setAttribute('data-time', slotTime);
                        }
                        slot.innerText = isBlockedByDoc ? "Unavailable" : "Booked";
                    }
                });
            });
        });
    }

    
    dateInput.addEventListener('change', updateSlotAvailability);

    
    slots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('booked')) return;
            slots.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            selectedSlotText = this.getAttribute('data-time') || this.innerText;
        });
    });

   
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
                    status: "Pending",
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };

                
                database.ref('appointments').push(newAppointment)
                    .then(() => {
                        
                        modalDetails.innerText = `Confirmed for ${name} on ${date} at ${selectedSlotText}.`;
                        modal.style.display = 'flex';

                        
                        bookingForm.reset();
                        selectedSlotText = "";
                        updateSlotAvailability();
                    })
                    .catch((error) => {
                        alert("Error saving appointment: " + error.message);
                    });
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
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

