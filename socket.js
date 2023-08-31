require("dotenv").config();
import socketIO from "socket.io";
import http from "http";

const PORT = process.env.SOCKET_PORT || 8800;

const server = http.createServer();
const io = socketIO(server, {
    cors: {
        origin: "*",
    },
});

let activeUsers = [];

io.on("connection", (socket) => {
    socket.on("join", (newUserID) => {
        const userExist = activeUsers.some(({ userID }) => userID === newUserID);
        if (!userExist) {
            activeUsers.push({
                userID: newUserID,
                socketID: socket.id,
            });
        }
        io.emit("active-users", activeUsers);
    });

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter(({ socketID }) => socketID !== socket.id);
        io.emit("active-users", activeUsers);
    });

    socket.on("send-message", (data) => {
        const { linkedUserId } = data;
        const user = activeUsers.filter((user) => user.userID === linkedUserId);
        if (user[0]) io.to(user[0].socketID).emit("receive-message", data);
    });
});

server.listen(PORT, () => {
    console.log(`Socket server is running on port ${PORT}`);
});
