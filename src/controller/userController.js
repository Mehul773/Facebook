const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const user = await userModel.create(req.body);
    return res.json(user);
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("From userControler...\n User not found");
      return res.status(404).json({ Error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    // console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ Error: "Password incorrect" });
    }

    const token = await user.generateAuthToken();
    // console.log(token);
    return res.json({ token, user });
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    // console.log(users);
    return res.json(users);
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const user = req.user;
    const friendId = req.params.id;
    if (friendId == user._id) {
      return res
        .status(409)
        .json({ message: "You can not send request youeselft" });
    }
    // console.log(req.params);

    //Check friend exists or not
    const friend = await userModel.findById(friendId);
    if (!friend) {
      console.log("From usercontroller...\n Friend not found");
      return res.status(404).json({ error: "Friend not found" });
    }
    // console.log("=======", friend.friends);

    //If request alredy send then return
    const isAlreadySend = friend.friendRequest.includes(user._id);
    // console.log(isAlreadySend);
    if (isAlreadySend) {
      return res.status(409).json({
        Error: "Friend request is alredy send so you can not resend it ",
      });
    }

    //If you are already friends then you can not send request
    const isAlreadyFriend = user.friends.includes(friendId);
    if (isAlreadyFriend) {
      return res
        .status(400)
        .json({ Message: "you are already friend so you can not request" });
    }

    //Push id to friend array
    friend.friendRequest.push(user._id);
    friend.save();

    return res.status(200).json({ friend });
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

const getAllFriendRequest = async (req, res) => {
  try {
    const { filter, sort } = req.query;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const skip = (page - 1) * limit;

    const user = await userModel
      .findById(req.user._id)
      .populate("friendRequest")
      .populate("friends");

    //sorting
    if (sort === "name")
      user.friendRequest.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "email")
      user.friendRequest.sort((a, b) => a.email.localeCompare(b.email));
    else if (sort == "-name")
      user.friends.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort == "-email")
      user.friends.sort((a, b) => b.email.localeCompare(a.email));

    //pagination
    const friendRequest = user.friendRequest.slice(skip, skip + limit);

    return res.status(200).json({ name: user.name, friendRequest });
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

//accept or reject request
const handleRequest = async (req, res) => {
  try {
    const anotherUserId = req.params.id;
    const user = req.user;
    const { handleFriendRequest } = req.body;

    const anotherUser = await userModel.findById(anotherUserId);
    if (!anotherUser) {
      console.log("From usercontroller...\n Friend not found");
      return res.status(404).json({ error: "Friend not found" });
    }

    const isInFriendRequestList = user.friendRequest.includes(anotherUserId);
    if (!isInFriendRequestList) {
      return res
        .status(404)
        .json({ Error: "Friend not found in friend request list" });
    }

    //Remove friend request from friend request array
    user.friendRequest = user.friendRequest.filter(
      (friend) => friend._id != anotherUserId
    );

    //If accepet then remove element from friend request and add to friends array
    if (handleFriendRequest === "accept") {
      user.friends.push(anotherUserId);
      anotherUser.friends.push(user._id);
      anotherUser.save();
    }

    user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

const getAllFriends = async (req, res) => {
  try {
    const { sort, page = 1, limit = 10 } = req.query;

    const options = {
      select: "name email friends",
      pagingOptions: {
        populate: {
          path: "friends",
          select: "name email",
        },
        sort: { "friends.name": 1 },
        page: page,
        limit: limit,
      },
    };

    const user = await userModel.paginateSubDocs(
      { _id: req.user._id },
      options
    );

    // console.log(user.friends);
    //sorting
    if (sort == "name")
      user.friends.docs.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort == "email")
      user.friends.docs.sort((a, b) => a.email.localeCompare(b.email));
    else if (sort == "-name")
      user.friends.docs.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort == "-email")
      user.friends.docs.sort((a, b) => b.email.localeCompare(a.email));

    return res.status(200).json({ name: user.name, friends: user.friends });
  } catch (error) {
    console.log("From userController.js...\n", error);
    return res.status(500).json({ Error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUsers,
  sendFriendRequest,
  handleRequest,
  getAllFriendRequest,
  getAllFriends,
};
