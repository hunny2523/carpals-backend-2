const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
// var fetchUser=require('../middleware/fetchUser');

const JWT_SECRET = 'HoneyPatel';

//create a user using:POST "api/auth/UserRegister" .no require login
// route 1
router.post('/UserRegister', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
    body('contactNo', 'enter a valid contact Number').isInt().isLength(10)
], async (req, res) => {
    // if there are errors return the error and request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        // check whether the user with this license number is exists already

        if (req.body.licenseNo) {
            let user = await User.findOne({ licenseNo: req.body.licenseNo });
            if (user) {
                return res.status(400).json({ error: "sorry a user with this License Number is already exists" });
            }
        }
        // check whether the user with this contact number is exists already
        if (req.body.contactNo) {
            let user = await User.findOne({ contactNo: req.body.contactNo });
            if (user) {
                return res.status(400).json({ error: "sorry a user with this Contact Number is already exists" });
            }
        }
        //  generate salt and create hash password for security
        const salt = await bcrypt.genSalt(10);
        secPassword = await bcrypt.hash(req.body.password, salt);

        const body = {
            name: req.body.name,
            password: secPassword,
            contactNo: req.body.contactNo,
        }
        // if in register form user will add licenseNo then it will store in database or else the default value will be stored as "passenger"
        if (req.body.licenseNo) {
            body.licenseNo = req.body.licenseNo
        }

        const user = await User.create(body)
        // give ID of user to create authToken
        const data = {
            id: user._id
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, license: user.licenseNo !== "passenger" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal error occur")
    }
})




// route 2
// login user at path"auth/api/UserLogin" login required
router.post('/UserLogin', [
    body('contactNo', 'enter a valid contact Number').isInt().isLength(10),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    // if there are errors return the error and request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { contactNo, password } = req.body;
    try {
        // check whether the user with this contact is exists already
        let user = await User.findOne({ contactNo });
        if (!user) {
            res.status(400).json({ errors: "Please login with correct credentials" });
        }
        // password compare with database password
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            res.status(400).json({ errors: "please login with correct credentials/password wrong" });
        }

        // give ID to create AuthToken
        const data = {
            user: user._id
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // also add license info to know if user is driver or passenger (if driver license=true else false)
        res.json({ authToken, license: user.licenseNo !== "passenger" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal error occur")
    }
});




// route3
// if passenger wants to be driver
// add exernally licence no
router.post('/UserLicence', async (req, res) => {
    // if there are errors return the error and request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // to find user's ID by authToken
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_SECRET);
        // check if already have licence number in database
        let user = await User.findOne({ licenseNo: req.body.license });
        if (user) {
            return res.status(400).json({ error: "sorry a user with this License Number is already exists" });
        }
        // find user and update license number in his/her data and response as license value is true
        else {
            user = await User.findByIdAndUpdate(data.user, { $set: { licenseNo: req.body.license } }, { new: true });
        }
        res.status(200).json({ license: true });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal error occur")
    }
});

module.exports = router