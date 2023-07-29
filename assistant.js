const net = require("node:net");

class Assistant {
  #lowerBound;
  #upperBound;

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

  consolidateFeedback(feedback) {
    if (feedback.isSmaller) {
      this.#lowerBound = guess + 1;
    }

    if (feedback.isLarger) {
      this.#upperBound = guess - 1;
    }
  }

  makeGuess() {
    return this.#generateRandomNumber();
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

    client.on("data", (feedback) => {
      const guess = assistant.makeGuess(JSON.parse(feedback));
      console.log(`Assistant guessed: ${guess}`);
      client.write(`${guess}`);
    });
  });
};

main();
