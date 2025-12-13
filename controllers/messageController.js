import message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { analyzeMood } from "./aiController.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const usersWithLastMessage = await Promise.all(filteredUsers.map(async (user) => {
            const lastMessage = await message.findOne({
                $or: [
                    { senderId: userId, receiverId: user._id },
                    { senderId: user._id, receiverId: userId }
                ]
            }).sort({ createdAt: -1 });

            return {
                ...user.toObject(),
                lastMessage: lastMessage ? (lastMessage.text || "Photo") : "",
                lastMessageTime: lastMessage ? lastMessage.createdAt : 0
            };
        }));

        // count number of message not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await message.find({
                senderId: user._id, receiverId:
                    userId, seen: false
            })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);

        res.json({ success: true, users: usersWithLastMessage, unseenMessages })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


// get all messages for selected user

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        })
        await message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });

        res.json({ success: true, messages })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


// api to mark message as seen using message id

export const markMessageAsSeen = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const { id } = req.params;
        await message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        //emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        const senderSocketId = userSocketMap[senderId]; // Get sender socket too for mood update

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        // mood analysis
        // fetch context (Last 5 messages including the new one)
        const recentMessages = await message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(5);

        // Prepare data
        const historyForAI = recentMessages.reverse().map(msg => ({
            sender: msg.senderId.toString() === senderId.toString() ? "me" : "partner",
            text: msg.text || (msg.image ? "[Image sent]" : ""),
        }));

        // trigger analysis
        analyzeMood(historyForAI).then((moodData) => {
            // Emit 'moodUpdate' to both users so the ring changes for everyone
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("moodUpdate", { ...moodData, userId: senderId });
            }
            if (senderSocketId) {
                // For the sender, the "partner" in the conversation is the receiver
                io.to(senderSocketId).emit("moodUpdate", { ...moodData, userId: receiverId });
            }
        }).catch(err => console.error("Mood analysis background error:", err));



        res.json({ success: true, newMessage });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}