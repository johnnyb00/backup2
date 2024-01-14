const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sassMiddleware = require('node-sass-middleware');
const favicon = require('serve-favicon');
const path = require('path');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const helmet = require('helmet');

const app = express();
const port = 3000;

const faviconPath = path.join(__dirname, 'images', 'frontier_testing_logo.ico');
app.use(favicon(faviconPath));

// Add a route for the new page
app.get('/views/browsercompatibility.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'browsercompatibility.html'));
});

// Add a route for the new page
app.get('/views/links.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'links.html'));
});


// Add a route for the new page
app.get('/views/speed.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'speed.html'));
});

// Add a route for the new page
app.get('/views/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Set up the Sass middleware
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // Set to true if you are using indentedSyntax
  sourceMap: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Send the index.html file when accessing the root URL
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Links
app.post('/test-links', async (req, res) => {
  const websiteUrl = req.body.websiteUrl;

  try {
    const results = await testWebsiteLinks(websiteUrl);
    res.send(results);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

async function testWebsiteLinks(websiteUrl) {
  const response = await axios.get(websiteUrl);
  const links = extractLinks(response.data);

  const linkResults = [];

  for (const link of links) {
    try {
      const linkResponse = await axios.get(link);
      linkResults.push({
        link,
        status: linkResponse.status,
      });
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        linkResults.push({
          link,
          error: statusCode >= 400 && statusCode < 500 ? `Client Error: ${statusCode}` : `Server Error: ${statusCode}`,
        });
      } else {
        linkResults.push({
          link,
          error: `Error testing link ${link}: ${error.message}`,
        });
      }
    }
  }

  return linkResults;
}

function extractLinks(html) {
  const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

// Browser Compatibility
app.post('/test-browser-compatibility', async (req, res) => {
  const websiteUrl = req.body.websiteUrl;

  try {
    const results = await runCompatibilityTest(websiteUrl);
    res.send(results);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

async function runCompatibilityTest(targetUrl) {
  const browsers = ['chrome', 'firefox', 'MicrosoftEdge'];
  const compatibilityResults = [];

  for (const browserName of browsers) {
    console.log(`Testing on ${browserName}...`);

    let driver;
    switch (browserName.toLowerCase()) {
      case 'chrome':
        driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build();
        break;
      case 'firefox':
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(new firefox.Options().headless()).build();
        break;
      case 'microsoftedge':
        driver = await new Builder().forBrowser('MicrosoftEdge').setEdgeOptions(new chrome.Options().headless()).build();
        break;
      default:
        console.error(`Unsupported browser: ${browserName}`);
        continue;
    }

    try {
      await driver.get(targetUrl);

      const logs = await driver.manage().logs().get('browser');
      const errorMessages = logs.filter(log => log.level === 'SEVERE').map(log => log.message);
      const hasConsoleErrors = errorMessages.length > 0;

      const isPass = !hasConsoleErrors;

      if (isPass) {
        console.log('\x1b[32m%s\x1b[0m', `Compatibility test on ${browserName} passed.`);
      } else {
        console.error('\x1b[31m%s\x1b[0m', `Compatibility test on ${browserName} failed due to console errors:`, errorMessages);
      }

      compatibilityResults.push({
        browser: browserName,
        isPass,
        errorMessages: isPass ? null : errorMessages,
      });
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', `Error while testing on ${browserName}: ${error.message}`);
    } finally {
      await driver.quit();
    }
  }

  console.log('Compatibility testing completed.');
  return compatibilityResults;
}

// Speed
async function measurePageLoadTime(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(chalk.blue(`Navigating to: ${url}`));
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    console.log(chalk.green(`Page loaded in ${loadTime} milliseconds.`));

    return loadTime;
  } catch (error) {
    console.error(chalk.red(`An error occurred: ${error.message}`));
    throw error;
  } finally {
    await browser.close();
  }
}

function classifyPageLoadTime(loadTime) {
  if (loadTime < 2000) {
    console.log(chalk.green('Page load time is FAST.'));
    return 'Fast';
  } else if (loadTime >= 2000 && loadTime < 5000) {
    console.log(chalk.yellow('Page load time is MODERATE.'));
    return 'Moderate';
  } else {
    console.log(chalk.red('Page load time is SLOW.'));
    return 'Slow';
  }
}

app.post('/test-speed', async (req, res) => {
  const websiteUrl = req.body.websiteUrl;

  try {
    // Run three speed tests
    const loadTimes = [];
    for (let i = 0; i < 3; i++) {
      const loadTime = await measurePageLoadTime(websiteUrl);
      loadTimes.push(loadTime);
    }

    // Calculate average load time
    const averageLoadTime = loadTimes.reduce((acc, time) => acc + time, 0) / loadTimes.length;

    // Classify average load time
    const averageClassification = classifyPageLoadTime(averageLoadTime);

    res.json({ loadTimes, averageLoadTime, averageClassification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Security

// Helmet.js security protection functions
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({
  action: 'deny',
  domain: '/views/index.html'
}));
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
  maxAge: 123,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies({
  allowedPolicies: 'none'
}));
app.use(helmet.referrerPolicy({
  policy: 'same-origin'
}));
app.use(helmet.xssFilter());


app.use(helmet({
  frameguard: {         // configure
    action: 'deny'
  },
  dnsPrefetchControl: false     // disable
}))

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"], // Allow only same-origin scripts
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"]
  }
}));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

