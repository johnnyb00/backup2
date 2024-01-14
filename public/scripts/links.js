async function saveToPDF() {
  // Show loading spinner
  showLoadingSpinner();

  const editorContent = document.querySelector('.editor-textarea-editable').innerHTML;

  // Create a new jsPDF instance
  const pdf = new jsPDF();

  // Add editor content to the PDF
  pdf.fromHTML(editorContent, 15, 15);

  // Save the PDF
  pdf.save('editor_content.pdf');

  // Hide loading spinner
  hideLoadingSpinner();
}


async function testLinks() {
  // Show loading spinner
  showLoadingSpinner();

  const websiteUrl = document.getElementById('websiteUrl').value;
  const outputOptionCheckbox = document.getElementById('outputOptionCheckbox');
  const outputFormat = outputOptionCheckbox.checked ? ['json', 'csv'] : ['json'];

  const response = await fetch('/test-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ websiteUrl, outputFormat }),
  });

  const results = await response.json();

  // Hide loading spinner
  hideLoadingSpinner();

  // Display the results for JSON format
  displayResults(results);

  // If CSV format is selected, trigger CSV file download
  if (outputOptionCheckbox.checked) {
    downloadCSV(results);
  }
}

function downloadCSV(results) {
  const csvContent = results.map((result) => `${result.link},${result.status || result.error || 'Unknown'}`).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  
  // Create a new Date object
  var currentDate = new Date();

  // Get the current year, month, and day
  var year = currentDate.getFullYear();
  var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 as months are zero-based
  var day = currentDate.getDate().toString().padStart(2, '0');

  // Get the current hours and minutes
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();

  // Format the date and time
  var formattedDateTime = year + '-' + month + '-' + day + '-' +
    (hours < 10 ? '0' : '-') + hours + ':' + (minutes < 10 ? '0' : ':') + minutes;

  link.href = window.URL.createObjectURL(blob);
  link.download = `Frontier_LinkTest_${formattedDateTime}.csv`;
  link.click();
}

function showLoadingSpinner() {
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner() {
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner.style.display = 'none';
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  if (results.loading) {
    // Server is still processing, do nothing
    return;
  }

  if (results.length === 0) {
    resultsDiv.innerHTML = 'No links found.';
    return;
  }

  const table = document.createElement('table');

  // Create table header
  const headerRow = table.insertRow();
  const headerCell1 = headerRow.insertCell(0);
  const headerCell2 = headerRow.insertCell(1);
  headerCell1.textContent = 'Link';
  headerCell2.textContent = 'Status';

  headerCell1.style.color = 'white';
  headerCell2.style.color = 'white';

  // Populate table with results
  results.forEach((result) => {
    const row = table.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);

    cell1.style.color = 'white';

    cell1.textContent = result.link;

    if (result.status) {
      cell2.innerHTML = `<span class="status-label success">${result.status}</span>`;
    } else if (result.error) {
      cell2.innerHTML = `<span class="status-label error">${result.error}</span>`;
    } else {
      cell2.innerHTML = `<span class="status-label unknown">Unknown</span>`;
    }
  });

  resultsDiv.appendChild(table);
}

function updateFullUrl(inputValue) {
  const fullUrlDisplay = document.getElementById('fullUrlDisplay');
  fullUrlDisplay.textContent = inputValue;
}
