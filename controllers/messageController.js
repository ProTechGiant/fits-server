import { Message, Personal, Room } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";

const messageController = {

  async index(req, res, next) {
    const { offset, limit } = req.body;
    try {
      const myMessages = await Message.find(
        { roomId: req.params.roomId },
      )

      const roomsMessageIdz = myMessages.map((item) => item._id.toString())

      await Message.updateMany(
        {
          $and: [
            { _id: { $in: roomsMessageIdz } },
            { userId: { $ne: req.user._id } }
          ]
        },
        { $set: { status: true } }
      )
      const messages = await Message.find(
        { roomId: req.params.roomId },
      ).select("-updatedAt -__v")
        .sort({ createdAt: "asc" })
        .skip(offset * limit)
        .limit(limit)
        .exec();
      return successResponse(res, next, { messages }, HTTP_STATUS.OK);
    } catch (err) {
      return next(err);
    }
  },

  async createRoom(req, res, next) {
    let { message, linkId } = req.body;
    try {
      const receiver = await Personal.findOne({ user: linkId });
      const sender = await Personal.findOne({ user: req.user._id });

      if (!receiver) return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Sender and receiver have an account", null);

      const room = await Room.findOne({
        $or: [
          { "user.id": req.user._id, "linkUser.id": linkId },
          { "user.id": linkId, "linkUser.id": req.user._id }
        ]
      });

      if (room) {
        const newMessage = await new Message({
          roomId: room._id,
          userId: req.user._id,
          message: message
        }).save();

        return successResponse(res, next, { room, message: newMessage }, HTTP_STATUS.OK, "Message sent successfully");
      }

      const newRoom = await new Room({
        user: {
          id: req.user._id,
          image: sender.profileImage,
          name: sender.name
        },
        linkUser: {
          id: linkId,
          image: receiver.profileImage,
          name: receiver.name
        }
      }).save();

      const newMessage = await new Message({
        roomId: newRoom._id,
        userId: req.user._id,
        message: message
      }).save();

      return successResponse(res, next, { room: newRoom, message: newMessage }, HTTP_STATUS.CREATED, "Message sent successfully");
    } catch (err) {
      return next(err);
    }
  },

  async getAllMyRooms(req, res, next) {
    try {
      const allRooms = await Room.find({
        $or: [
          { "user.id": req.user._id },
          { "linkUser.id": req.user._id }
        ]
      }).select("-updatedAt -__v");

      const roomIdz = allRooms.map((room) => room._id);

      const messages = await Message.find({
        roomId: { $in: roomIdz },
        status: false
      });

      const lastMessage = await Message.findOne({
        roomId: { $in: roomIdz }
      }).sort({ createdAt: "asc" })

      const roomsWithMessages = [...allRooms].map((room) => {
        const roomMessages = messages.filter((message) => message.roomId.toString() === room._id.toString());
        const roomObject = room.toObject();
        roomObject.unReadMessagesCount = roomMessages.length;
        roomObject.lastMessage = lastMessage || "";
        const linkuserId = roomObject.linkUser.id.toString();
        const userId = roomObject.user.id.toString();
        if (linkuserId === req.user._id) {
          roomObject.linkedUser = roomObject.user
        } else if (userId === req.user._id) {
          roomObject.linkedUser = roomObject.linkUser
        } else {
          roomObject.linkedUser = []
        }
        delete roomObject.user
        delete roomObject.linkUser
        return roomObject;
      });

      return successResponse(res, next, roomsWithMessages, HTTP_STATUS.OK);
    } catch (error) {
      return next(error);
    }
  },

  // send messages
  async sendMessage(req, res, next) {
    const { roomId, text } = req.body;
    try {
      const message = await new Message({
        roomId,
        userId: req.user._id,
        message: text,
      }).save();

      return successResponse(res, next, message, HTTP_STATUS.CREATED);
    } catch (err) {
      return next(err);
    }
  },
};

export default messageController;
