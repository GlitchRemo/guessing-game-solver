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

  #isGuessCorrect(a, b) {
    return a === b;
  }

  #isSmaller(a, b) {
    return a < b;
  }

  #isGreater(a, b) {
    return a > b;
  }

  consolidateGuess(guess) {
    this.#chancesLeft--;
    this.#guesses.push(guess);
  }

  #generateResultMessage() {
    const guess = this.#guesses.at(-1);

    switch (true) {
      case this.#isGuessCorrect(guess, this.#randomNumber):
        return "accurate";
      case this.#isSmaller(guess, this.#randomNumber):
        return "too small";
      case this.#isGreater(guess, this.#randomNumber):
        return "too high";
    }
  }

  #noChancesLeft() {
    return this.#chancesLeft === 0;
  }

  #hasWon() {
    return this.#guesses.at(-1) === this.#randomNumber;
  }

  status() {
    return {
      resultMsg: this.#generateResultMessage(),
      hasWon: this.#hasWon(),
      hasLost: this.#noChancesLeft(),
      answer: this.#randomNumber,
    };
  }
}

const generateRandomNumber = (upperLimit) => {
  return Math.ceil(Math.random() * upperLimit);
};

const displayResult = ({ hasLost, hasWon, resultMsg, answer }, client) => {
  const newLine = "\n";

  if (hasLost) {
    const gameOverMsg = "Game over" + newLine;
    const correctAnswerMsg = `Correct answer was ${answer}` + newLine;

    client.write(gameOverMsg + correctAnswerMsg);
    client.end();
    return;
  }

  client.write(`${resultMsg}\n`);

  if (hasWon) {
    const gameWonMsg = "You won!!" + newLine;
    client.write(gameWonMsg);
    client.end();
  }
};

const startGame = (client, maxChances, threshold) => {
  const randomNumber = generateRandomNumber(threshold);
  const game = new Game(randomNumber, maxChances);

  client.setEncoding("utf8");
  client.write(`Guess a random number between 1 to ${threshold}\n`);

  client.on("data", (data) => {
    const guess = parseInt(data);
    game.consolidateGuess(guess);
    displayResult(game.status(), client);
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
