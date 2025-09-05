const Reservation = require('../models/reservation');

module.exports.showReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate({
                path: 'guest',
                select: 'fname lname email'
            })
            .populate({
                path: 'property',
                select: 'property_type address'
            });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (!reservation.guest._id.equals(req.user._id)) {
            return res.status(403).json({ error: 'You do not have permission to view this reservation' });
        }

        res.json(reservation);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


module.exports.createReservation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'You must be logged in to make a reservation' });
        }

        const { propertyId, start_date, end_date } = req.body;

        const newReservation = new Reservation({
            property: propertyId,
            start_date,
            end_date,
            guest: req.user._id
        });

        await newReservation.save();
        res.status(201).json(newReservation);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
module.exports.updateReservation = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    try {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        if (!reservation.guest.equals(req.user._id)) {
            return res.status(403).json({ error: 'You do not have permission to edit this reservation' });
        }
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedReservation);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


module.exports.deleteReservation = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'You must be logged in to delete a reservation' });
        }

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        if (!reservation.guest.equals(req.user._id)) {
            return res.status(403).json({ error: 'You do not have permission to delete this reservation' });
        }

        await reservation.deleteOne();
        res.json({ message: 'Reservation deleted successfully' });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

