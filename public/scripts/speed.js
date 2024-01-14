async function testSpeed() {
    const websiteUrl = document.getElementById('websiteUrl').value;
    const loadingSpinner = document.getElementById('loading-spinner');
  
    // Display loading spinner
    loadingSpinner.style.display = 'block';
  
    try {
      const response = await fetch('/test-speed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl }),
      });
  
      const results = await response.json();
  
      // Hide loading spinner
      loadingSpinner.style.display = 'none';
  
      // Display the results
      displaySpeedResults(results);
    } catch (error) {
      console.error(`Error during speed test: ${error.message}`);
      // Handle error display if needed
    }
  }
  
  function displaySpeedResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results
  
    // Display individual load times in a table
    const table = document.createElement('table');
    table.classList.add('speed-results-table');
  
    // Create table header
    const headerRow = table.insertRow();
    const headerCell1 = headerRow.insertCell(0);
    const headerCell2 = headerRow.insertCell(1);
    headerCell1.textContent = 'Tests ';
    headerCell2.textContent = 'Load Time (ms)';
  
    // Populate table with results
    results.loadTimes.forEach((loadTime, index) => {
      const row = table.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.textContent = `Test ${index + 1}`;
      cell2.innerHTML = `<span class="status-label ${getStatusLabel(loadTime)}">${loadTime}</span>`;
    });
  
    resultsDiv.appendChild(table);
  
    // Display average load time
    const averageLoadTimeDisplay = document.createElement('p');
    averageLoadTimeDisplay.textContent = `Average load time: ${results.averageLoadTime.toFixed(2)} milliseconds`;
    resultsDiv.appendChild(averageLoadTimeDisplay);
  
    // Display and style classification
    const classificationDisplay = document.createElement('p');
    const statusLabel = getStatusLabel(results.averageLoadTime);
    classificationDisplay.innerHTML = `Classification: <span class="status-label ${statusLabel}">${results.averageClassification}</span>`;
    resultsDiv.appendChild(classificationDisplay);

  }
  
  function getStatusLabel(loadTime) {
    if (loadTime < 2000) {
      return 'success'; // Fast
    } else if (loadTime >= 2000 && loadTime < 5000) {
      return 'unknown'; // Moderate
    } else {
      return 'warning'; // Slow
    }
  }
  
  function updateFullUrl(inputValue) {
    const fullUrlDisplay = document.getElementById('fullUrlDisplay');
    fullUrlDisplay.textContent = inputValue;
  }
  