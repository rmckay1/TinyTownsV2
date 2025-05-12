# TinyTownsV2 Deployment Guide

This guide will walk you through cloning the TinyTownsV2 repo, installing Docker, configuring Firebase, and running both server and client in Docker containers.

---

## Prerequisites

- **Git** (v2.0+)
- **Docker & Docker Compose**  
  Install Docker Desktop (Windows/macOS) or Docker Engine + Compose (Linux) from https://docs.docker.com/get-docker/

- **Firebase account**  
  You’ll need a Firebase project with Authentication and Firestore enabled.

---

## 1. Clone the repository

```bash
git clone https://github.com/rmckay1/TinyTownsV2.git
```
## 2. Generate Firebase credentials
Go to https://console.firebase.google.com/ → your project (make new one if needed) → Project settings (gear icon).

Under Service accounts, click Generate new private key and download the JSON.

Move that file into your project app folder and rename to:
./app/serviceAccountKey.json

Also create the file
./app/.env

And inside that file should be:
PORT=3000

Now in the firebase console, go to build → authentication → get started
for sign in methods select google and email/password (keep default options)

Now back in the console, go to build → Firestore Database -> get started → create new DB in production mode

In the firebase console, go to get started → add firebase to your app → web app → register with a name.
Now copy the api code into your firebaseConfig.json file in the app directory of your project.
```bash
const firebaseConfig = {
  apiKey: "xxxxxxx",
  authDomain: "xxxxxx",
  projectId: "xxxxx",
  storageBucket: "xxxxxxx",
  messagingSenderId: "xxxxx",
  appId: "x:xx:xxx:xxx",
  measurementId: "xxxxxxxx"
};
```
## 3. Deploy with docker
while in the root directory of your project, run the command:

```bash
docker compose up
```

## 4. Play the game
In a browser, go to http://localhost:5173/ and log in to acess Tiny Towns


