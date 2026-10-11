import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "netflix_secret_key_default", {
    expiresIn: "15d",
  });

  res.cookie("jwt-netflix", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
    httpOnly: true, // prevent XSS attacks cross-site scripting
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};
