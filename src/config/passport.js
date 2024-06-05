const { Strategy, ExtractJwt } = require("passport-jwt");
const userModel = require("../models/userModel");

const options = {
  secretOrKey: "MySecret",
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromUrlQueryParameter("token"),
  ]),
  ignoreExpiration: false,
};

const jwtVerify = async (jwtPayload, cb) => {
  try {
    // console.log(`Jwt payload ${JSON.stringify(jwtPayload)}`);
    const user = await userModel.findById(jwtPayload._id);
    // console.log("from passport....\nUser ", user);
    if (!user) {
      return cb(null, false);
    }
    cb(null, user); //set user to req.user so we can access it
  } catch (error) {
    console.log("From passport.js.....\n", error);
    cb(error, false);
  }
};

const jwtStrategy = new Strategy(options, jwtVerify);
module.exports = jwtStrategy;
