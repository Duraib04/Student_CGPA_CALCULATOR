// Handle form submission
document.getElementById('resultForm').addEventListener('submit', function(e) {
  const regno = document.getElementById('regno').value.trim();
  
  if (!regno) {
    e.preventDefault();
    alert('Please enter your Register Number');
    return;
  }
  
  // Show the iframe container when form is submitted
  document.querySelector('.portal-container').classList.add('active');
  
  // Scroll to results after a brief delay
  setTimeout(() => {
    document.querySelector('.portal-container').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, 300);
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
  `;
  
  tbody.appendChild(newRow);
  updateRowNumbers();
}

function removeRow(btn) {
  if (document.getElementById('gradesBody').children.length > 1) {
    btn.closest('tr').remove();
    updateRowNumbers();
  } else {
    alert('At least one course is required');
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
    alert('Please fill in all credits and grades for the courses you want to include');
    return;
  }

  if (totalCredits === 0) {
    alert('Please enter at least one course with credits and grade');
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
          
          statusDiv.className = 'upload-status success';
          statusDiv.textContent = `✅ Successfully extracted ${courses.length} courses! Now enter credits for each course.`;
          
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
  
  console.log('OCR Text:', text); // Debug log
  
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
  
  console.log('Extracted courses:', uniqueCourses); // Debug log
  
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
