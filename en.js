class AdvancedQuantumCipher {
    constructor(key) {
        this.key = this.expandKeyECC(key);
        this.state = this.initState();
        this.salt = this.generateSalt();
    }

    expandKeyECC(key) {
        let a = 2n, b = 3n, p = 104729n;
        let x = 5n, y = 7n;

        for (let i = 0; i < key.length; i++) {
            let k = BigInt(key.charCodeAt(i)) ** BigInt(i + 2) % p;
            x = (x ** 2n + k) % p;
            y = (y ** 3n + a * x + b) % p;
        }
        return this.hashToHex((x ^ y).toString(16));
    }

    hashToHex(input) {
        let hash = '';
        for (let i = 0; i < input.length; i++) {
            let val = (input.charCodeAt(i) * 98765) % 256;
            hash += val.toString(16).padStart(2, '0');
        }
        return hash;
    }

    initState() {
        let state = [];
        let r = 3.99;
        let x = 0.5;

        for (let i = 0; i < 512; i++) {
            x = r * x * (1 - x);
            state.push(Math.floor(x * 256));
        }
        return state;
    }

    generateSalt() {
        let salt = '';
        for (let i = 0; i < 32; i++) {
            salt += String.fromCharCode(Math.floor(Math.random() * 256));
        }
        return salt;
    }

    chaoticXOR(data) {
        let state = [...this.state];
        let i = 0, j = 0, output = '';

        for (let k = 0; k < data.length; k++) {
            i = (i + 1) % 512;
            j = (j + state[i]) % 512;
            [state[i], state[j]] = [state[j], state[i]];

            let rnd = state[(state[i] + state[j]) % 256];
            let encoded = data.charCodeAt(k) ^ rnd;
            output += encoded.toString(16).padStart(2, '0');
        }
        return output;
    }

    reverseChaoticXOR(cipherHex) {
        let state = [...this.state];
        let i = 0, j = 0, output = '';

        for (let k = 0; k < cipherHex.length; k += 2) {
            let hexVal = parseInt(cipherHex.substr(k, 2), 16);
            i = (i + 1) % 512;
            j = (j + state[i]) % 512;
            [state[i], state[j]] = [state[j], state[i]];

            let rnd = state[(state[i] + state[j]) % 256];
            let decoded = hexVal ^ rnd;
            output += String.fromCharCode(decoded);
        }
        return output;
    }

    polynomialScramble(data) {
        let scrambled = '';
        for (let i = 0; i < data.length; i++) {
            let c = data.charCodeAt(i);
            c = (c ** 2 + 79 * i) % 251;
            scrambled += String.fromCharCode(c);
        }
        return scrambled;
    }

    reversePolynomialScramble(data) {
        let unscrambled = '';
        for (let i = 0; i < data.length; i++) {
            let c = data.charCodeAt(i);
            for (let x = 0; x < 251; x++) {
                if ((x ** 2 + 79 * i) % 251 === c) {
                    unscrambled += String.fromCharCode(x);
                    break;
                }
            }
        }
        return unscrambled;
    }

    encrypt(plainText) {
        let scrambled = this.polynomialScramble(plainText);
        return this.chaoticXOR(scrambled);
    }

    decrypt(cipherText) {
        let decoded = this.reverseChaoticXOR(cipherText);
        return this.reversePolynomialScramble(decoded);
    }
}

// Function to handle encryption
function encryptData() {
    let key = document.getElementById("encryptionKey").value;
    let inputText = document.getElementById("inputText").value;

    if (!key || !inputText) {
        alert("Please enter both key and text.");
        return;
    }

    let cipher = new AdvancedQuantumCipher(key);
    let encryptedText = cipher.encrypt(inputText);

    document.getElementById("output").textContent = `${encryptedText}`;
}

// Function to handle decryption
function decryptData() {
    let key = document.getElementById("encryptionKey").value;
    let inputText = document.getElementById("inputText").value;

    if (!key || !inputText) {
        alert("Please enter both key and text.");
        return;
    }

    let cipher = new AdvancedQuantumCipher(key);
    let decryptedText = cipher.decrypt(inputText);

    document.getElementById("output").textContent = `${decryptedText}`;
}
