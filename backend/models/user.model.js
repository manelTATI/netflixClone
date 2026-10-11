import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    name: { type: String, default: "" },
    poster_path: { type: String, default: "" },
    backdrop_path: { type: String, default: "" },
    media_type: { type: String, enum: ["movie", "tv"], default: "movie" },
    overview: { type: String, default: "" },
    release_date: { type: String, default: "" },
    first_air_date: { type: String, default: "" },
    vote_average: { type: Number, default: 0 },
  },
  { _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    image: {
      type: String,
      default: "",
    },
    searchHistory: {
      type: Array,
      default: [],
    },
    myList: [watchlistItemSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
