const net = require("node:net");

class Assistant {
  #suggestion;
  #clues;
  #lastClue;

  constructor(initialSuggestion) {
    this.#suggestion = initialSuggestion;
    this.#clues = [];
  }

  consolidateClues(clue) {
    this.#lastClue = clue;
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
    if (this.#lastClue.small) {
      this.#suggestion = this.#generateLargerNumber();
    }

    if (this.#lastClue.large) {
      this.#suggestion = this.#generateSmallerNumber();
    }

    return this.#suggestion;
  }
}

const startGuessing = (socket) => {
  const lookup = {
    "too small": { small: true, large: false },
    "too high": { small: false, large: true },
  };
  const initialSuggestion = 0;
  const assistant = new Assistant(initialSuggestion);

  socket.setEncoding("utf-8");
  socket.write(`Assistant>> ${initialSuggestion}\n`);

  socket.on("data", (data) => {
    const clue = lookup[data.trim()];
    assistant.consolidateClues(clue);

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
