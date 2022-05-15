const router = require("express").Router();
const Request = require("../models/Request");
const User = require("../models/User");
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const req = require("express/lib/request");

const JWT_SECRET = "HoneyPatel"
// create Request
router.post("/", [
    body('start', 'Enter a valid start place').isLength({ min: 3 }),
    body('end', 'Enter a valid end place').isLength({ min: 5 }),
    body('passengers', 'enter a valid passenger Number').isInt().isLength({ max: 10 }),
    body('vehicleNo', 'enter a valid vehicle number').isLength({ min: 8 }),
    body('vehicleType', 'enter a valid vehicle Type').isLength({ max: 10 })
], async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        let request = await Request.findOne({ vehicleNo: req.body.vehicleNo });
        if (request) {
            return res.status(400).json({ error: "sorry a user with this vehicle Number is already exists" });
        }
        console.log(req.body)
        const token =await req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        console.log(req.body);
        const newRequest = new Request({
            ...req.body,
            userId: data.user
        })
        console.log(newRequest);
        const savedRequest = await newRequest.save();
        console.log(savedRequest);
        res.status(200).json(savedRequest);
    } catch (err) {
        console.log(err.message);
        res.status(500).json(err);
    }
});



// delete a Request
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

router.put("/:id/accept", async (req, res) => {
    try {        

        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_SECRET);
    
        const request = await Request.findById(req.params.id);
        const user= await User.findById(request.userId);
        console.log(user);

        if (!request.followers.includes(data.user)) {
            await Request.updateOne({ $push: { followers: data.user } });
        }
        const driver={
            contact:user.contactNo,
            Name:user.name,
        }
        res.status(200).json(driver)
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err)
    }
});



// get a Request
router.get("/:id", async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        res.status(200).json(request);
    } catch (err) {
        res.status(500).json(err);
    }
})


// get timeline Requests
router.post("/timeline/requests", async (req, res) => {
    try {
        if(req.body.start==="default"){
            const requests=await Request.find().sort({date:-1});
            return res.status(200).json(requests);
        }
        else{

            const requests = await Request.find({ start: req.body.start }).sort({date:-1});
            return res.status(200).json(requests);
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err);
    }
});



// get user's all Requests
// router.get("/profile/:username",async (req,res)=>{
//     try{
//         const user=await User.findOne({username:req.params.username});
//         const Requests=await Request.find({userId:user._id});
//         return res.status(200).json(Requests);
//     }catch(err){
//         res.status(500).json(err);
//     }
// });

module.exports = router;