// ── SHA-512 hasher ──
async function computeFileHash(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-512', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2,'0'))
    .join('');
}

// utility to download text as a file
function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// State holders
let selectedFiles = { left: [], right: [] };
let resultsHash   = { left: [], right: [] };

// ── SETUP PANEL CONTROLS ──
;['left','right'].forEach(side => {
  // select buttons
  document.getElementById(`btn-select-files-${side}`)
    .addEventListener('click', () =>
      document.getElementById(`fileInput-${side}`).click()
    );
  document.getElementById(`btn-select-folder-${side}`)
    .addEventListener('click', () =>
      document.getElementById(`folderInput-${side}`).click()
    );

  // on file/folder change
  ['fileInput','folderInput'].forEach(inputType => {
    document.getElementById(`${inputType}-${side}`)
      .addEventListener('change', e => {
        selectedFiles[side] = selectedFiles[side]
          .concat(Array.from(e.target.files));
        updateFileList(side);
      });
  });

  // calculate hashes
  document.getElementById(`btn-calculate-${side}`)
    .addEventListener('click', async () => {
      if (!selectedFiles[side].length) {
        return alert("No files or folders selected!");
      }
      resultsHash[side] = [];
      const formatted = [];
      for (const file of selectedFiles[side]) {
        const raw = await computeFileHash(file);
        resultsHash[side].push(raw);
        formatted.push(
          `File: ${file.webkitRelativePath||file.name}\n` +
          `Hash: ${raw}`
      );

      }
      document.getElementById(`result-text-${side}`)
        .value = formatted.join('\n\n');
    });

  // save results
  document.getElementById(`btn-save-${side}`)
    .addEventListener('click', () => {
      const txt = document.getElementById(`result-text-${side}`).value;
      if (!txt) return alert("No results to save!");
      downloadTextFile(txt, `hash_results_${side}.txt`);
    });
});

// ── UPDATE FILE LIST ──
function updateFileList(side) {
  const ul = document.getElementById(`files-${side}`);
  ul.innerHTML = '';
  selectedFiles[side].forEach((file, i) => {
    const li = document.createElement('li');
    li.textContent = file.webkitRelativePath || file.name;
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.classList.add('remove-btn');
    btn.addEventListener('click', () => {
      selectedFiles[side].splice(i, 1);
      updateFileList(side);
    });
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// ── COMPARE LOGIC ──
document.getElementById('btn-compare')
  .addEventListener('click', () => {
    const leftSet  = new Set(resultsHash.left);
    const rightSet = new Set(resultsHash.right);
    // union of all hashes
    const all = Array.from(new Set([
      ...resultsHash.left,
      ...resultsHash.right
    ]));
    // find matches
    const matches = all.filter(h => leftSet.has(h) && rightSet.has(h));

    // display summary
    document.getElementById('compare-summary').textContent =
      `Left Count: ${resultsHash.left.length}, ` +
      `Right Count: ${resultsHash.right.length}, ` +
      `Matches: ${matches.length}`;

    // build CSV
    let csv = 'results1,results2,matches\n';
    all.forEach(h => {
      const inL = leftSet.has(h);
      const inR = rightSet.has(h);
      csv += `${inL?`"${h}"`:''},${inR?`"${h}"`:''},${inL&&inR}\n`;
    });
    window._comparisonCsv = csv;
    document.getElementById('btn-download-csv').style.display = 'inline-block';
  });

// ── DOWNLOAD COMPARISON CSV ──
document.getElementById('btn-download-csv')
  .addEventListener('click', () => {
    if (!window._comparisonCsv) return;
    downloadTextFile(window._comparisonCsv, 'comparison.csv');
  });
