const router = require("express").Router();
const Request = require("../models/Request");
const User = require("../models/User");
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const req = require("express/lib/request");

const JWT_SECRET = "HoneyPatel"


// create Request 
// for driver Side
router.post("/", [
    body('start', 'Enter a valid start place').isLength({ min: 3 }),
    body('end', 'Enter a valid end place').isLength({ min: 5 }),
    body('passengers', 'enter a valid passenger Number').isInt().isLength({ max: 10 }),
    body('vehicleNo', 'enter a valid vehicle number').isLength({ min: 8 }),
    body('vehicleType', 'enter a valid vehicle Type').isLength({ max: 10 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        // check if user with same vehicle number is already exists
        let request = await Request.findOne({ vehicleNo: req.body.vehicleNo });
        if (request) {
            return res.status(400).json({ error: "sorry a user with this vehicle Number is already exists" });
        }
        // take authToken from reqest body to find User's Id who created this request
        //  this ID will be stored in Data of Request as UserID
        const token = await req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_SECRET);
        
        const newRequest = new Request({
            ...req.body,
            userId: data.user
        })

        const savedRequest = await newRequest.save();
        res.status(200).json(savedRequest);

    } catch (err) {
        console.log(err.message);
        res.status(500).json(err);
    }
});



// delete a Request
// now it is not used in frontEnd Side
router.delete("/:id", async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (request.userId === req.body.userId) {
            await request.deleteOne({ $set: req.body });
            res.status(200).json("Request has been deleted");
        } else {
            res.status(403).json("you can delete only your Request");
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json(err);
    }
});



// accept a Request
// passenger will accept Driver created request and response driver's info who has created request
router.put("/:id/accept", async (req, res) => {
    try {

        // find passengers's ID from authToken to add in request followers
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_SECRET);

        const request = await Request.findById(req.params.id);
        // find driver from request's userID
        const user = await User.findById(request.userId);

        if (!request.followers.includes(data.user)) {
            await Request.updateOne({ $push: { followers: data.user } });
        }
        const driver = {
            contact: user.contactNo,
            Name: user.name,
        }
        res.status(200).json(driver)
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err)
    }
});


// get a Request
// To get request from it's ID 
// it is not used in frontend
router.get("/:id", async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        res.status(200).json(request);
    } catch (err) {
        res.status(500).json(err);
    }
})


// get timeline Requests
// To get all request from all drivers
router.post("/timeline/requests", async (req, res) => {
    try {
        // if there is no start city then all request will be shown and it will be in ascending order
        if (req.body.start === "default") {
            const requests = await Request.find().sort({ date: -1 });
            return res.status(200).json(requests);
        }
        // if the city is defind then response will be for that particular city
        else {
            const requests = await Request.find({ start: req.body.start }).sort({ date: -1 });
            return res.status(200).json(requests);
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err);
    }
});



// get user's(driver) all Requests
router.get("/profile/:username",async (req,res)=>{
    try{
        const user=await User.findOne({username:req.params.username});
        const Requests=await Request.find({userId:user._id});
        return res.status(200).json(Requests);
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;