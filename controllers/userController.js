const User = require('../modals/User')
const Reporteduser = require('../modals/Report')
const jwt = require('jsonwebtoken')

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        const checkuser = await User.findOne({ email: email })
        checkuser && res.json({
            type: "failure",
            result: "Email already exist"
        });

        const user = new User({
            name,
            email,
            password,
            profile: ""
        })
        user.save().then(e => {
            res.json({
                type: "success",
                result: {
                    name: e.name,
                    email: e.email,
                    profile: e.profile
                }
            });
        })
            .catch(e => {
                res.json({ type: "failure", result: "server error" });
            })

    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: e.message })
    }
}
const signin = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        // console.log(user, req.body);
        if (!user)
            return res.json({ type: "failure", result: "No user found" });

        else if (user && (await user.matchpass(req.body.password, user.password))) {

            const token = jwt.sign(
                { id: user._id },
                process.env.SECRET_JWT,
            )

            const { password, ...rest } = user._doc

            res.json({ type: "success", result: { ...rest, token } })
        }
        else {
            return res.json({ type: "failure", result: "Wrong Credentials" });
        }
    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: "Internal Server Error" });

    }
}
const registerWithImage = async (req, res, next) => {
    try {
        const email = req.body.email
        const find = await User.findOne({ email })
        find && res.json({
            type: "failure",
            result: "Email already exist"
        });

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            profile: req.file.path
        })
        const save = await user.save();
        if (save) {
            res.json({
                type: "success",
                result: {
                    name: save.name,
                    email: save.email,
                    profile: save.profile
                }
            });
        }
        else {
            res.json({
                type: "failure",
                result: "server error"
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: e.message })
    }
}
const GetAll = async (req, res, next) => {
    try {
        const user = await User.find({})
        console.log(user.length);
        if (!user) {
            return res.json({ type: "failure", result: "No user found" });
        }
        res.json({ type: "success", result: user })
    }
    catch (e) {
        console.log("error occured in getuser");
        res.json({ type: "failure", result: "No user found" });
    }
}
const reporteduserslist = async (req, res, next) => {
    // Reporteduser
    try {
        const user = await Reporteduser.find({})
            .populate("user")
            .populate("reporteduser")
        if (!user) {
            return res.json({ type: "failure", result: "No user found" });
        }
        res.json({ type: "success", result: user })
    }
    catch (e) {
        console.log("error occured in getuser");
        res.json({ type: "failure", result: "No user found" });
    }
}
const getSingleUserbyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById({ _id: req.body.id })
        console.log(user);
        if (!user) {
            return res.json({ type: "failure", result: "No user found" });
        }
        res.json({ type: "success", result: user })
    }
    catch (e) {
        console.log("error occured in getuser");
        res.json({ type: "failure", result: "No user found" });
    }
}
const UpdatePorfile = async (req, res, next) => {
    try {
        const find = await User.findByIdAndUpdate(
            req.user,
            { $set: { profile: req.file.path } },
            { new: true }
        )
        if (find) {
            res.json({
                type: "success",
                result: find
            });
        }
        else {
            res.json({
                type: "failure",
                result: "server error"
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: e.message })
    }
}
const getSingleUser = async (req, res, next) => {
    try {
        const _id = req.body.id

        var button = ""
        const current = req.body.current
        const user = await User.findById(_id)
        if (!user) {
            return res.json({ type: "failure", result: "No user found" });
        }
        console.log("user", user);
        if (user.friends.includes(current)) {
            button = "Remove"
        }
        else if (user.addfriendReq.includes(current)) {
            button = "Cancel"
        }
        else {
            button = "Add"
        }

        const { password, ...rest } = user._doc
        res.json({ type: "success", result: { ...rest }, button })
    }
    catch (e) {
        console.log("error occured in getuser");
        res.json({ type: "failure", result: "No user found" });
    }
}
const updateStatus = async (req, res, next) => {
    try {
        const _id = req.body.id
        const user = await User.findOne({ _id });
        !user && res.json({ type: "failure", result: "No user found" });
        const update = await User.findByIdAndUpdate(_id, { $set: req.body }, { new: true })
        const { password, ...rest } = update._doc
        res.json({ type: "success", result: { ...rest }, updated: "true" });
    }
    catch (e) {
        console.log(e);
    }
}
const VerifyEmail = async (req, res, next) => {
    try {
        const email = req.body.email
        const user = await User.findOne({ email });
        !user && res.json({ type: "failure", result: "No user found" });
        res.json({ type: "success" });
    }
    catch (e) {
        console.log(e);
    }
}
const updatePass = async (req, res, next) => {
    try {
        const email = req.body.email
        const pass = req.body.password
        const user = await User.findOne({ email });
        !user && res.json({ type: "failure", result: "No user found" });
        user.password = pass
        user
            .save()
            .then(() => {
                const { password, ...rest } = user._doc
                console.log("rest", rest);
                res.status(200).json({
                    type: "success",
                    result: { rest },
                    updated: "true"
                });
            })
            .catch(() => {
                res
                    .status(500)
                    .json({ type: "failure", result: "Server Not Responding" });
                return;
            });

    }
    catch (e) {
        console.log("error", e);
    }
}
const DELETEUSER = async (req, res, next) => {
    try {
        const _id = req.user
        console.log(req.user);
        const user = await User.findByIdAndDelete(_id);
        if (!user)
            return res.json({ type: "failure", result: "No user found" });
        // const { password, ...rest } = update
        console.log(user);
        res.json({
            type: "success", result: `Account has been deleted `
        });
    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: e.message });
    }
}
const DELETEUSERByAdmin = async (req, res, next) => {
    try {
        const _id = req.body.id
        const opration = await User.updateMany({
            $set: {
                $pull: { friends: req.body.id },
                $pull: { acceptfriend: req.body.id },
                $pull: { friendrequest: req.body.id },
            }
        })
        const user = await User.findByIdAndDelete(_id);



        console.log(opration);
        if (!user)
            return res.json({ type: "failure", result: "No user found" });
        // const { password, ...rest } = update
        res.json({
            type: "success", result: `Account has been deleted `, data: opration
        });
    }
    catch (e) {
        console.log(e);
        return res.json({ type: "failure", result: e.message });
    }
}
const follow = async (req, res, next) => {
    if (req.body.usertofollowid !== req.body.id) {
        try {
            const usertofollowid = await User.findById(req.body.usertofollowid);
            const currentUser = await User.findById(req.body.id);

            if (!usertofollowid)
                res.json({
                    type: "failure",
                    result: "No user found"
                });

            if (
                !(usertofollowid.friends.includes(req.body.id)) &&
                !(usertofollowid.addfriendReq.includes(req.body.id))
            ) {
                await usertofollowid.updateOne({
                    $push: { addfriendReq: req.body.id }
                })
                await currentUser.updateOne({
                    $push: { pendingReq: req.body.usertofollowid }
                })
                res.json({
                    type: "success", result: `Request Sent`
                })
            }
            else res.json({
                type: "failure", result:
                    (usertofollowid.friends.includes(req.body.id))
                        ? `You are already friend with this account`
                        : `Request already sent to this account this account`


            });
        }
        catch (e) {
            res.json({
                type: "failure", result: `Can't Find the user or can't follow the user or user not found`
            });
        }
    }
    else res.json({
        type: "failure", result: `You can't follow your self`
    });
}
const unfollow = async (req, res, next) => {
    if (req.body.id !== req.body.usertounfollowid) {
        try {
            const unfollowid = await User.findById(req.body.usertounfollowid);
            const currentUser = await User.findById(req.body.id);
            if (!unfollowid)
                return res.json({
                    type: "failure",
                    result: "No user found"
                });
            if (unfollowid.addfriendReq.includes(req.body.id)) {

                await unfollowid.updateOne({
                    $pull: { addfriendReq: req.body.id }
                })
                await currentUser.updateOne({
                    $pull: { pendingReq: req.body.usertounfollowid }
                })
                res.json({
                    type: "success", result: `Request Cancelled`
                })
            }
            else res.json({
                type: "failure", result: `You haven't send request to this account`
            });
        }
        catch (e) {

            res.json({
                type: "failure", result: `Can't Find the user or can't unfollow the user or user not found`
            });
        }
    }
    else res.json({
        type: "failure", result: `Server Error`
    });
}
const removefriend = async (req, res, next) => {
    if (req.body.id !== req.body.removeId) {
        try {
            const removeid = await User.findById(req.body.removeId);
            const currentUser = await User.findById(req.body.id);
            if (!removeid)
                res.json({
                    type: "failure",
                    result: "No user found"
                });
            if (removeid.friends.includes(req.body.id)) {
                await removeid.updateOne({
                    $pull: { friends: req.body.id }
                }, { new: true })
                await currentUser.updateOne({
                    $pull: { friends: req.body.removeId }
                }, { new: true })
                console.log("here");
                const friends = await currentUser.friends;
                const users = await User.find().where('_id').in(friends)

                res.json({
                    type: "success", result: `Friend Removed`,
                    data: users
                })
            }

            else if (
                removeid.pendingReq.includes(req.body.id) ||
                currentUser.addfriendReq.includes(req.body.removeId)
            ) {
                console.log("fisrt2");

                await removeid.updateOne({
                    $pull: { pendingReq: req.body.id }
                })
                await currentUser.updateOne({
                    $pull: { addfriendReq: req.body.removeId },
                }, { new: true })
                const friends = await currentUser.addfriendReq;
                const users = await User.find().where('_id').in(friends)
                res.json({
                    type: "success", result: `Friend Removed`
                    , data: users

                })
            }
            else if (removeid.addfriendReq.includes(req.body.id)) {
                console.log("fisrt3");

                await removeid.updateOne({
                    $pull: { addfriendReq: req.body.id }
                })
                await currentUser.updateOne({
                    $pull: { pendingReq: req.body.removeId }
                })
                const friends = await currentUser.pendingReq;
                const users = await User.find().where('_id').in(friends)
                res.json({
                    type: "success", result: `Friend Removed`,
                    data: users
                })
            }
            else res.json({
                type: "failure", result: `You aren't friends with this user`
            });
        }
        catch (e) {
            console.log(e.message);
            res.json({
                type: "failure", result: `Can't Find the user or can't unfollow the user or user not found`
            });
        }
    }
    else res.json({
        type: "failure", result: `Server Error`
    });
}
const acceptfriend = async (req, res, next) => {
    if (req.body.id !== req.body.acceptid) {
        try {
            const acceptid = await User.findById(req.body.acceptid);
            const currentUser = await User.findById(req.body.id);
            if (!acceptid)
                res.json({
                    type: "failure",
                    result: "No user found"
                });
            if (acceptid.pendingReq.includes(req.body.id)) {

                await acceptid.updateOne({
                    $pull: { pendingReq: req.body.id }
                }, { new: true })
                await acceptid.updateOne({
                    $push: { friends: req.body.id }
                }, { new: true })
                await currentUser.updateOne({
                    $pull: { addfriendReq: req.body.acceptid }
                }, { new: true })
                await currentUser.updateOne({
                    $push: { friends: req.body.acceptid }
                }, { new: true })
                const friends = await currentUser.addfriendReq;
                const users = await User.find().where('_id').in(friends)
                return res.json({
                    type: "success", result: `Friend Request Accpeted`,
                    data: users
                })
            }

            else res.json({
                type: "failure", result: `You aren't friends with this user`
            });
        }
        catch (e) {

            res.json({
                type: "failure", result: `Can't Find the user or can't unfollow the user or user not found`
            });
        }
    }
    else res.json({
        type: "failure", result: `Server Error`
    });
}
const friendList = async (req, res, next) => {
    try {
        const id = await User.findById(req.body.id);
        const friends = await id.friends;

        if (friends == [])
            res.json({
                type: "failure",
                result: "No users found"
            });
        const users = await User.find().where('_id').in(friends)

        res.json({ type: "success", list: users })
    }
    catch (e) {
        console.log("error");
        res.json({
            type: "failure",
            result: `Can't Find the users`
        });
    }

}
const pendinglist = async (req, res, next) => {
    try {
        const id = await User.findById(req.body.id);
        const friends = await id.pendingReq;

        if (friends == [])
            res.json({
                type: "failure",
                result: "No users found"
            });
        const users = await User.find().where('_id').in(friends)

        res.json({ type: "success", list: users })
    }
    catch (e) {
        console.log("error");
        res.json({
            type: "failure",
            result: `Can't Find the users`
        });
    }

}
const friendrequest = async (req, res, next) => {
    try {
        const id = await User.findById(req.body.id);
        const friends = await id.addfriendReq;

        if (friends == [])
            res.json({
                type: "failure",
                result: "No users found"
            });
        const users = await User.find().where('_id').in(friends)

        res.json({ type: "success", list: users })
    }
    catch (e) {
        console.log("error");
        res.json({
            type: "failure",
            result: `Can't Find the users`
        });
    }

}
const repostuser = async (req, res, next) => {
    try {
        new Reporteduser({
            user: req.user,
            message: req.body.message,
            reporteduser: req.body.id
        })
            .save()
            .then(e => {

                return res.json({ type: "success", result: 'User Reported!' })
            })
            .catch(e => {
                return res.json({ type: "failure", result: "Couldn't Report User" })

            })
    }
    catch (e) {
        console.log("error");
        res.status(500).json({ type: "failure", result: "Couldn't Report User" })
    }

}
module.exports = {
    register,
    registerWithImage,
    UpdatePorfile,
    signin,
    getSingleUser,
    getSingleUserbyAdmin,//admin
    DELETEUSERByAdmin,
    updateStatus,
    VerifyEmail,
    updatePass,
    follow,
    unfollow,
    removefriend,
    friendList,
    acceptfriend,
    pendinglist,
    friendrequest,
    DELETEUSER,
    GetAll,
    repostuser,
    reporteduserslist
}