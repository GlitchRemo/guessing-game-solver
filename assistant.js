const net = require("node:net");

const main = () => {
  const server = net.createServer();
  server.listen(8000, () => console.log("Assistant started listening..."));
  server.on("connection", (socket) => {
    socket.setEncoding("utf-8");
    socket.on("data", (data) => socket.write(data));
  });
};

main();
