// controllers/authController.js
const User = require('../models/User');
const MedicalCondition = require('../models/MedicalCondition');

exports.register = async (req, res) => {
  try {
    const {
      name, email, password,
      age, gender, pregnant = false,
      heightFeet, heightInches,
      weight, activityLevel, budget,
      medicalConditions = []
    } = req.body;

    if (
      !name || !email || !password || !gender ||
      heightFeet == null || heightInches == null || !weight
    ) {
      return res.status(400).json({
        error:
          'name, email, password, gender, heightFeet, heightInches & weight are required'
      });
    }

    // find-or-create each condition
    const condDocs = await Promise.all(
      medicalConditions.map(async condName => {
        let cond = await MedicalCondition.findOne({ name: condName });
        if (!cond) cond = await MedicalCondition.create({ name: condName });
        return cond;
      })
    );
    let condIds = condDocs.map(c => c._id);

    // pregnancy logic
    if (gender === 'female' && pregnant) {
      const preg = await MedicalCondition.findOneAndUpdate(
        { name: 'Pregnant' },
        { name: 'Pregnant' },
        { upsert: true, new: true }
      );
      condIds.push(preg._id);

      if (condDocs.some(c => c.name.toLowerCase() === 'diabetes')) {
        const gest = await MedicalCondition.findOneAndUpdate(
          { name: 'Gestational Diabetes' },
          { name: 'Gestational Diabetes' },
          { upsert: true, new: true }
        );
        condIds.push(gest._id);
      }
    }

    // create user
    const user = new User({
      name, email, password,
      age, gender, pregnant,
      heightFeet, heightInches,
      weight, activityLevel, budget,
      medicalConditions: condIds
    });
    await user.save();

    // re-fetch populated
    const populated = await User.findById(user._id)
      .select('-password')
      .populate('medicalConditions', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email & password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // fetch safe user with populated names
    const populated = await User.findById(user._id)
      .select('-password')
      .populate('medicalConditions', 'name');

    res.json({ message: 'Login successful', user: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
