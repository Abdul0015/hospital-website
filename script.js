// Example data structure for hospitals and their respective doctors
const hospitalDoctors = {
    hospital1: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'],
    hospital2: ['Dr. Brown', 'Dr. Jones', 'Dr. Garcia'],
    hospital3: ['Dr. Miller', 'Dr. Davis', 'Dr. Rodriguez']
};

// Function to update doctors based on selected hospital
function updateDoctors() {
    const selectedHospital = document.getElementById('hospitalSelect').value;
    const doctorSelect = document.getElementById('doctorSelect');

    // Clear previous options
    doctorSelect.innerHTML = '';

    // Add new options based on selected hospital
    const doctors = hospitalDoctors[selectedHospital];
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor;
        option.textContent = doctor;
        doctorSelect.appendChild(option);
    });

    // Clear time slots if hospital changes
    document.getElementById('appointmentTime').innerHTML = '<option value="" disabled selected>Select a time slot</option>';
}

// Function to update available time slots based on doctor availability
function updateTimeSlots() {
    const timeSelect = document.getElementById('appointmentTime');
    timeSelect.innerHTML = ''; // Clear previous time slots

    // Define available time slots
    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM'
    ];

    // Add the available time slots as options in the dropdown
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSelect.appendChild(option);
    });
}

// Function to book an appointment
async function bookAppointment() {
    const selectedHospital = document.getElementById('hospitalSelect').value;
    const doctor = document.getElementById('doctorSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const appointmentType = document.getElementById('appointmentType').value;
    const patientName = document.getElementById('patientName').value;
    const patientAge = document.getElementById('patientAge').value;
    const patientGender = document.getElementById('patientGender').value;
    const appointmentStatus = document.getElementById('appointmentStatus');

    // Check if all fields are filled
    if (doctor && date && time && appointmentType && patientName && patientAge && patientGender) {
        const appointmentData = {
            patientName, patientAge, patientGender, doctor,
            appointmentType, appointmentDate: new Date(date), appointmentTime: time, hospital: selectedHospital
        };

        try {
            const response = await fetch('http://localhost:3000/api/appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });
            const result = await response.json();

            if (response.ok) {
                // Display success message
                appointmentStatus.textContent = `Appointment booked with ${doctor} for ${patientName}, Age: ${patientAge}, Gender: ${patientGender} on ${date} at ${time}.`;
                appointmentStatus.style.color = 'green';
            } else {
                // Display error message from the server
                appointmentStatus.textContent = result.error;
                appointmentStatus.style.color = 'red';
            }
        } catch (error) {
            // Display generic error message
            appointmentStatus.textContent = 'Error booking appointment.';
            appointmentStatus.style.color = 'red';
        }
    } else {
        // Display message if any field is missing
        appointmentStatus.textContent = 'Please fill in all fields.';
        appointmentStatus.style.color = 'red';
    }
}

// Initial load for the default selected hospital
updateDoctors();
