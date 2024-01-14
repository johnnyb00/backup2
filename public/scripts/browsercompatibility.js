// Add a loading spinner element to your HTML
const loadingSpinner = document.getElementById('loading-spinner');

function runCompatibilityTest() {
  // Show loading spinner
  loadingSpinner.style.display = 'block';

  // Get the entered website URL
  const websiteUrl = document.getElementById('websiteUrl').value.trim();

  // Validate if the URL is empty
  if (!websiteUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'Please enter a valid website URL.');
    // Hide loading spinner in case of an error
    loadingSpinner.style.display = 'none';
    return;
  }

  // Make an AJAX request to the server to run browser compatibility tests
  fetch('/test-browser-compatibility', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ websiteUrl }),
  })
    .then(response => response.json())
    .then(results => {
      // Display the results
      displayResults(results);
      // Hide loading spinner after displaying results
      loadingSpinner.style.display = 'none';
    })
    .catch(error => {
      console.error('\x1b[31m%s\x1b[0m', `Error while running browser compatibility tests: ${error.message}`);
      // Hide loading spinner in case of an error
      loadingSpinner.style.display = 'none';
    });
}

function displayResults(results) {
  // Display the browser compatibility test results on the client side
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  if (results.length === 0) {
    resultsDiv.innerHTML = 'No compatibility results found.';
    return;
  }

  const table = document.createElement('table');

  // Create table header
  const headerRow = table.insertRow();
  const headerCell1 = headerRow.insertCell(0);
  const headerCell2 = headerRow.insertCell(1);
  const headerCell3 = headerRow.insertCell(2);
  headerCell1.textContent = 'Browser';
  headerCell2.textContent = 'Status';
  headerCell3.textContent = 'Error Messages';

  // Populate table with results
  results.forEach(result => {
    const row = table.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    
    cell1.textContent = result.browser;

    // Use span with class based on the result status
    cell2.innerHTML = result.isPass
      ? '<span class="status-label success">Pass</span>'
      : `<span class="status-label error">Fail</span>`;

    // Use different styles based on the presence of error messages
    cell3.innerHTML = result.errorMessages
      ? `<span class="status-label error">${result.errorMessages.join('<br>')}</span>`
      : '<span class="status-label success">No errors</span>';
  });

  resultsDiv.appendChild(table);
}

function updateFullUrl(inputValue) {
  const fullUrlDisplay = document.getElementById('fullUrlDisplay');
  fullUrlDisplay.textContent = inputValue;
}
