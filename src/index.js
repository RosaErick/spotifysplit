import express from "express";
import 'dotenv/config';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const port = process.env.PORT || 3000;


const app = express();


app.get("/", (req, res) => {
  res.send("health check");
});





app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
