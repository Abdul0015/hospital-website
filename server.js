const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospital', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define schemas
const bedSchema = new mongoose.Schema({
    hospital: String,
    bedNumber: Number,
    isOccupied: { type: Boolean, default: false },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
});

const appointmentSchema = new mongoose.Schema({
    patientName: String,
    patientAge: Number,
    patientGender: String,
    doctor: String,
    appointmentType: String,
    appointmentDate: Date,
    appointmentTime: String,
    hospital: String,
    bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' }
});

// Models
const Bed = mongoose.model('Bed', bedSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Define available time slots
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
];

// Route to get available time slots for a doctor
app.get('/api/time-slots', (req, res) => {
    res.json(timeSlots);
});

// Route to get doctors for a specific hospital
app.get('/api/doctors/:hospital', async (req, res) => {
    const { hospital } = req.params;
    // Assuming doctors are predefined for simplicity
    const doctors = {
        hospital1: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'],
        hospital2: ['Dr. Brown', 'Dr. Jones', 'Dr. Garcia'],
        hospital3: ['Dr. Miller', 'Dr. Davis', 'Dr. Rodriguez']
    };

    res.json(doctors[hospital] || []);
});

// Route to get available beds for a hospital
app.get('/api/beds/:hospital', async (req, res) => {
    const { hospital } = req.params;
    const beds = await Bed.find({ hospital });
    res.json(beds);
});

// Route to book an appointment
app.post('/api/appointment', async (req, res) => {
    const {
        patientName, patientAge, patientGender, doctor,
        appointmentType, appointmentDate, appointmentTime, hospital
    } = req.body;

    // Find available bed
    const availableBed = await Bed.findOne({ hospital, isOccupied: false }).exec();
    if (!availableBed) {
        return res.status(400).json({ error: 'No beds available' });
    }

    // Create new appointment
    const appointment = new Appointment({
        patientName,
        patientAge,
        patientGender,
        doctor,
        appointmentType,
        appointmentDate,
        appointmentTime,
        hospital,
        bed: availableBed._id
    });

    // Mark bed as occupied
    availableBed.isOccupied = true;
    availableBed.appointment = appointment._id;

    await appointment.save();
    await availableBed.save();

    res.json(appointment);
});

// Route to extend an appointment
app.put('/api/appointment/extend/:id', async (req, res) => {
    const { id } = req.params;
    const { extensionDays } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const newDate = new Date(appointment.appointmentDate);
    newDate.setDate(newDate.getDate() + extensionDays);
    appointment.appointmentDate = newDate;

    await appointment.save();
    res.json(appointment);
});

// Route to discharge a patient
app.put('/api/appointment/discharge/:id', async (req, res) => {
    const { id } = req.params;

    // Find and update appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const bed = await Bed.findById(appointment.bed);
    bed.isOccupied = false;
    bed.appointment = null;

    await bed.save();
    await appointment.remove();

    res.json({ message: 'Patient discharged and bed released' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
