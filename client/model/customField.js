const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'text', 'number', 'email', 'date', 'select', 'checkbox',
      'textarea', 'multiselect', 'datepicker', 'timepicker', 'color', 'hyperlink', 'file'
    ],
    required: true
  },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  placeholder: { type: String },
  validation: {
    regex: String,
    min: Number,
    max: Number,
    maxLength: Number,
    minLength: Number,
    fileTypes: [{ type: String }],
    maxSize: Number
  },
  aspectRation: {
    xAxis: Number,
    yAxis: Number
  },
  gridConfig: {
    span: Number,
    order: Number
  },
  isDeleteAble: { type: Boolean, default: true },
  
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "clientLedgerGroup", default: null, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers' },
}, { timestamps: true });

const customFormModel = mongoose.model("customField", customFieldSchema);

module.exports = customFormModel;