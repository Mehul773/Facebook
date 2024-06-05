const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facebook" }],
  friendRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facebook" }],
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    // console.log(this.password);
    next();
  } catch (error) {
    console.log(`From userModel.js...\n ${error}`);
    next(error);
  }
});

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign({ _id: this._id }, "MySecret", {
      expiresIn: "10 hours",
    });
    // console.log(token);
    return token;
  } catch (error) {
    console.log(`From userMOdel...\n`, error);
    return resizeBy.status(500).json(error);
  }
};

userSchema.plugin(mongoosePaginate);

const userModel = mongoose.model("Facebook", userSchema);
module.exports = userModel;
