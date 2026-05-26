// Helper: get image dimensions
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// 1D k-means clustering for array of numbers
function kMeans1D(data, k, maxIter = 100) {
  const n = data.length;
  if (k <= 0 || n === 0) return { labels: [], counts: [] };

  // initialize centroids randomly
  const centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * n);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push(data[idx]);
    }
  }

  let clusters = new Array(n).fill(-1);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    // assign to nearest centroid
    for (let i = 0; i < n; i++) {
      const d = data[i];
      let best = 0,
          bestDist = Math.abs(d - centroids[0]);
      for (let j = 1; j < k; j++) {
        const dist = Math.abs(d - centroids[j]);
        if (dist < bestDist) {
          bestDist = dist;
          best = j;
        }
      }
      if (clusters[i] !== best) {
        clusters[i] = best;
        changed = true;
      }
    }
    if (!changed) break;

    // recompute centroids
    const sums = new Array(k).fill(0);
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = clusters[i];
      sums[c] += data[i];
      counts[c]++;
    }
    for (let j = 0; j < k; j++) {
      centroids[j] = counts[j]
        ? sums[j] / counts[j]
        : data[Math.floor(Math.random() * n)];
    }
  }

  // final counts
  const counts = new Array(k).fill(0);
  clusters.forEach(c => counts[c]++);

  // sort by centroid value
  const order = centroids
    .map((c, i) => [c, i])
    .sort((a, b) => a[0] - b[0])
    .map(pair => pair[1]);
  const sortedCentroids = order.map(i => centroids[i]);
  const sortedCounts    = order.map(i => counts[i]);
  const labels          = sortedCentroids.map(c => `${Math.round(c)}`);

  return { labels, counts: sortedCounts };
}

// ── show selected folder path ──
const folderInput       = document.getElementById('folderInput');
const selectedFolderDiv = document.getElementById('selected-folder');

folderInput.addEventListener('change', () => {
  if (!folderInput.files.length) {
    selectedFolderDiv.textContent = '';
    return;
  }

  const firstFile = folderInput.files[0];
  // In Electron, `file.path` is the real absolute path.
  // In a pure browser, fall back to the full webkitRelativePath.
  let fullPath = firstFile.path || firstFile.webkitRelativePath;
  // If we're using webkitRelativePath, strip off the filename
  if (!firstFile.path) {
    fullPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
  }

  selectedFolderDiv.textContent = fullPath;
});

// When "Analyze" button is clicked
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const input      = document.getElementById('folderInput');
  const outputText = document.getElementById('outputText');
  const files      = Array.from(input.files);
  outputText.value = '';

  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
  const imageFiles = files.filter(file =>
    allowedExt.includes(
      file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    )
  );

  let images = [];
  for (const file of imageFiles) {
    try {
      const { width, height } = await getImageDimensions(file);
      images.push({
        filename: file.name,
        size: file.size,
        resolution: { width, height }
      });
      outputText.value +=
        `Name: ${file.name}, Size: ${file.size} bytes, ` +
        `Resolution: ${width}x${height}\n`;
    } catch (e) {
      outputText.value += `Error processing ${file.name}: ${e}\n`;
    }
  }

  // redraw charts
  updateBarChart(images);
  updatePieChart(images);
  document.getElementById('chartContainer').style.display = 'flex';

  // ── display total count below textarea ──
  document.getElementById('total-count').textContent =
    `Total number of images: ${images.length}`;
});

// -- Bar Chart (uses k-means to auto-cluster sizes) --
function updateBarChart(images) {
  const sizes = images.map(img => img.size);
  if (sizes.length === 0) return;

  const k = Math.max(1, Math.round(Math.sqrt(sizes.length)));
  const { labels, counts } = kMeans1D(sizes, k);

  const ctx = document
    .getElementById('barChartCanvas')
    .getContext('2d');

  if (window.barChartInstance) window.barChartInstance.destroy();
  window.barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Image Sizes (bytes)',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor:     'rgba(54, 162, 235, 1)',
        borderWidth:     1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ── fixed 10-color palette for pie chart ──
const PIE_COLORS = [
  '#3366CC','#DC3912','#FF9900','#109618','#990099',
  '#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E'
];

// -- Pie Chart (resolution breakdown) --
function updatePieChart(images) {
  const resolutionCounts = {};
  images.forEach(img => {
    const key = `${img.resolution.width}x${img.resolution.height}`;
    resolutionCounts[key] = (resolutionCounts[key] || 0) + 1;
  });

  let groups = Object.entries(resolutionCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  if (groups.length > 9) {
    const top    = groups.slice(0, 9);
    const others = groups.slice(9).reduce((sum, g) => sum + g.count, 0);
    top.push({ label: 'Others', count: others });
    groups = top;
  }

  const labels = groups.map(g => g.label);
  const data   = groups.map(g => g.count);
  const backgroundColors = labels.map((_, i) =>
    PIE_COLORS[i % PIE_COLORS.length]
  );
  const borderColors = backgroundColors;

  const ctx = document
    .getElementById('pieChartCanvas')
    .getContext('2d');

  if (window.pieChartInstance) window.pieChartInstance.destroy();
  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor:     borderColors,
        borderWidth:     1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { padding: 20 } }
      }
    }
  });
}
