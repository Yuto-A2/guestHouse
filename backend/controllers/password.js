const Guest = require("../models/guest");

module.exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const guest = await Guest.findById(id);

        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        guest.changePassword(oldPassword, newPassword, (err) => {
            if (err) {
                return res.status(400).json({ error: 'Incorrect old password' });
            }

            res.json({ message: 'Password updated successfully' });
        });

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};