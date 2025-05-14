const { Schema: SchemaML, model: modelML } = require('mongoose');

const MedicationLogSchema = new SchemaML({
  user: { type: SchemaML.Types.ObjectId, ref: 'User', required: true },
  condition: { type: SchemaML.Types.ObjectId, ref: 'MedicalCondition', required: true },
  medicationName: { type: String, required: true },
  dosage: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = modelML('MedicationLog', MedicationLogSchema);