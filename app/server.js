import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"))
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());

app.post("/save-game", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { board, score, startTime, endTime } = req.body;
    console.log("Saving game:", { uid, board, score, startTime, endTime });

    await db.collection("games").add({
      uid,
      board,
      score,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Failed to save game:", error);
    res.status(500).send({ error: "Failed to save game" });
  }
});

app.post("/unlock-achievement", async (req, res) => {
  const { achievementId } = req.body;
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRef = db.collection("players").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn(`❌ No player document found for UID: ${uid}`);
      return res.status(404).send({ error: "Player not found" });
    }

    await userRef.update({
      achievements: admin.firestore.FieldValue.arrayUnion(achievementId)
    });

    res.status(200).send({ newlyUnlocked: true });
  } catch (err) {
    console.error("Error unlocking achievement:", err);
    res.status(500).send("Internal error");
  }
});


app.post("/update-score", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  const score = parseInt(req.body.score, 10);

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const playerRef = db.collection("players").doc(uid);
    const playerSnap = await playerRef.get();
    const existing = playerSnap.data()?.highestScore ?? -Infinity;

    if (score > existing) {
      await playerRef.update({ highestScore: score });
    }

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error in /update-score route:", error);
    res.status(500).send({ error: "Failed to update score" });
  }
});

app.post("/create-player", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const playerRef = db.collection("players").doc(uid);
    const playerSnap = await playerRef.get();

    if (!playerSnap.exists) {
      await playerRef.set({
        highestScore: -16,
        achievements: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.status(200).send({ created: true });
  } catch (error) {
    console.error("Failed to create player document:", error);
    res.status(500).send({ error: "Failed to create player document" });
  }
});

app.get("/player-data", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const doc = await db.collection("players").doc(uid).get();
    res.status(200).send(doc.data());
  } catch (err) {
    console.error("Failed to fetch player data:", err);
    res.status(500).send({ error: "Failed to fetch player data" });
  }
});

app.post("/leaderboard", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  const { townName, score } = req.body;

  if (!townName || score == null) {
    return res.status(400).send({ error: "Name and score are required" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    await db.collection("leaderboard").add({
      townName,
      score: parseInt(score, 10),
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Leaderboard save failed:", err);
    res.status(500).send({ error: "Internal error" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const snapshot = await db
      .collection("leaderboard")
      .orderBy("score", "desc")
      .limit(10)
      .get();

    const leaderboard = snapshot.docs.map(doc => doc.data());
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

const PORT = process.env.VITE_BACKEND_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
