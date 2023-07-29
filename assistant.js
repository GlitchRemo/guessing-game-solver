const net = require("node:net");

class Assistant {
  #lowerBound;
  #upperBound;
  #guess;

  constructor(lowerBound, upperBound) {
    this.#lowerBound = lowerBound;
    this.#upperBound = upperBound;
  }

  #generateRandomNumber() {
    return (
      this.#lowerBound +
      Math.floor(Math.random() * (this.#upperBound - this.#lowerBound))
    );
  }

  makeGuess(feedback = {}) {
    if (feedback.isSmaller) {
      this.#lowerBound = this.#guess + 1;
    }

    if (feedback.isLarger) {
      this.#upperBound = this.#guess - 1;
    }

    this.#guess = this.#generateRandomNumber();
    return this.#guess;
  }
}

const main = () => {
  const client = net.createConnection(8000);
  client.on("connect", () => {
    client.setEncoding("utf-8");

    const lowerBound = 0;
    const upperBound = 10;
    const assistant = new Assistant(lowerBound, upperBound);

    const initialGuess = assistant.makeGuess();
    client.write(`${initialGuess}`);
    console.log(`Assistant guessed: ${initialGuess}`);

    client.on("data", (data) => {
      const gameStatus = JSON.parse(data);
      const guess = assistant.makeGuess(gameStatus.feedback);
      console.log(`Assistant guessed: ${guess}`);
      client.write(`${guess}`);
    });
  });
};

main();
