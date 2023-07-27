const net = require("node:net");

const validateGuess = (guess, number) => {
  if (guess === number) return 0;
  if (guess < number) return -1;
  return 1;
};

const generateRandomNumber = (upperLimit) => {
  // return Math.ceil(Math.random() * upperLimit);
  return 5;
};

const displayResult = (result, chancesLeft, socket) => {
  if (chancesLeft === 0) {
    socket.write("game over\n");
    socket.end();
    return;
  }

  if (result === 0) {
    socket.write("accurate\n");
    socket.end();
    return;
  }

  const message = result === -1 ? "too low" : "too high";
  socket.write(`${message}\n`);
};

const startGame = (socket, maxChances, maxNumber) => {
  let chancesLeft = maxChances;
  const randomNumber = generateRandomNumber(maxNumber);

  socket.setEncoding("utf8");
  socket.write(`Guess a random number between 1 to ${maxNumber}\n`);

  socket.on("data", (data) => {
    chancesLeft--;
    const guess = parseInt(data);
    const result = validateGuess(guess, randomNumber);
    displayResult(result, chancesLeft, socket);
  });
};

const main = () => {
  const server = new net.createServer();
  server.listen(8000, () => console.log("Game starts..."));
  server.on("connection", (socket) => startGame(socket, 5, 10));
};

main();
