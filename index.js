const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const multer = require("multer");
const Joi = require("joi");

const port = process.env.PORT || 5000;

app.use(express.json());

// const schema = Joi.object({
//   firstName: Joi.string().min(2).max(25).required("Please enter First name"),
//   lastName: Joi.string().min(2).max(25).required("Please enter Last name"),
//   mobileNumber: Joi.number().required("Please enter Number"),
//   subject: Joi.string().required("Please enter Subject"),
//   message: Joi.string().min(50).max(300).required("Please enter Message"),
//   file: Joi.object(),
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

const uri =
  "mongodb+srv://tareq:y03apIIvGcprCOmt@cluster0.ywossa9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const dataCollection = client.db("form").collection("contactRequest");

    //File Post with data
    app.post("/api/uploads", upload.single("file"), function (req, res) {
      const file = req.file;
      const body = req.body;
      const addedData = {
        firstName: body?.firstName,
        lastName: body?.lastName,
        mobileNumber: body?.mobileNumber,
        subject: body?.subject,
        message: body?.message,
        fileName: file?.filename,
      };

      const result = dataCollection.insertOne(addedData);
      return res.send({ success: true, result });
    });


    //Get 
    app.get("/contact", async (req, res) => {
      const contactRequest = await dataCollection.find().toArray();
      res.send(contactRequest);
    });
  } finally {
    //
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Form backend");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
