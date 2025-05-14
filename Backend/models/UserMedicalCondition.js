const { Schema: SchemaUMC, model: modelUMC } = require('mongoose');

const UserMedicalConditionSchema = new SchemaUMC({
  user: { type: SchemaUMC.Types.ObjectId, ref: 'User', required: true },
  condition: { type: SchemaUMC.Types.ObjectId, ref: 'MedicalCondition', required: true },
}, { timestamps: true });

module.exports = modelUMC('UserMedicalCondition', UserMedicalConditionSchema);