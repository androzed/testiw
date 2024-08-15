const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files (screenshots) from the "public" directory
app.use('/screenshots', express.static(path.join(__dirname, 'public')));

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL query parameter is required');
  }

  // Launch Puppeteer with --no-sandbox and --disable-setuid-sandbox flags
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Set viewport size
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the specific element to be loaded
    await page.waitForSelector('#capture3');

    
    // Create a file name based on the current timestamp
    const timestamp = Date.now();
    const filePath = path.join(__dirname, 'public', `recipe-${timestamp}.png`);

    // Capture the specific element and its content
    const element = await page.$('#capture3');
    await element.screenshot({ path: filePath });

    // Close the browser
    await browser.close();

    // Respond with the screenshot URL
    const screenshotUrl = `/screenshots/recipe-${timestamp}.png`;
    res.json({ screenshotUrl });
  } catch (error) {
    await browser.close();
    res.status(500).send('error screenshot');
  }
});

// Create "public" directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
