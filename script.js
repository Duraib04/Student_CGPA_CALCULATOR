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
