const net = require("node:net");

class Game {
  #randomNumber;
  #chancesLeft;
  #hasWon;

  constructor(randomNumber, maxChances) {
    this.#randomNumber = randomNumber;
    this.#chancesLeft = maxChances;
    this.#hasWon = false;
  }

  validateGuess(guess) {
    this.#chancesLeft--;
    this.#hasWon = guess === this.#randomNumber;

    return {
      isSmaller: guess < this.#randomNumber,
      isLarger: guess > this.#randomNumber,
    };
  }

  noChancesLeft() {
    return this.#chancesLeft === 0;
  }

  hasWon() {
    return this.#hasWon;
  }

  get correctAnswer() {
    return this.#randomNumber;
  }
}

const generateRandomNumber = (min, max) => {
  return min + Math.floor(Math.random() * (max - min));
};

const startGame = (client, maxChances, lowerLimit, upperLimit) => {
  const randomNumber = generateRandomNumber(lowerLimit, upperLimit);
  const game = new Game(randomNumber, maxChances);

  client.setEncoding("utf8");
  client.on("data", (data) => {
    const guess = parseInt(data);
    const feedback = game.validateGuess(guess);

    if (game.hasWon() || game.noChancesLeft()) {
      const endgameMsg = game.hasWon() ? "won" : "lost";
      console.log(`Assistant has ${endgameMsg} the game`);
      console.log(`Correct answer is ${game.correctAnswer}`);
      client.end();
      return;
    }

    const gameStatus = { feedback };
    client.write(JSON.stringify(gameStatus));
  });
};

const main = () => {
  const server = new net.createServer();
  server.listen(8000, () => console.log("Game starts..."));

  const maxChances = 5;
  const lowerLimit = 0;
  const upperLimit = 10;

  server.on("connection", (client) => {
    startGame(client, maxChances, lowerLimit, upperLimit);
  });
};

main();
