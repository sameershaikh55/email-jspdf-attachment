const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const sendEmail = require("./utils/sendEmail");
const upload = require("./utils/pdfUpload");
const path = require("path");
const fs = require("fs");

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

require("dotenv").config({ path: "config/config.env" });

app.post("/api/email", upload.single("pdf"), async (req, res, next) => {
  const { email } = req.body;
  const imgPath = path.resolve(__dirname, "public/pdfs", req.file.filename);

  if (!email) {
    res.status(400).json({
      success: false,
      message: `Invalid Email!`,
    });
    fs.unlinkSync(imgPath);
  }

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    const message = `You can download the PDF below`;

    try {
      await sendEmail({
        email: email,
        subject: `PDF`,
        message,
        attachments: {
          filename: "file.pdf",
          path: imgPath,
          cid: new Date().toISOString().replace(/:/g, "-") + "-" + "file.pdf",
        },
      });

      res.status(200).json({
        success: true,
        message: `PDF sent to you email ${email} successfully`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Server Error!`,
      });
      fs.unlinkSync(imgPath);
    }
  } else {
    res.status(400).json({
      success: false,
      message: `Invalid Email Address!`,
    });
    fs.unlinkSync(imgPath);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
