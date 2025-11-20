# White Home Page

A minimal white home page for quick local testing.

Open the page in PowerShell:

```powershell
# from this project folder
Start-Process .\index.html
# or use the built-in PowerShell alias
ii .\index.html
```

Files:
- `index.html` — main page
- `styles.css` — white background and simple layout

Next steps: integrate into your project or replace the placeholder content with your app UI.
 
CGPA calculator
---------------

This project includes a simple CGPA calculator for engineering students. Usage:

1. Open `index.html` in a browser (see commands above).
2. Click "Add Semester" to add semesters.
3. For each semester, click "Add Subject" to add subject rows.
4. In each subject row, enter subject code (optional), credits, and grade point (numeric, e.g. 10 or 7.5).
5. Click "Calculate CGPA" to compute SGPA for each semester and the cumulative CGPA.

Notes:
- The calculator uses weighted average of grade points by credits.
- Reset will clear all semesters.

If you want integration help or additional features (letter-grade mapping, export CSV), tell me which features to add.