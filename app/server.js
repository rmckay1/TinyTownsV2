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
app.options("*", cors()); // ✅ this line is crucial!
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
      score, // already a string
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Failed to save game:", error);
    res.status(500).send({ error: "Failed to save game" });
  }
});

app.post('/unlock-achievement', async (req, res) => {
  const { achievementId } = req.body;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const userRef = admin.firestore().collection('players').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({ achievements: [achievementId] });
      return res.status(200).send({ newlyUnlocked: true });
    }

    const userData = userSnap.data();
    const existing = userData.achievements || [];

    if (existing.includes(achievementId)) {
      return res.status(200).send({ newlyUnlocked: false });
    }

    await userRef.update({
      achievements: admin.firestore.FieldValue.arrayUnion(achievementId)
    });

    return res.status(200).send({ newlyUnlocked: true });

  } catch (err) {
    console.error("Error unlocking achievement:", err);
    return res.status(500).send("Internal error");
  }
});


app.post("/update-score", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const { score } = req.body;

    const playerRef = db.collection("players").doc(uid);
    const playerSnap = await playerRef.get();

    const existing = playerSnap.exists ? playerSnap.data().highestScore || "0" : "0";

    if (parseInt(score) > parseInt(existing)) {
      await playerRef.set({ highestScore: score }, { merge: true });
    }

    res.status(200).send({ updated: true });
  } catch (error) {
    res.status(500).send({ error: "Failed to update score" });
  }
});

app.get("/player-data", async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const doc = await db.collection("players").doc(uid).get();
    if (!doc.exists) return res.status(200).send({ achievements: [], highestScore: "0" });

    res.status(200).send(doc.data());
  } catch (err) {
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




const PORT = process.env.VITE_BACKEND_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
