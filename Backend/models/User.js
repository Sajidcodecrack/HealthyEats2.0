const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema, model } = mongoose;

const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very active'];

const UserSchema = new Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true, minlength: 6, select: false },
  age:              { type: Number },
  gender:           { type: String, enum: ['male', 'female', 'other'], required: true },
  pregnant:         {
                      type: Boolean,
                      default: false,
                      validate: {
                        validator: function (v) {
                          return this.gender === 'female' || v === false;
                        },
                        message: 'Only female users can be pregnant'
                      }
                    },
  heightFeet:       { type: Number, required: true }, // feet component
  heightInches:     { type: Number, required: true }, // inches component
  weight:           { type: Number, required: true }, // in kg
  bmi:              { type: Number },
  activityLevel:    { type: String, enum: activityLevels },
  budget:           { type: Number },
  medicalConditions:[{ type: Schema.Types.ObjectId, ref: 'MedicalCondition' }],
}, { timestamps: true });

// Hash password & compute BMI
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (
    this.isModified('heightFeet') ||
    this.isModified('heightInches') ||
    this.isModified('weight')
  ) {
    const totalInches = (this.heightFeet * 12) + this.heightInches;
    const heightMeters = totalInches * 0.0254;
    this.bmi = this.weight / (heightMeters ** 2);
  }
  next();
});

UserSchema.methods.comparePassword = function (candidatePw) {
  return bcrypt.compare(candidatePw, this.password);
};

module.exports = model('User', UserSchema);
