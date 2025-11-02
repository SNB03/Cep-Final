const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assuming the following models/utilities exist in their respective paths
const Issue = require('../models/Issue'); 
const User = require('../models/User'); 
const { protect, authorize } = require('../middleware/auth'); 

// 🚨 Imports required for anonymous submission logic
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');


// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 1000000 } }); 

// --- In-Memory OTP Store (For anonymous submissions) ---
const otpStore = new Map();


// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
    user: process.env.user, // Your Gmail address (or another service user)
    pass: process.env.pass  // Your App Password
    }
});


// Helper functions
const generateTicketId = (type) => {
    const prefix = type === 'pothole' ? 'P' : (type === 'waste' ? 'W' : 'X');
    return `${prefix}-${Date.now().toString().slice(-6)}`;
};

// --- Function to send OTP email (FULL IMPLEMENTATION) ---
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: '"Spot & Sort Verification" <noreply@spotsort.com>', 
        to: email,
        subject: `🔒 Your Verification Code is: ${otp}`,
        html: `<p>Your verification code for your issue report is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification OTP sent to ${email}.`);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("OTP email service failed to send code. Check USER_EMAIL/EMAIL_PASS in .env.");
    }
};

// --- Function to send FINAL Report ID email (FULL IMPLEMENTATION) ---
const sendReportIdEmail = async (email, ticketId) => {
    const mailOptions = {
        from: '"Spot & Sort Reporting" <noreply@spotsort.com>', 
        to: email,
        subject: `✅ Issue Report Submitted - Your Tracking ID: ${ticketId}`,
        html: `<p>Thank you for reporting! Your unique Tracking ID is: <strong>${ticketId}</strong>.</p>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Report ID email sent to ${email} with Ticket ID: ${ticketId}`);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        // We throw an error but continue the response since the report is saved
        throw new Error("Confirmation email failed to send."); 
    }
};


// ----------------------------------------------------------------------------------
// 🛠️ 1. AUTHENTICATED SUBMISSION (POST /api/issues)
// ----------------------------------------------------------------------------------
router.post('/', protect, authorize(['citizen', 'admin']), (req, res) => {
    upload.single('issueImage')(req, res, async (err) => {
        // ... (Authenticated submission logic remains the same) ...
        if (err) { return res.status(400).json({ message: err.message || 'File upload error.' }); }
        if (!req.file) { return res.status(400).json({ message: 'No image file provided.' }); }

        const { issueType, description, lat, lng, title, zone } = req.body; 
        
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        if (isNaN(parsedLat) || isNaN(parsedLng)) {
             if (req.file.path) fs.unlinkSync(req.file.path); 
             return res.status(400).json({ message: 'Invalid GPS coordinates provided. Please re-pin the location.' });
        }
        
        if (!title || !zone || !description) {
            if (req.file.path) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Title, Description, and Zone fields are required.' });
        }
        
        if (!req.user || !req.user._id) {
            if (req.file.path) fs.unlinkSync(req.file.path);
            return res.status(401).json({ message: "Authorization failed. Please log in again." });
        }

        try {
            const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
            
            const newIssue = await Issue.create({
                ticketId, title, issueType, description, 
                lat: parsedLat, lng: parsedLng, 
                issueImageUrl: `uploads/${req.file.filename}`, 
                reporter: req.user._id, 
                zone, status: 'Pending', 
            });

            res.status(201).json({ message: 'Report submitted successfully.', ticketId: newIssue.ticketId, status: newIssue.status });
        } catch (error) {
            console.error("Authenticated Submission Error:", error.message, error); 
            if (req.file.path) fs.unlinkSync(req.file.path);
            const specificMessage = error.name === 'ValidationError' ? 
                                    `Validation Failed: ${Object.values(error.errors).map(val => val.message).join(', ')}` : 
                                    'Server error during issue creation.';
            res.status(500).json({ message: specificMessage, details: error.message });
        }
    });
});


// ----------------------------------------------------------------------------------
// 🛠️ 2. ANONYMOUS STEP 1: REQUEST OTP (POST /api/issues/otp-send) - NOW CALLS WORKING EMAIL HELPER
// ----------------------------------------------------------------------------------
router.post('/otp-send', async (req, res) => {
    const { reporterName, reporterEmail, reporterMobile, issueType, description, lat, lng } = req.body;
    
    if (!reporterEmail || !description) {
        return res.status(400).json({ message: 'Missing required contact or issue details.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempId = Date.now().toString(36); 

    try {
        await sendOTPEmail(reporterEmail, otp); // 🔥 This now calls the implemented function

        otpStore.set(tempId, { 
            otp, 
            reporterEmail,
            reporterData: { reporterName, reporterMobile, issueType, description, lat, lng }
        });
        
        setTimeout(() => otpStore.delete(tempId), 600000); 

        res.status(200).json({ 
            message: 'Verification code sent to email.',
            tempId 
        });
    } catch (err) {
        console.error(err);
        // The error message from the email helper is used here
        res.status(500).json({ message: err.message });
    }
});


// ----------------------------------------------------------------------------------
// 🛠️ 3. ANONYMOUS STEP 2: VERIFY OTP AND SUBMIT FINAL REPORT (POST /api/issues/anonymous)
// ----------------------------------------------------------------------------------
router.post('/anonymous', upload.single('issueImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Issue image is required.' });
        // ... (rest of anonymous verification logic) ...

        const { enteredOtp, tempId } = req.body;
        const storedData = otpStore.get(tempId);
        
        if (!storedData) {
            fs.unlinkSync(req.file.path); 
            return res.status(400).json({ message: 'Verification session expired or invalid.' });
        }

        if (enteredOtp !== storedData.otp) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        otpStore.delete(tempId); 
        
        const { reporterEmail, reporterData } = storedData;
        
        // Find or Create Citizen User
        let citizen = await User.findOne({ email: reporterEmail, role: 'citizen' });
        if (!citizen) {
            const randomPassword = await bcrypt.hash(Math.random().toString(), 10);
            citizen = new User({
                // ... user creation details
                name: reporterData.reporterName || 'Anonymous Citizen', 
                email: reporterEmail, 
                password: randomPassword,
                mobileNumber: reporterData.reporterMobile || 'N/A', 
                gender: 'other', 
                dateOfBirth: new Date(),
                role: 'citizen', 
                zone: 'Central'
            });
            await citizen.save();
        }

        // Create the Issue
        const newIssue = new Issue({
            ticketId: generateTicketId(reporterData.issueType),
            reporter: citizen._id,
            issueType: reporterData.issueType,
            title: reporterData.description.substring(0, 50),
            description: reporterData.description,
            lat: reporterData.lat,
            lng: reporterData.lng,
            issueImageUrl: req.file.path, 
            zone: 'Central'
        });

        await newIssue.save();

        await sendReportIdEmail(reporterEmail, newIssue.ticketId); // 🔥 This now sends the ID

        res.status(201).json({ 
            message: 'Report submitted successfully. Check your email for the ID.', 
            ticketId: newIssue.ticketId 
        });

    } catch (err) {
        console.error(err);
        if (req.file?.path) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message || 'Failed to finalize report submission.' });
    }
});


// ----------------------------------------------------------------------------------
// 🛠️ 4. DATA RETRIEVAL: GET MY REPORTS (GET /api/issues/my-reports)
// ----------------------------------------------------------------------------------
// ... (The rest of the routes remain the same) ...
router.get('/my-reports', protect, authorize(['citizen']), async (req, res) => {
    try {
        const issues = await Issue.find({ reporter: req.user._id }).sort({ reportedAt: -1 });
        const mappedIssues = issues.map(issue => ({
            ticketId: issue.ticketId, issueType: issue.issueType, status: issue.status,
            date: issue.createdAt.toISOString().split('T')[0], description: issue.description,
        }));
        res.json(mappedIssues);
    } catch (error) {
        console.error("Error fetching citizen reports:", error);
        res.status(500).json({ message: 'Failed to retrieve your reports.' });
    }
});
// ----------------------------------------------------------------------------------
// 🛠️ 5. OTHER DATA ROUTES 
// ----------------------------------------------------------------------------------
router.get('/track/:ticketId', async (req, res) => {
    const issue = await Issue.findOne({ ticketId: req.params.ticketId }).select('ticketId status description reportedAt');
    if (issue) { res.json(issue); } else { res.status(404).json({ message: 'Ticket ID not found.' }); }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
    const issues = await Issue.find().populate('reporter', 'name email').populate('assignedTo', 'name email');
    res.json(issues);
});

router.put('/:id/status', protect, authorize(['authority', 'admin']), async (req, res) => {
    const { status, resolutionDetails } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (issue) {
        issue.status = status || issue.status;
        issue.resolutionDetails = resolutionDetails || issue.resolutionDetails;
        if (status === 'Closed' && !issue.resolutionDate) { issue.resolutionDate = new Date(); }
        const updatedIssue = await issue.save();
        res.json(updatedIssue);
    } else { res.status(404).json({ message: 'Issue not found' }); }
});

// Use upload.single('resolutionImage') directly in the PUT route
router.put('/:ticketId/resolve', protect, authorize('authority'), upload.single('resolutionImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Resolution image is required.' });

        const issue = await Issue.findOneAndUpdate(
            { ticketId: req.params.ticketId, zone: req.user.zone }, 
            { 
                status: 'Awaiting Verification', 
                resolutionImageUrl: req.file.path // Store file path
            },
            { new: true }
        );

        if (!issue) return res.status(404).json({ message: 'Issue not found or not assigned to your zone.' });

        res.json({ 
            message: 'Resolution submitted. Awaiting verification.', 
            newStatus: issue.status 
        });
    } catch (err) {
        console.error("Resolution Submission Error:", err);
        res.status(500).json({ message: 'Failed to submit resolution proof.' });
    }
});


router.put('/:ticketId/verify', async (req, res) => {
    const { email } = req.body;
    try {
        const reporter = await User.findOne({ email, role: 'citizen' });
        if (!reporter) return res.status(403).json({ message: 'Reporter email not found or unauthorized.' });

        const issue = await Issue.findOneAndUpdate(
            { ticketId: req.params.ticketId, reporter: reporter._id },
            { 
                status: 'Closed', 
            },
            { new: true }
        );

        if (!issue) return res.status(404).json({ message: 'Issue not found or email does not match the reporter.' });

        res.json({ message: 'Issue successfully verified and closed.', newStatus: issue.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to verify issue.' });
    }
});


module.exports = router;