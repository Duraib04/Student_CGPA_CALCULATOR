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
