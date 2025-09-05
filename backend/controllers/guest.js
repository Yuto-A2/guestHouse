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

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('session');
            res.json({ message: "Logout successful" });
        });
    });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const guest = await Guest.findById(id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json(guest);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports.showGuests = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json(guest);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const guest = await Guest.findById(id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json(guest);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports.updateGuest = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const guest = await Guest.findByIdAndUpdate(id, { ...req.body}, { new: true });
    if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(guest);
}

module.exports.deleteGuest = async (req, res) => {
    const { id } = req.params;
    try {
        const guest = await Guest.findByIdAndDelete(id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json({ message: 'Guest deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}