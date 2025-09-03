const Guest = require("../models/guest");
const passport = require("passport");

module.exports.Guests = async (req, res) => {
    try {
        const guests = await Guest.find({});
        res.json(guests);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

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

module.exports.login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        req.login(user, (err) => {
            if (err) return next(err);
            res.json({
                message: "Login successful",
                user: {
                    id: user._id,
                    email: user.email,
                    fname: user.fname,
                    lname: user.lname,
                    phone_num: user.phone_num
                }
            });
        });
    })(req, res, next);
};