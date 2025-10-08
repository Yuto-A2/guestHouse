const Guest = require("../models/guest");
const mongoose = require('mongoose');
const Reservation = require('../models/reservation');
const passport = require("passport");

module.exports.Guests = async (req, res) => {
    try {
        const guests = await Guest.find({});
        res.json(guests);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports.listReservationsByGuest = async (req, res) => {
    try {
        const { guestId } = req.params;
        if (!mongoose.isValidObjectId(guestId)) {
            return res.status(400).json({ error: 'Invalid guest ID' });
        }

        if (!req.user || !req.user._id.equals(guestId)) {
            return res.status(403).json({ error: 'You do not have permission to view these reservations' });
        }

        const { from, to, page = 1, limit = 20 } = req.query;

        const dateCond = {};
        if (from) dateCond.$gte = new Date(from);
        if (to) dateCond.$lte = new Date(to);

        const where = { guest: guestId };
        if (from || to) where.start_date = dateCond;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * perPage;

        const [items, total] = await Promise.all([
            Reservation.find(where)
                .select('start_date end_date guest property createdAt updatedAt')
                .populate({ path: 'guest', select: 'fname lname email' })
                .populate({ path: 'property', model: 'Property', select: 'property_type address' })
                .sort({ start_date: 1 })
                .skip(skip)
                .limit(perPage),
            Reservation.countDocuments(where)
        ]);

        res.json({ 
            data: items,
            page: pageNum,
            limit: perPage,
            total,
            hasMore: skip + items.length < total
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

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