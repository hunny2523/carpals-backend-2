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
        console.log(req.body)
        if (req.body.licenseNo) {
            let user = await User.findOne({ licenseNo: req.body.licenseNo });
            if (user) {
                return res.status(400).json({ error: "sorry a user with this License Number is already exists" });
            }
        }
        if (req.body.contactNo) {
            let user = await User.findOne({ contactNo: req.body.contactNo });
            if (user) {
                return res.status(400).json({ error: "sorry a user with this Contact Number is already exists" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        secPassword = await bcrypt.hash(req.body.password, salt);
        
        const body={
            name: req.body.name,
            password: secPassword,
            contactNo: req.body.contactNo,
        }
        if (req.body.licenseNo) {
            console.log("if works");
            body.licenseNo= req.body.licenseNo
        }
        const user = await User.create(body)

        // const user = new User({
        //     name: req.body.name,
        //     password: secPassword,
        //     contactNo: req.body.contactNo,
        //     licenseNo:req.body.licenseNo
        // })

        // console.log(user)
        // await user.save();
        const data = {
                id: user._id
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, user });
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
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            res.status(400).json({ errors: "please login with correct credentials/password wrong" });
        }
        const data = {
                user: user._id
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, license: user.licenseNo !== "passenger" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal error occur")
    }
});
module.exports = router