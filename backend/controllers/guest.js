const Guest = require("../models/guest");

module.exports.Register = async (req, res) => {
    try {
        const { fname, lname, email, phone_num, password } = req.body;
        const newGuest = new Guest({ fname, lname, email, phone_num });
        const registeredGuest = await Guest.register(newGuest, password);
        res.status(201).json(registeredGuest);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports.Guests = async (req, res) => {
    try {
        const guests = await Guest.find({});
        res.json(guests);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}