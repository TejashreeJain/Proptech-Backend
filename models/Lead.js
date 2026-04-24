const mongoose = require('mongoose');

// Sub-schema for notes/comments on a lead
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Plot', 'Villa', 'Commercial'],
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: ['Facebook', 'Google', 'Referral', 'Walk-in', 'Website', 'Other'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Site Visit', 'Closed'],
      default: 'New',
    },
    notes: [noteSchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster search on name and phone
leadSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
