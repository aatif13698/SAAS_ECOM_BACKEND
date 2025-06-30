

const mongoose = require('mongoose');

const { Schema } = mongoose;

// Reply schema as a sub-document
const replySchema = new Schema(
  {
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Sender ID is required'],
    },
    subject:{
      type: String,
      required: [true, 'Subject message is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Reply message is required'],
      trim: true,
    },
    meetingLink: {
      type: String,
      default: null,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const querySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
      index: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    replies: [replySchema],
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for common queries
querySchema.index({ createdAt: -1 });
querySchema.index({ status: 1, createdAt: -1 });



const UserQuery = mongoose.model('query', querySchema);
module.exports = UserQuery;