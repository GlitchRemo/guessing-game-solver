const net = require("node:net");

class Game {
  #randomNumber;
  #chancesLeft;
  #guesses;

  constructor(randomNumber, maxChances) {
    this.#randomNumber = randomNumber;
    this.#chancesLeft = maxChances;
    this.#guesses = [];
  }

  consolidateGuess(guess) {
    this.#chancesLeft--;
    this.#guesses.push(guess);
  }

  #generateResult() {
    const guess = this.#guesses.at(-1);
    return {
      isSmaller: guess < this.#randomNumber,
      isLarger: guess > this.#randomNumber,
    };
  }

  #noChancesLeft() {
    return this.#chancesLeft === 0;
  }

  #hasWon() {
    return this.#guesses.at(-1) === this.#randomNumber;
  }

  status() {
    return {
      guessResult: this.#generateResult(),
      hasWon: this.#hasWon(),
      hasLost: this.#noChancesLeft(),
      correctAnswer: this.#randomNumber,
    };
  }
}

const generateRandomNumber = (upperLimit) => {
  return Math.ceil(Math.random() * upperLimit);
};

const displayResult = (
  { hasLost, hasWon, guessResult, correctAnswer },
  guess
) => {
  if (hasLost) {
    console.log(`Assistant lost. Correct Answer was ${correctAnswer}`);
    return;
  }

  if (hasWon) {
    console.log("Assistant won");
    return;
  }

  const hint = guessResult.isSmaller ? "low" : "high";
  console.log(`${guess} : ${hint}`);
};

const startGame = (client, maxChances, threshold) => {
  const randomNumber = generateRandomNumber(threshold);
  const game = new Game(randomNumber, maxChances);

  client.setEncoding("utf8");

  client.on("data", (data) => {
    const guess = parseInt(data);

    game.consolidateGuess(guess);
    const gameStatus = game.status();
    displayResult(gameStatus, guess);

    if (gameStatus.hasWon || gameStatus.hasLost) {
      client.end();
      return;
    }

    client.write(JSON.stringify(gameStatus.guessResult));
  });
};

const main = () => {
  const server = new net.createServer();
  server.listen(8000, () => console.log("Game starts..."));

  const maxChances = 5;
  const threshold = 10;
  server.on("connection", (client) => startGame(client, maxChances, threshold));
};

main();
