const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const {
  createUser,
  loginUser,
  getUsers,
  sendFriendRequest,
  handleRequest,
  getAllFriendRequest,
  getAllFriends,
} = require("./src/controller/userController");
const {
  validate,
  registerSchema,
  loginSchema,
  handleFriendSchema,
} = require("./src/middleware/validation");
const jwtStrategy = require("./src/config/passport");
const passport = require("passport");
const auth = require("./src/middleware/auth");

const app = express();
dotenv.config();

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/register", validate(registerSchema), createUser);

app.post("/login", validate(loginSchema), loginUser);

// app.get("/users", auth(), getUsers);
app.get("/users", getUsers);

//Send friend request
app.post("/friend-request/:id", auth(), sendFriendRequest);

//Get list of friend request
app.get("/friends-request", auth(), getAllFriendRequest);

//accept or reject friend request
app.put("/handle-request/:id", auth(),validate(handleFriendSchema), handleRequest);

//Get list of friends
app.get("/friends",auth(),getAllFriends)


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server connected on http://localhost:${process.env.PORT}`)
    );
  });
