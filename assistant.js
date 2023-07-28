const net = require("node:net");

class Assistant {
  #suggestion;
  #clues;
  #failedToGuess;
  #guessedCorrectly;

  constructor(initialSuggestion) {
    this.#suggestion = initialSuggestion;
    this.#clues = [];
    this.#failedToGuess = false;
    this.#guessedCorrectly = false;
  }

  consolidateClues(clue) {
    if (clue.includes("over")) {
      this.#failedToGuess = true;
    }

    if (clue.includes("accurate")) {
      this.#guessedCorrectly = true;
    }

    this.#clues.push(clue);
  }

  #generateRandomNumber(max, min) {
    return min + Math.floor(Math.random() * (max - min));
  }

  #generateLargerNumber() {
    return this.#generateRandomNumber(this.#suggestion + 5, this.#suggestion);
  }

  #generateSmallerNumber() {
    return this.#generateRandomNumber(this.#suggestion, this.#suggestion - 5);
  }

  suggest() {
    const clue = this.#clues.at(-1);

    if (clue === "too small") {
      this.#suggestion = this.#generateLargerNumber();
    }

    if (clue === "too high") {
      this.#suggestion = this.#generateSmallerNumber();
    }

    return this.#suggestion;
  }
}

const startGuessing = (socket) => {
  const initialSuggestion = 0;
  const assistant = new Assistant(initialSuggestion);

  socket.setEncoding("utf-8");
  socket.write(`Assistant>> ${initialSuggestion}\n`);

  socket.on("data", (data) => {
    assistant.consolidateClues(data.trim());

    if (data.includes("over")) {
      socket.write("Opps!! We lost\n");
      socket.end();
      return;
    }

    if (data.includes("accurate")) {
      socket.write("Yayy!! We won\n");
      socket.end();
      return;
    }

    const suggestion = assistant.suggest();
    socket.write(`Assistant>> ${suggestion}\n`);
  });
};

const main = () => {
  const server = net.createServer();
  server.listen(4000, () => console.log("Assistant started listening..."));
  server.on("connection", startGuessing);
};

main();
