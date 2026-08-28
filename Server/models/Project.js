import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    githubLink: {
      type: String,
      required: true,
    },

    demoLink: {
      type: String,
      default: '',
    },

    coverImage: {
      type: String,
      default: '',
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    creatorName: {
      type: String,
      required: true,
    },

    // ================= RATINGS =================

    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
    },

    // ================= LIKES =================

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  'Project',
  projectSchema
);