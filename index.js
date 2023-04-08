require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const URL = require('./url.model');
const urlParser = require('url');
const dns = require('dns');
const uri = process.env.MONGO_URI;
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', (req, res) => {
  let ipaddress = urlParser.parse(req.body.url).hostname;
  dns.lookup(ipaddress, async (err, address, family) => {
    if (err) {
      res.json({ error: 'Invalid URL' });
    } else {
      const urls = await URL.find();
      const shortUrl =
        urls.length > 0 ? Math.max(...urls.map((el) => el.short_url)) + 1 : 0;
      const doc = {
        "original_url": req.body.url,
        "short_url": shortUrl
      }
      res.json(doc);
      //save document
      const url = new URL(doc);
      await url.save()
    }
  })
});

app.get('/api/shorturl/:shorturl', async (req, res) => {
  const url = await URL.findOne({ short_url: req.params.shorturl })
  if (url) {
    res.redirect(url.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
