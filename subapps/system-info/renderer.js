// Main choice page logic
document.getElementById('manualBtn').onclick = function() {
  document.getElementById('choicePage').style.display = 'none';
  document.getElementById('manualPage').style.display = '';
};

document.getElementById('dragDropBtn').onclick = function() {
  document.getElementById('choicePage').style.display = 'none';
  document.getElementById('dragDropPage').style.display = '';
};

document.getElementById('downloadAppBtn').onclick = function() {
  document.getElementById('choicePage').style.display = 'none';
  document.getElementById('downloadAppPage').style.display = '';
};

document.getElementById('backToChoiceFromAppBtn').onclick = function() {
  document.getElementById('downloadAppPage').style.display = 'none';
  document.getElementById('choicePage').style.display = '';
};

// Back button for manual input page
document.getElementById('manualBackBtn').onclick = function() {
  document.getElementById('manualPage').style.display = 'none';
  document.getElementById('choicePage').style.display = '';
};

// Back button for "Choose Input Method" page (main menu)
document.getElementById('choiceBackBtn').onclick = function() {
  // Go back to main dashboard page
  window.location.href = "../../launcher.html";
};

// File Input label logic for pretty file input (if you use option 2 from before)
document.querySelector('.custom-file-label').onclick = function() {
  document.getElementById('fileInput').click();
};
document.getElementById('fileInput').onchange = function(e) {
  const fileName = e.target.files.length ? e.target.files[0].name : '';
  const fileNameSpan = document.getElementById('fileName');
  if (fileNameSpan) fileNameSpan.innerText = fileName;
  // Your existing logic
  if (e.target.files.length > 0) {
    setScreenshotFile(e.target.files[0]);
  }
};

// MacOS Download button
document.getElementById('downloadMacBtn').onclick = function() {
  window.location.href = 'https://drive.google.com/uc?export=download&id=1-XVoeHMKmIziGVGjzA5dP1JnWGnFNJJE';
};
// Windows Download button
document.getElementById('downloadWinBtn').onclick = function() {
  window.location.href = 'https://drive.google.com/uc?export=download&id=1yDYfsx_T0w17PujqwWIlS6-0RPyeQTHF';
};

// Manual Input logic
document.getElementById('doneBtn').onclick = function() {
  const name = document.getElementById('customerName').value || "-";
  const company = document.getElementById('companyName').value || "-";
  const date = document.getElementById('testDate').value || "-";
  const os = document.getElementById('os').value || "-";
  const cpu = document.getElementById('cpu').value || "-";
  const ram = document.getElementById('ram').value || "-";
  const storage = document.getElementById('storage').value || "-";
  const gpu = document.getElementById('gpu').value || "-";

  document.getElementById('manualPage').style.display = 'none';
  document.getElementById('reviewPage').style.display = '';

  document.getElementById('reviewInfo').innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>OS:</strong> ${os}</p>
    <p><strong>CPU:</strong> ${cpu}</p>
    <p><strong>RAM:</strong> ${ram}</p>
    <p><strong>Storage:</strong> ${storage}</p>
    <p><strong>GPU:</strong> ${gpu}</p>
  `;
};

document.getElementById('downloadImageBtn').onclick = function() {
  const reviewDiv = document.getElementById('reviewInfo');
  html2canvas(reviewDiv).then(canvas => {
    let link = document.createElement('a');
    link.download = 'system_info.png';
    link.href = canvas.toDataURL();
    link.click();
  });
};

document.getElementById('sendBtn').onclick = function() {
  const reviewDiv = document.getElementById('reviewInfo');
  html2canvas(reviewDiv).then(canvas => {
    canvas.toBlob(blob => {
      const formData = new FormData();
      formData.append('image', blob, 'system_info.png');
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        alert('System info sent successfully!');
      })
      .catch(err => {
        alert('Failed to send: ' + err);
      });
    }, 'image/png');
  });
};

document.getElementById('backBtn').onclick = function() {
  document.getElementById('reviewPage').style.display = 'none';
  document.getElementById('manualPage').style.display = '';
};

// Drag & Drop logic
let uploadedScreenshot = null;

document.getElementById('backToChoiceBtn').onclick = function() {
  document.getElementById('dragDropPage').style.display = 'none';
  document.getElementById('choicePage').style.display = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('previewImg').src = '';
  document.getElementById('previewImg').style.display = 'none';
  document.getElementById('sendScreenshotBtn').disabled = true;
  uploadedScreenshot = null;
};

const dropZone = document.getElementById('dropZone');
dropZone.ondragover = function(e) {
  e.preventDefault();
  dropZone.style.background = "#d1eaff";
};
dropZone.ondragleave = function(e) {
  e.preventDefault();
  dropZone.style.background = "#eef3fa";
};
dropZone.ondrop = function(e) {
  e.preventDefault();
  dropZone.style.background = "#eef3fa";
  if (e.dataTransfer.files.length > 0) {
    setScreenshotFile(e.dataTransfer.files[0]);
  }
};

function setScreenshotFile(file) {
  if (!file.type.startsWith('image/')) {
    alert("Please upload an image file!");
    return;
  }
  uploadedScreenshot = file;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('previewImg');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('sendScreenshotBtn').disabled = false;
  };
  reader.readAsDataURL(file);
}

document.getElementById('sendScreenshotBtn').onclick = function() {
  if (!uploadedScreenshot) {
    alert("Please upload an image first!");
    return;
  }
  const formData = new FormData();
  formData.append('image', uploadedScreenshot, uploadedScreenshot.name || 'screenshot.png');
  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    alert('Screenshot sent successfully!');
    document.getElementById('fileInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('sendScreenshotBtn').disabled = true;
    uploadedScreenshot = null;
  })
  .catch(err => {
    alert('Failed to send: ' + err);
  });
};

// ESC key navigation for back actions
document.addEventListener('keydown', function(event) {
  if (event.key === "Escape" || event.key === "Esc") {
    if (document.getElementById('reviewPage').style.display !== 'none') {
      // If review page, go back to manual input
      document.getElementById('reviewPage').style.display = 'none';
      document.getElementById('manualPage').style.display = '';
    } else if (document.getElementById('manualPage').style.display !== 'none') {
      // If manual input, go back to choice page
      document.getElementById('manualPage').style.display = 'none';
      document.getElementById('choicePage').style.display = '';
    } else if (document.getElementById('dragDropPage').style.display !== 'none') {
      // If drag drop, go back to choice page
      document.getElementById('dragDropPage').style.display = 'none';
      document.getElementById('choicePage').style.display = '';
      document.getElementById('fileInput').value = '';
      document.getElementById('previewImg').src = '';
      document.getElementById('previewImg').style.display = 'none';
      document.getElementById('sendScreenshotBtn').disabled = true;
      uploadedScreenshot = null;
    } else if (document.getElementById('downloadAppPage').style.display !== 'none') {
      // If download app, go back to choice page
      document.getElementById('downloadAppPage').style.display = 'none';
      document.getElementById('choicePage').style.display = '';
    } else if (document.getElementById('choicePage').style.display !== 'none') {
      // If choice page, go back to main dashboard
      window.location.href = "../../launcher.html";
    }
  }
});
