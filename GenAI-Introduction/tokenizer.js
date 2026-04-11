class Tokenizer {
  static dictionary = new Map();
  static reverseDict = new Map();
  constructor() {
    this.fillDict();
    this.fillReverseDict();
  }

  fillDict() {
    let mainUse =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ_.!@#%&()abcdefghijklmnopqrstuvwxyz";
    for (let char of mainUse) {
      let key = char;
      let value = char.charCodeAt(0) * 34;
      Tokenizer.dictionary.set(key, value);
    }
    Tokenizer.dictionary.set(" ", 1);
  }

  fillReverseDict() {
    Tokenizer.reverseDict.clear();
    for (const [key, value] of Tokenizer.dictionary.entries()) {
      Tokenizer.reverseDict.set(value, key);
    }
  }

  encode(stringToEncode) {
    const encoded = [];
    for (const char of stringToEncode) {
      encoded.push(Tokenizer.dictionary.get(char));
    }
    return encoded;
  }

  decode(arrayToDecode) {
    let decodedString = "";
    for (const val of arrayToDecode) {
      let newValue = Tokenizer.reverseDict.get(val);
      decodedString += newValue;
    }
    return decodedString;
  }
}

const tokenize = new Tokenizer();
const response = tokenize.encode("This is the main file.");
console.log(response);
const stringResponse = tokenize.decode(response);
console.log(stringResponse);
