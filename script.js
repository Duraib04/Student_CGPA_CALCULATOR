// Initialize theme on page load
function initTheme() {
  // Check localStorage first, then system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

// Toggle between light and dark themes
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

// Update theme toggle icon
function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Clear sessionStorage when page loads (new session)
window.addEventListener('load', function() {
  // Initialize theme
  initTheme();
  
  // Clear register number from previous session
  sessionStorage.removeItem('registerNumber');
  
  // Load saved data from localStorage
  loadFromLocalStorage();
  
  // Add auto-save listeners to existing inputs
  document.querySelectorAll('.table-input').forEach(input => {
    input.addEventListener('input', saveToLocalStorage);
  });
  
  // Add credit validation to existing credit inputs
  document.querySelectorAll('.credit-input').forEach(input => {
    input.addEventListener('input', validateCreditInput);
  });
});

// Save current state to localStorage
function saveToLocalStorage() {
  const rows = document.querySelectorAll('#gradesBody tr');
  const data = [];
  
  rows.forEach(row => {
    const courseCode = row.querySelectorAll('.table-input')[0].value;
    const courseName = row.querySelectorAll('.table-input')[1].value;
    const credit = row.querySelector('.credit-input').value;
    const grade = row.querySelector('.grade-select').value;
    
    data.push({ courseCode, courseName, credit, grade });
  });
  
  localStorage.setItem('cgpaCalculatorData', JSON.stringify(data));
}

// Load saved state from localStorage
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('cgpaCalculatorData');
  
  if (!savedData) return;
  
  try {
    const data = JSON.parse(savedData);
    
    if (data.length === 0) return;
    
    // Ask user if they want to restore previous session
    const container = document.querySelector('.cgpa-calculator');
    const promptDiv = document.createElement('div');
    promptDiv.className = 'upload-status success';
    promptDiv.style.display = 'block';
    promptDiv.innerHTML = `
      <strong>Previous session found!</strong>
      <p>Would you like to restore your saved data?</p>
      <button onclick="restoreSession()" style="margin: 0.5rem 0.25rem; padding: 0.5rem 1rem; background: #0f766e; color: white; border: none; border-radius: 4px; cursor: pointer;">Restore</button>
      <button onclick="clearSession()" style="margin: 0.5rem 0.25rem; padding: 0.5rem 1rem; background: #64748b; color: white; border: none; border-radius: 4px; cursor: pointer;">Start Fresh</button>
    `;
    
    container.insertBefore(promptDiv, container.firstChild);
  } catch (error) {
    // Invalid data, clear it
    localStorage.removeItem('cgpaCalculatorData');
  }
}

// Restore session from saved data
function restoreSession() {
  const savedData = localStorage.getItem('cgpaCalculatorData');
  
  if (!savedData) return;
  
  try {
    const data = JSON.parse(savedData);
    const tbody = document.getElementById('gradesBody');
    
    // Clear existing rows
    tbody.innerHTML = '';
    rowCount = 0;
    
    // Restore each row
    data.forEach(item => {
      rowCount++;
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="table-input" placeholder="Course Code" value="${sanitizeInput(item.courseCode || '')}"></td>
        <td><input type="text" class="table-input" placeholder="Course Name" value="${sanitizeInput(item.courseName || '')}"></td>
        <td><input type="number" class="table-input credit-input" placeholder="3" min="0.5" max="4" step="0.5" value="${item.credit || ''}"></td>
        <td>
          <select class="table-input grade-select">
            <option value="">Select</option>
            <option value="10" ${item.grade === '10' ? 'selected' : ''}>O</option>
            <option value="9" ${item.grade === '9' ? 'selected' : ''}>A+</option>
            <option value="8" ${item.grade === '8' ? 'selected' : ''}>A</option>
            <option value="7" ${item.grade === '7' ? 'selected' : ''}>B+</option>
            <option value="6" ${item.grade === '6' ? 'selected' : ''}>B</option>
            <option value="5" ${item.grade === '5' ? 'selected' : ''}>C</option>
            <option value="0" ${item.grade === '0' ? 'selected' : ''}>F</option>
          </select>
        </td>
        <td class="grade-point">-</td>
        <td><button type="button" class="remove-btn" onclick="removeRow(this)">×</button></td>
      `;
      tbody.appendChild(newRow);
      
      // Add listeners
      newRow.querySelectorAll('.table-input').forEach(input => {
        input.addEventListener('input', saveToLocalStorage);
      });
      newRow.querySelector('.credit-input').addEventListener('input', validateCreditInput);
    });
    
    // Remove prompt
    document.querySelector('.upload-status')?.remove();
    
    // Show success toast
    toast.success('Previous session restored successfully!');
  } catch (error) {
    localStorage.removeItem('cgpaCalculatorData');
  }
}

// Clear saved session
function clearSession() {
  localStorage.removeItem('cgpaCalculatorData');
  document.querySelector('.upload-status')?.remove();
}

// Utility function to show error messages
function showError(message, container) {
  const existingError = container.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  const strong = document.createElement('strong');
  strong.textContent = '⚠️ Error';
  const p = document.createElement('p');
  p.textContent = message;
  errorDiv.appendChild(strong);
  errorDiv.appendChild(p);
  container.appendChild(errorDiv);
  
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Sanitize text input to prevent XSS
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validate KSRCE register number format
function validateRegisterNumber(regno) {
  // KSRCE format: typically starts with 2 digits (year) followed by alphanumeric
  // Examples: 21CSR001, 22EEE123, 21MEC045
  const pattern = /^[0-9]{2}[A-Z]{3}[0-9]{3,4}$/i;
  return pattern.test(regno);
}

// Handle form submission
document.getElementById('resultForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const regno = document.getElementById('regno').value.trim().toUpperCase();
  const formContainer = document.querySelector('.form-container');
  
  if (!regno) {
    showError('Please enter your Register Number', formContainer);
    return;
  }
  
  // Validate register number format
  if (!validateRegisterNumber(regno)) {
    showError('Invalid register number format. Expected format: 21CSR001 (2 digits + 3 letters + 3-4 digits)', formContainer);
    return;
  }
  
  // Hide any previous error messages
  const existingError = formContainer.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Store register number in sessionStorage
  sessionStorage.setItem('registerNumber', regno);
  
  // Show loading state
  const submitBtn = this.querySelector('.submit-btn');
  submitBtn.textContent = 'Loading Results...';
  submitBtn.disabled = true;
  
  // Navigate to results page
  window.location.href = 'results.html';
});

// CGPA Calculator Functions
let rowCount = 1;

function addRow() {
  rowCount++;
  const tbody = document.getElementById('gradesBody');
  const newRow = document.createElement('tr');
  
  newRow.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" class="table-input" placeholder="Course Code"></td>
    <td><input type="text" class="table-input" placeholder="Course Name"></td>
    <td><input type="number" class="table-input credit-input" placeholder="3" min="0.5" max="4" step="0.5"></td>
    <td>
      <select class="table-input grade-select">
        <option value="">Select</option>
        <option value="10">O</option>
        <option value="9">A+</option>
        <option value="8">A</option>
        <option value="7">B+</option>
        <option value="6">B</option>
        <option value="5">C</option>
        <option value="0">F</option>
      </select>
    </td>
    <td class="grade-point">-</td>
    <td><button type="button" class="remove-btn" onclick="removeRow(this)">×</button></td>
  `;
  
  tbody.appendChild(newRow);
  
  // Add credit validation listener
  const creditInput = newRow.querySelector('.credit-input');
  creditInput.addEventListener('input', validateCreditInput);
  
  // Add auto-save listener
  newRow.querySelectorAll('.table-input').forEach(input => {
    input.addEventListener('input', saveToLocalStorage);
  });
  
  updateRowNumbers();
}

// Validate credit input
function validateCreditInput(e) {
  const input = e.target;
  const value = parseFloat(input.value);
  
  if (value < 0.5 || value > 4) {
    input.style.borderColor = '#b91c1c';
    input.title = 'Credits must be between 0.5 and 4.0';
  } else {
    input.style.borderColor = '';
    input.title = '';
  }
}

function removeRow(btn) {
  if (document.getElementById('gradesBody').children.length > 1) {
    btn.closest('tr').remove();
    updateRowNumbers();
  } else {
    const container = document.querySelector('.cgpa-calculator');
    showError('At least one course is required', container);
  }
}

function updateRowNumbers() {
  const rows = document.querySelectorAll('#gradesBody tr');
  rows.forEach((row, index) => {
    row.querySelector('td:first-child').textContent = index + 1;
  });
  rowCount = rows.length;
}

function calculateCGPA() {
  const rows = document.querySelectorAll('#gradesBody tr');
  let totalCredits = 0;
  let totalGradePoints = 0;
  let hasEmptyFields = false;

  rows.forEach((row, index) => {
    const creditInput = row.querySelector('.credit-input');
    const gradeSelect = row.querySelector('.grade-select');
    const gradePointCell = row.querySelector('.grade-point');
    
    const credit = parseFloat(creditInput.value) || 0;
    const gradePoint = parseFloat(gradeSelect.value);
    
    if (credit > 0 && gradePoint !== '' && !isNaN(gradePoint)) {
      const points = credit * gradePoint;
      totalCredits += credit;
      totalGradePoints += points;
      gradePointCell.textContent = gradePoint.toFixed(1);
    } else {
      gradePointCell.textContent = '-';
      if (credit > 0 || gradeSelect.value) {
        hasEmptyFields = true;
      }
    }
  });

  if (hasEmptyFields) {
    const container = document.querySelector('.cgpa-calculator');
    showError('Please fill in all credits and grades for the courses you want to include', container);
    return;
  }

  if (totalCredits === 0) {
    const container = document.querySelector('.cgpa-calculator');
    showError('Please enter at least one course with credits and grade', container);
    return;
  }

  const cgpa = totalGradePoints / totalCredits;
  
  document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);
  document.getElementById('cgpaValue').textContent = cgpa.toFixed(2);
}

// Convert grade letter to grade point
function gradeToPoint(grade) {
  const gradeMap = {
    'O': '10',
    'A+': '9',
    'A': '8',
    'B+': '7',
    'B': '6',
    'C': '5',
    'D': '4',
    'F': '0',
    'Ab': '0'
  };
  return gradeMap[grade] || '';
}

// Import results from portal
function importFromPortal() {
  try {
    const iframe = document.getElementById('resultsFrame');
    
    // Try to access iframe content
    let iframeDoc;
    try {
      iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
      alert('Unable to access portal results due to security restrictions. Please enter data manually.\n\nAlternatively:\n1. View your result in the portal above\n2. Manually copy Course Code, Course Name, and Grade\n3. Enter Credits for each course');
      return;
    }

    // Look for result table in iframe
    const tables = iframeDoc.querySelectorAll('table');
    let resultTable = null;
    
    // Find table containing grade information
    for (let table of tables) {
      const text = table.textContent.toLowerCase();
      if (text.includes('course code') || text.includes('grade') || text.includes('result')) {
        resultTable = table;
        break;
      }
    }

    if (!resultTable) {
      alert('No result table found in portal. Please ensure your results are displayed first.');
      return;
    }

    // Extract data from table rows
    const rows = resultTable.querySelectorAll('tr');
    const extractedData = [];
    
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const cells = rows[i].querySelectorAll('td, th');
      if (cells.length >= 4) {
        const courseCode = cells[2]?.textContent.trim() || '';
        const courseName = cells[3]?.textContent.trim() || '';
        const grade = cells[4]?.textContent.trim() || '';
        
        if (courseCode && grade && grade !== 'GRADE OBTAINED') {
          extractedData.push({
            courseCode,
            courseName,
            grade
          });
        }
      }
    }

    if (extractedData.length === 0) {
      alert('No course data found. Please check if results are properly displayed in the portal.');
      return;
    }

    // Clear existing rows and populate with extracted data
    const tbody = document.getElementById('gradesBody');
    tbody.innerHTML = '';
    rowCount = 0;

    extractedData.forEach((data, index) => {
      rowCount++;
      const newRow = document.createElement('tr');
      const gradePoint = gradeToPoint(data.grade);
      
      newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="table-input" value="${data.courseCode}" readonly></td>
        <td><input type="text" class="table-input" value="${data.courseName}" readonly></td>
        <td><input type="number" class="table-input credit-input" placeholder="Enter credits" min="0" step="0.5"></td>
        <td>
          <select class="table-input grade-select" disabled>
            <option value="">Select</option>
            <option value="10" ${gradePoint === '10' ? 'selected' : ''}>O</option>
            <option value="9" ${gradePoint === '9' ? 'selected' : ''}>A+</option>
            <option value="8" ${gradePoint === '8' ? 'selected' : ''}>A</option>
            <option value="7" ${gradePoint === '7' ? 'selected' : ''}>B+</option>
            <option value="6" ${gradePoint === '6' ? 'selected' : ''}>B</option>
            <option value="5" ${gradePoint === '5' ? 'selected' : ''}>C</option>
            <option value="0" ${gradePoint === '0' ? 'selected' : ''}>F</option>
          </select>
        </td>
        <td class="grade-point">${gradePoint || '-'}</td>
        <td><button type="button" class="remove-btn" onclick="removeRow(this)">×</button></td>
      `;
      
      tbody.appendChild(newRow);
    });

    alert(`Successfully imported ${extractedData.length} courses!\n\nNow please enter the CREDITS for each course and click "Calculate CGPA".`);
    
    // Scroll to calculator
    document.querySelector('.cgpa-calculator').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });

  } catch (error) {
    console.error('Import error:', error);
    alert('Error importing data. Please enter course details manually.\n\nMake sure:\n1. Your results are displayed in the portal\n2. The portal has loaded completely');
  }
}

// Handle screenshot upload and OCR
async function handleScreenshot(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusDiv = document.getElementById('uploadStatus');
  statusDiv.className = 'upload-status processing';
  statusDiv.textContent = '🔄 Processing screenshot... This may take a moment.';

  try {
    // Create image preview
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async function(e) {
      img.src = e.target.result;
      
      img.onload = async function() {
        // Perform OCR using Tesseract.js
        try {
          const { data: { text } } = await Tesseract.recognize(
            img,
            'eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  statusDiv.textContent = `🔄 Extracting text... ${Math.round(m.progress * 100)}%`;
                }
              }
            }
          );

          // Parse extracted text
          const courses = parseResultText(text);
          
          if (courses.length === 0) {
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ No course data found in screenshot. Please ensure the image shows the result table clearly and try again.';
            return;
          }

          // Populate table with extracted data
          populateTable(courses);
          
          toast.success(`Successfully extracted ${courses.length} courses!`, {
            title: 'OCR Complete',
            duration: 5000
          });
          
          // Scroll to table
          setTimeout(() => {
            document.querySelector('.table-container').scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
          }, 500);

        } catch (ocrError) {
          console.error('OCR error:', ocrError);
          statusDiv.className = 'upload-status error';
          statusDiv.textContent = '❌ Failed to extract text from image. Please try a clearer screenshot or enter data manually.';
        }
      };
    };

    reader.readAsDataURL(file);

  } catch (error) {
    console.error('Screenshot processing error:', error);
    statusDiv.className = 'upload-status error';
    statusDiv.textContent = '❌ Error processing screenshot. Please try again or enter data manually.';
  }
}

// Parse extracted OCR text to find course information
function parseResultText(text) {
  const courses = [];
  const lines = text.split('\n');
  
  // Clean and normalize text
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  // Multiple patterns to catch different OCR formats
  const patterns = [
    // Pattern 1: Full row with S.NO, semester, code, name, grade, result
    /(\d+)\s+(\d+)\s+([0-9]{2}[A-Z]{2,4}[0-9]{2})\s+(.+?)\s+([OABCDF][+]?)\s+[PF]/gi,
    
    // Pattern 2: Just course code, name, and grade
    /([0-9]{2}[A-Z]{2,4}[0-9]{2})\s+(.+?)\s+([OABCDF][+]?)\s+[PF]/gi,
    
    // Pattern 3: More flexible - find course codes and look for nearby grades
    /([0-9]{2}[A-Z]{2,4}[0-9]{2})\s+([A-Za-z][^0-9A-Z]*?[A-Za-z])\s+([OABCDF][+]?)/gi
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    let match;
    const tempCourses = [];
    
    while ((match = pattern.exec(normalizedText)) !== null) {
      let courseCode, courseName, grade;
      
      if (match.length === 6) {
        // Full pattern match
        [, , , courseCode, courseName, grade] = match;
      } else if (match.length === 4) {
        // Shorter pattern match
        [, courseCode, courseName, grade] = match;
      }
      
      if (courseCode && grade) {
        // Clean course name - remove extra spaces and unwanted characters
        courseName = (courseName || '').trim().replace(/\s+/g, ' ');
        
        // Avoid duplicates
        const isDuplicate = tempCourses.some(c => c.courseCode === courseCode.trim());
        if (!isDuplicate) {
          tempCourses.push({
            courseCode: courseCode.trim(),
            courseName: courseName,
            grade: grade.trim().toUpperCase()
          });
        }
      }
    }
    
    if (tempCourses.length > courses.length) {
      courses.length = 0;
      courses.push(...tempCourses);
    }
  }
  
  // Fallback: Line-by-line parsing for missed courses
  for (let line of lines) {
    line = line.trim();
    if (line.length < 5) continue;
    
    // Look for course code pattern
    const codeMatch = line.match(/([0-9]{2}[A-Z]{2,4}[0-9]{2})/);
    if (!codeMatch) continue;
    
    const courseCode = codeMatch[1];
    
    // Check if already found
    if (courses.some(c => c.courseCode === courseCode)) continue;
    
    // Split line into parts
    const parts = line.split(/\s+/);
    const codeIndex = parts.findIndex(p => p === courseCode);
    
    if (codeIndex >= 0) {
      // Find grade after course code
      let gradeIndex = -1;
      for (let i = codeIndex + 1; i < parts.length; i++) {
        if (/^[OABCDF][+]?$/i.test(parts[i])) {
          gradeIndex = i;
          break;
        }
      }
      
      if (gradeIndex > codeIndex) {
        const courseName = parts.slice(codeIndex + 1, gradeIndex).join(' ').trim();
        const grade = parts[gradeIndex];
        
        if (courseName.length > 0) {
          courses.push({
            courseCode: courseCode.trim(),
            courseName: courseName,
            grade: grade.trim().toUpperCase()
          });
        }
      }
    }
  }
  
  // Remove any duplicates and sort by course code
  const uniqueCourses = Array.from(
    new Map(courses.map(c => [c.courseCode, c])).values()
  );
  
  return uniqueCourses;
}

// Capture screen using browser Screen Capture API
async function captureScreen() {
  const statusDiv = document.getElementById('uploadStatus');
  
  // Check if API is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    statusDiv.className = 'upload-status error';
    statusDiv.innerHTML = '❌ Screen capture not supported in your browser.<br>Please use "Upload Result Screenshot" option below.';
    return;
  }

  statusDiv.className = 'upload-status processing';
  statusDiv.textContent = '📸 Select the window/tab to capture...';

  try {
    // Request screen capture with high resolution
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'screen',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    statusDiv.textContent = '📸 Processing captured screen...';

    // Create video element to capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    
    // Wait for video to load
    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    // Small delay to ensure video is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create canvas and capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Stop the stream
    stream.getTracks().forEach(track => track.stop());

    statusDiv.textContent = '🔄 Extracting text from capture...';

    // Convert canvas to blob and process with OCR
    canvas.toBlob(async function(blob) {
      await processImageBlob(blob, statusDiv);
    }, 'image/png');

  } catch (error) {
    console.error('Screen capture error:', error);
    
    if (error.name === 'NotAllowedError') {
      statusDiv.className = 'upload-status error';
      statusDiv.innerHTML = '❌ Screen capture permission denied.<br>Please use "Upload Result Screenshot" option below.';
    } else if (error.name === 'NotSupportedError') {
      statusDiv.className = 'upload-status error';
      statusDiv.innerHTML = '❌ Screen capture not supported.<br>Please use "Upload Result Screenshot" option below.';
    } else {
      statusDiv.className = 'upload-status error';
      statusDiv.innerHTML = '❌ Screen capture failed.<br>Please use "Upload Result Screenshot" option below.';
    }
  }
}

// Process image blob with OCR
async function processImageBlob(blob, statusDiv) {
  try {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = async function() {
      URL.revokeObjectURL(url);
      
      statusDiv.textContent = '🔄 Extracting text from screenshot...';
      
      const { data: { text } } = await Tesseract.recognize(
        img,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              statusDiv.textContent = `🔄 Extracting text... ${Math.round(m.progress * 100)}%`;
            }
          }
        }
      );

      const courses = parseResultText(text);
      
      if (courses.length === 0) {
        statusDiv.className = 'upload-status error';
        statusDiv.textContent = '❌ No course data found. Please upload a clearer screenshot manually.';
        return;
      }

      populateTable(courses);
      
      statusDiv.className = 'upload-status success';
      statusDiv.textContent = `✅ Successfully extracted ${courses.length} courses! Now enter credits for each course.`;
      
      setTimeout(() => {
        document.querySelector('.table-container').scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    };
    
    img.src = url;
  } catch (error) {
    console.error('Processing error:', error);
    statusDiv.className = 'upload-status error';
    statusDiv.textContent = '❌ Failed to process image. Please try uploading manually.';
  }
}

// Populate table with extracted course data
function populateTable(courses) {
  const tbody = document.getElementById('gradesBody');
  tbody.innerHTML = '';
  rowCount = 0;

  courses.forEach((data, index) => {
    rowCount++;
    const newRow = document.createElement('tr');
    const gradePoint = gradeToPoint(data.grade);
    
    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td><input type="text" class="table-input" value="${data.courseCode}" readonly></td>
      <td><input type="text" class="table-input" value="${data.courseName}" readonly></td>
      <td><input type="number" class="table-input credit-input" placeholder="Enter credits" min="0" step="0.5"></td>
      <td>
        <select class="table-input grade-select" disabled>
          <option value="">Select</option>
          <option value="10" ${gradePoint === '10' ? 'selected' : ''}>O</option>
          <option value="9" ${gradePoint === '9' ? 'selected' : ''}>A+</option>
          <option value="8" ${gradePoint === '8' ? 'selected' : ''}>A</option>
          <option value="7" ${gradePoint === '7' ? 'selected' : ''}>B+</option>
          <option value="6" ${gradePoint === '6' ? 'selected' : ''}>B</option>
          <option value="5" ${gradePoint === '5' ? 'selected' : ''}>C</option>
          <option value="0" ${gradePoint === '0' ? 'selected' : ''}>F</option>
        </select>
      </td>
      <td class="grade-point">${gradePoint || '-'}</td>
      <td><button type="button" class="remove-btn" onclick="removeRow(this)">×</button></td>
    `;
    
    tbody.appendChild(newRow);
  });
}

// Print results with CGPA
function printResults() {
  const cgpa = document.getElementById('cgpaValue').textContent;
  const container = document.querySelector('.cgpa-calculator');
  
  if (cgpa === '0.00') {
    showError('Please calculate CGPA first before printing.', container);
    return;
  }
  
  const rows = document.querySelectorAll('#gradesBody tr');
  if (rows.length === 0) {
    showError('No courses to print. Please add courses first.', container);
    return;
  }
  
  // Add print-specific content
  const printHeader = document.createElement('div');
  printHeader.className = 'print-header';
  printHeader.style.display = 'none';
  printHeader.innerHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="margin: 0;">KSRCE - Student Results</h1>
      <p style="margin: 0.5rem 0;">Academic Performance Report</p>
      <p style="margin: 0; font-size: 0.9rem;">Printed on: ${new Date().toLocaleDateString()}</p>
    </div>
  `;
  
  document.querySelector('.cgpa-calculator').prepend(printHeader);
  
  // Show print header only during print
  const style = document.createElement('style');
  style.textContent = '@media print { .print-header { display: block !important; } }';
  document.head.appendChild(style);
  
  // Trigger print
  window.print();
  
  // Clean up
  setTimeout(() => {
    printHeader.remove();
    style.remove();
  }, 1000);
}

// Reset all data
function resetAllData() {
  if (confirm('Are you sure you want to reset all data? This will clear all courses and results.')) {
    // Clear table
    const tbody = document.getElementById('gradesBody');
    tbody.innerHTML = `
      <tr>
        <td>1</td>
        <td><input type="text" class="table-input" placeholder="24CST29"></td>
        <td><input type="text" class="table-input" placeholder="Python Programming"></td>
        <td><input type="number" class="table-input credit-input" placeholder="3" min="0" step="0.5"></td>
        <td>
          <select class="table-input grade-select">
            <option value="">Select</option>
            <option value="10">O</option>
            <option value="9">A+</option>
            <option value="8">A</option>
            <option value="7">B+</option>
            <option value="6">B</option>
            <option value="5">C</option>
            <option value="0">F</option>
          </select>
        </td>
        <td class="grade-point">-</td>
        <td><button type="button" class="remove-btn" onclick="removeRow(this)">×</button></td>
      </tr>
    `;
    rowCount = 1;
    
    // Reset results
    document.getElementById('totalCredits').textContent = '0';
    document.getElementById('cgpaValue').textContent = '0.00';
    
    // Clear status
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.className = 'upload-status';
    statusDiv.style.display = 'none';
    
    // Clear file input
    document.getElementById('screenshotInput').value = '';
    
    toast.info('All data has been reset', {
      title: 'Reset Complete'
    });
  }
}

// Print portal result - automatic capture and print
async function printPortal() {
  const iframe = document.getElementById('resultsFrame');
  
  // Check if results are loaded
  if (!iframe.src && iframe.getAttribute('src') !== '') {
    alert('Please load your results first by entering your Register Number above.');
    return;
  }
  
  const statusDiv = document.getElementById('uploadStatus');
  statusDiv.className = 'upload-status processing';
  statusDiv.textContent = 'Capturing results for printing...';
  
  try {
    // Use screen capture API to get the iframe content
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false,
      preferCurrentTab: true
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    // Wait for video to be ready
    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.onloadedmetadata = null;
        resolve();
      };
    });
    
    // Create canvas and capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Stop the stream
    stream.getTracks().forEach(track => track.stop());
    
    // Convert to blob and create printable window
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      
      // Create a new window with the image for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Results</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            @media print {
              body {
                padding: 0;
              }
              img {
                max-width: 100%;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${url}" alt="Results" onload="window.print()">
        </body>
        </html>
      `);
      printWindow.document.close();
      
      statusDiv.className = 'upload-status success';
      statusDiv.textContent = 'Results captured! Print dialog opened.';
      
      setTimeout(() => {
        statusDiv.className = 'upload-status';
        statusDiv.textContent = '';
      }, 3000);
    }, 'image/png');
    
  } catch (error) {
    console.error('Print capture error:', error);
    statusDiv.className = 'upload-status error';
    
    if (error.name === 'NotAllowedError') {
      statusDiv.textContent = 'Screen capture was cancelled. Please try again and select the browser window/tab.';
    } else if (error.name === 'NotFoundError') {
      statusDiv.textContent = 'Screen capture not available. Please use the "Capture Screen" button instead.';
    } else {
      statusDiv.textContent = 'Unable to capture for printing. Please use the "Capture Screen" button instead.';
    }
    
    setTimeout(() => {
      statusDiv.className = 'upload-status';
      statusDiv.textContent = '';
    }, 5000);
  }
}
