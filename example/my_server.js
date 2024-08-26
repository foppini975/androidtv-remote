import {
    AndroidRemote,
    RemoteKeyCode,
    RemoteDirection
} from "androidtv-remote";

import Readline from "readline";
import fs from 'fs/promises';

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from 'body-parser';
const { json } = pkg;

const app = express();
const port = 3000;

// Middleware to allow cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with your allowed origins
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware to parse JSON bodies
app.use(json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.url);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.status(404).send(`File ${req.url} not found`);
      } else {
        // Other error
        res.status(500).send('Internal server error');
      }
    }
  });
});

// POST endpoint to receive a string
app.post('/api/sendKey', (req, res) => {
  const inputString = req.body.input;
  
  if (!inputString) {
    return res.status(400).json({ error: 'No input string provided' });
  }
  

  const command_code = parseInt(inputString, 10);
        
  if (!isNaN(command_code)) {
      console.log(`Sending code ${command_code}`);
      androidRemote.sendKey(command_code, RemoteDirection.SHORT)
  }
  else {
    return res.status(400).json({ error: 'Command code must be numeric' });
  }

  res.json({
    result: "Success"
  });

});

// POST endpoint to receive a string
app.post('/api/sendLink', (req, res) => {
  console.log(`SendLink API invoked`);
  const inputString = req.body.input;
  console.log(`Input string: ${inputString}`);
  
  if (!inputString) {
    return res.status(400).json({ error: 'No input string provided' });
  }

  console.log(`Sending link ${inputString}`);
  androidRemote.sendAppLink(inputString)

  res.json({
    result: "Success"
  });

});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


let line = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let certificate = {};
let cert = await readFileIfExists('certificate.pem');
let key = await readFileIfExists('private-key.pem');
if (cert && key) {
    console.log("Found certificate files");
    certificate = {'cert': cert, 'key': key};
}
else {
    console.log("Certificate files not found");
}

const host = "192.168.1.25";
const options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'androidtv-remote',
    cert: certificate,
}

let androidRemote = new AndroidRemote(host, options)

androidRemote.on('secret', () => {
    line.question("Code : ", async (code) => {
        androidRemote.sendCode(code);
    });
});

androidRemote.on('powered', (powered) => {
    console.debug("Powered : " + powered)
});

androidRemote.on('volume', (volume) => {
    console.debug("Volume : " + volume.level + '/' + volume.maximum + " | Muted : " + volume.muted);
});

androidRemote.on('current_app', (current_app) => {
    console.debug("Current App : " + current_app);
});

androidRemote.on('error', (error) => {
    console.error("Error : " + error);
});

androidRemote.on('unpaired', () => {
    console.error("Unpaired");
});

async function writeStringToFile(filename, content) {
    try {
      await fs.writeFile(filename, content, 'utf8');
      console.log(`Successfully wrote to ${filename}`);
    } catch (error) {
      console.error(`Error writing to file: ${error}`);
    }
  }

async function readFileIfExists(filename) {
    try {
      // Check if the file exists
      await fs.access(filename);
      
      // If we reach this point, the file exists. Let's read it.
      const filecontent = await fs.readFile(filename, 'utf8');
      return filecontent;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('The file ' + filename + ' does not exist.');
      } else {
        console.error('An error occurred:', error);
      }
      return null;
    }
  }
  
  
androidRemote.on('ready', async () => {

    console.log("Ready");
    let certificate = androidRemote.getCertificate();
    console.log('Writing certificate to disk');
    writeStringToFile('certificate.pem', certificate['cert']);
    writeStringToFile('private-key.pem', certificate['key']);

    /*
    const certPem = cert.export({ type: 'pem' });
    const keyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });
    fs.writeFileSync('certificate.pem', cert['cert']);
    fs.writeFileSync('private-key.pem', cert['key']);
    */

});

console.log("Enter command")
line.on('line', (input) => {
    
    const char = input.trim();

    if (char.startsWith('>')) {
        const numericPart = char.slice(1);
        let command_code = parseInt(numericPart, 10);
        
        if (!isNaN(command_code)) {
            console.log(`Sending code ${command_code}`);
            androidRemote.sendKey(command_code, RemoteDirection.SHORT)
        }
        else {
            console.log("Command code is not numeric, ignoring")
        }
    } else if (char === 'H') {
      console.log('Sending code Home');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_HOME, RemoteDirection.SHORT)
    } else if (char === '+') {
        console.log('Volume Up');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_UP, RemoteDirection.SHORT)
    } else if (char === '-') {
        console.log('Volume Down');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_DOWN, RemoteDirection.SHORT)
    } else if (char === 'h') {
        console.log('Dpad Left');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_DPAD_LEFT, RemoteDirection.SHORT)
    } else if (char === 'j') {
        console.log('Dpad Down');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_DPAD_DOWN, RemoteDirection.SHORT)
    } else if (char === 'k') {
        console.log('Dpad Up');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_DPAD_UP, RemoteDirection.SHORT)
    } else if (char === 'l') {
        console.log('Dpad Right');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_DPAD_RIGHT, RemoteDirection.SHORT)
    } else if (char === 'ENTER') {
        console.log('Dpad Enter');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_ENTER, RemoteDirection.SHORT)
    } else if (char === 'CENTER') {
        console.log('Dpad Center');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_DPAD_CENTER, RemoteDirection.SHORT)
    } else if (char === 'p+') {
        console.log('Channel Up');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_CHANNEL_UP, RemoteDirection.SHORT)
    } else if (char === 'p-') {
        console.log('Channel down');
        androidRemote.sendKey(RemoteKeyCode.KEYCODE_CHANNEL_DOWN, RemoteDirection.SHORT)
    } else if (char === 't') {
      console.log('Opening TV Launcher');
      androidRemote.sendAppLink("com.google.android.tvlauncher");
    } else if (char === 'd') {
      console.log('Opening dazn');
      androidRemote.sendAppLink("https://www.dazn.com");
    } else if (char === 'r') {
      console.log('Opening raiplay');
      androidRemote.sendAppLink("it.rainet.androidtv");
    } else if (char === 'POWER') {
      console.log('Power');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_POWER, RemoteDirection.SHORT)
    } else if (char === '0') {
      console.log('Keycode 0');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_0, RemoteDirection.SHORT)
    } else if (char === '1') {
      console.log('Keycode 1');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_1, RemoteDirection.SHORT)
    } else if (char === '2') {
      console.log('Keycode 2');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_2, RemoteDirection.SHORT)
    } else if (char === '3') {
      console.log('Keycode 3');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_3, RemoteDirection.SHORT)
    } else if (char === '4') {
      console.log('Keycode 4');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_4, RemoteDirection.SHORT)
    } else if (char === '5') {
      console.log('Keycode 5');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_5, RemoteDirection.SHORT)
    } else if (char === '6') {
      console.log('Keycode 6');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_6, RemoteDirection.SHORT)
    } else if (char === '7') {
      console.log('Keycode 7');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_7, RemoteDirection.SHORT)
    } else if (char === '8') {
      console.log('Keycode 8');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_8, RemoteDirection.SHORT)
    } else if (char === '9') {
      console.log('Keycode 9');
      androidRemote.sendKey(RemoteKeyCode.KEYCODE_9, RemoteDirection.SHORT)
    } else {
      console.log(`sending app link: ${char}`);
      androidRemote.sendAppLink(char);
    }

    console.log("Enter command")
  });

let started = await androidRemote.start();

