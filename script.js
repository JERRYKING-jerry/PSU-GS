const comparisons = {
  Brandenburg: {
    label: 'Brandenburg Gate',
    views: [
      { gain: 2.65, baseline: 'assets/comparison/brang_88909760_6880126015_wildgaussians.png', ours: 'assets/comparison/brang_88909760_6880126015_ours.png', caption: 'Sharper quadriga, columns, and architectural boundaries under a muted sky.' },
      { gain: 1.79, baseline: 'assets/comparison/brang_88658044_5727130447_wildgaussians.png', ours: 'assets/comparison/brang_88658044_5727130447_ours.png', caption: 'Improved local contrast and more coherent stone appearance.' }
    ]
  },
  Sacre: {
    label: 'Sacré-Cœur',
    views: [
      { gain: 2.12, baseline: 'assets/comparison/sacre_25422767_2496685776_wildgaussians.png', ours: 'assets/comparison/sacre_25422767_2496685776_ours.png', caption: 'Cleaner relief, domes, and façade edges across strong viewpoint variation.' },
      { gain: 1.56, baseline: 'assets/comparison/sacre_10660637_2917767044_wildgaussians.png', ours: 'assets/comparison/sacre_10660637_2917767044_ours.png', caption: 'More stable masonry detail and reduced appearance spill across surfaces.' }
    ]
  },
  Trevi: {
    label: 'Trevi Fountain',
    views: [
      { gain: 2.53, baseline: 'assets/comparison/trevi_01693870_2401033603_wildgaussians.png', ours: 'assets/comparison/trevi_01693870_2401033603_ours.png', caption: 'Night-time stone, sculpture, and water retain finer local structure.' },
      { gain: 0.96, baseline: 'assets/comparison/trevi_05246911_9305685489_wildgaussians.png', ours: 'assets/comparison/trevi_05246911_9305685489_ours.png', caption: 'More coherent highlights and relief in a difficult illumination regime.' }
    ]
  }
};

const edits = {
  Brandenburg: {
    label: 'Brandenburg Gate', index: '01', folder: 'Brandenburg', regions: 4,
    width: 1025, height: 685,
    base: 'assets/material/Brandenburg/uid_62/original.png',
    regionMap: 'assets/regions/Brandenburg/region-map.png',
    units: [
      { uid: 62, name: 'Inner passage column', color: [255, 176, 0], reduced: .5, enhanced: 1.5 },
      { uid: 19, name: 'Quadriga pedestal relief', color: [0, 180, 255], reduced: .5, enhanced: 1.5 },
      { uid: 76, name: 'Quadriga horse sculpture', color: [255, 70, 110], reduced: .6, enhanced: 1.4 },
      { uid: 12, name: 'Central colonnade column', color: [40, 210, 100], reduced: .5, enhanced: 1.5 }
    ]
  },
  Sacre: {
    label: 'Sacré-Cœur', index: '02', folder: 'Sacre', regions: 4,
    width: 1047, height: 777,
    base: 'assets/material/Sacre/uid_205/original.png',
    regionMap: 'assets/regions/Sacre/region-map.png',
    units: [
      { uid: 205, name: 'Right equestrian sculpture', color: [255, 176, 0], reduced: .5, enhanced: 1.5 },
      { uid: 109, name: 'Right rooftop balustrade', color: [0, 180, 255], reduced: .7, enhanced: 1.3 },
      { uid: 171, name: 'Right arched window', color: [255, 70, 110], reduced: .5, enhanced: 1.5 },
      { uid: 58, name: 'Sloped roof cornice', color: [40, 210, 100], reduced: .5, enhanced: 1.5 }
    ]
  },
  Trevi: {
    label: 'Trevi Fountain', index: '03', folder: 'Trevi', regions: 4,
    width: 1055, height: 687,
    base: 'assets/material/Trevi/uid_159/original.png',
    regionMap: 'assets/regions/Trevi/region-map.png',
    units: [
      { uid: 159, name: 'Central-right Corinthian column', color: [255, 176, 0], reduced: .6, enhanced: 1.4 },
      { uid: 35, name: 'Upper-right façade column', color: [0, 180, 255], reduced: .6, enhanced: 1.4 },
      { uid: 101, name: 'Far-right pilaster', color: [255, 70, 110], reduced: .6, enhanced: 1.4 },
      { uid: 19, name: 'Right niche statue', color: [40, 210, 100], reduced: .5, enhanced: 1.5 }
    ]
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let compareScene = 'Brandenburg';
let compareView = 0;

function buildComparison() {
  const rail = $('#compare-scenes');
  Object.entries(comparisons).forEach(([key, scene], i) => {
    const button = document.createElement('button');
    button.className = 'scene-tab' + (i === 0 ? ' is-active' : '');
    button.dataset.scene = key;
    button.innerHTML = `<span>0${i + 1}</span><strong>${scene.label}</strong><i></i>`;
    button.addEventListener('click', () => {
      compareScene = key; compareView = 0;
      $$('.scene-tab', rail).forEach(x => x.classList.toggle('is-active', x === button));
      renderComparison();
    });
    rail.appendChild(button);
  });
  $('#compare-range').addEventListener('input', updateReveal);
  renderComparison();
}

function renderComparison() {
  const scene = comparisons[compareScene];
  const views = $('#compare-views');
  views.innerHTML = '';
  scene.views.forEach((view, i) => {
    const button = document.createElement('button');
    button.className = i === compareView ? 'is-active' : '';
    button.textContent = `View ${String(i + 1).padStart(2, '0')}`;
    button.addEventListener('click', () => { compareView = i; renderComparison(); });
    views.appendChild(button);
  });
  const view = scene.views[compareView];
  $('#compare-base').src = view.baseline;
  $('#compare-ours').src = view.ours;
  $('#compare-gain').textContent = `+${view.gain.toFixed(2)}`;
  $('#compare-caption').textContent = view.caption;
  $('#compare-range').value = 50;
  updateReveal();
}

function updateReveal() {
  const value = Number($('#compare-range').value);
  $('#compare-reveal').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  $('#compare-divider').style.left = `${value}%`;
}

let editScene = 'Brandenburg';
let editMode = 'illumination';
let selectedRegion = 0;
let regionLocked = false;
let materialLoadToken = 0;
let materialRenderQueued = false;
let materialState = null;
const materialImageCache = new Map();

function buildEditor() {
  const tabs = $('#editor-scenes');
  Object.entries(edits).forEach(([key, scene], i) => {
    const button = document.createElement('button');
    button.className = i === 0 ? 'is-active' : '';
    button.innerHTML = `<strong>${scene.label}</strong><span>${scene.index} · ${scene.regions} regions</span>`;
    button.addEventListener('click', () => {
      editScene = key; selectedRegion = 0; regionLocked = false;
      $$('button', tabs).forEach(x => x.classList.toggle('is-active', x === button));
      $('#material-range').value = 0;
      loadMaterialScene();
      renderEdit();
    });
    tabs.appendChild(button);
  });

  $$('.mode-switch button').forEach(button => button.addEventListener('click', () => {
    editMode = button.dataset.mode;
    $$('.mode-switch button').forEach(x => x.classList.toggle('is-active', x === button));
    $('#illumination-controls').classList.toggle('is-active', editMode === 'illumination');
    $('#material-controls').classList.toggle('is-active', editMode === 'material');
    renderEdit();
  }));
  $('#light-range').addEventListener('input', renderEdit);
  $('#material-range').addEventListener('input', () => { updateMaterialReadout(); queueMaterialRender(); });
  $('#selection-toggle').addEventListener('change', () => {
    updateSelectionHint();
    queueMaterialRender();
  });
  $('#unlock-region').addEventListener('click', unlockRegion);
  $('#material-canvas').addEventListener('click', selectRegionFromCanvas);
  loadMaterialScene();
  renderEdit();
}

function lightPath(scene, value) {
  return `assets/illumination/${scene.folder}/t_${value.toFixed(2)}.png`;
}

function renderEdit() {
  const scene = edits[editScene];
  const lower = $('#edit-lower');
  const upper = $('#edit-upper');
  const canvas = $('#material-canvas');
  const isLight = editMode === 'illumination';
  lower.style.display = 'block';
  upper.style.display = isLight ? 'block' : 'none';
  canvas.style.display = isLight ? 'none' : 'block';
  $('#locked-region-label').hidden = isLight || !regionLocked;

  if (isLight) {
    const value = Number($('#light-range').value);
    const anchors = [0, .25, .5, .75, 1];
    let start = anchors[Math.min(Math.floor(value * 4), 3)];
    let end = anchors[Math.min(Math.floor(value * 4) + 1, 4)];
    if (value === 1) { start = 1; end = 1; }
    const blend = start === end ? 0 : (value - start) / (end - start);
    lower.src = lightPath(scene, start);
    upper.src = lightPath(scene, end);
    upper.style.opacity = blend;
    $('#light-output').textContent = value.toFixed(2);
    $('#stage-mode').textContent = 'Illumination';
    $('#stage-value').textContent = `t = ${value.toFixed(2)}`;
    $('#stage-badge-text').textContent = 'Frozen-model render';
    $('#render-note').textContent = 'Full-frame frozen-model renders; fine substeps interpolate between the nearest anchors.';
  } else {
    if (lower.getAttribute('src') !== scene.base) lower.src = scene.base;
    updateSelectionHint();
    updateMaterialReadout();
    $('#stage-mode').textContent = 'Material region';
    $('#stage-badge-text').textContent = regionLocked ? 'Region locked' : 'Selection preview';
    $('#render-note').textContent = 'Audited PSU selection masks and frozen-model Reduced / Original / Enhanced renders. Intermediate t values blend the neighboring real renders; no color filter is applied.';
    queueMaterialRender();
  }
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function loadMaterialScene() {
  const token = ++materialLoadToken;
  const scene = edits[editScene];
  const embedded = window.PSUGSEditorAssets && window.PSUGSEditorAssets[editScene];
  preloadMaterialRenders(scene);
  $('#edit-lower').src = scene.base;
  $('#edit-upper').style.display = 'none';
  selectedRegion = 0;
  regionLocked = false;
  $('#material-range').value = 0;
  const canvas = $('#material-canvas');
  canvas.width = scene.width;
  canvas.height = scene.height;

  materialState = null;
  $('#region-count').textContent = 'Loading masks…';
  $('#selected-name').textContent = 'Loading audited PSU masks…';
  $('#selected-uid').textContent = 'Only regions with real model renders are selectable';
  setMaterialSelectionState(false);

  try {
    const map = await loadImage(embedded ? embedded.map : scene.regionMap);
    if (token !== materialLoadToken) return;
    const width = scene.width;
    const height = scene.height;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width; mapCanvas.height = height;
    const mapContext = mapCanvas.getContext('2d', { willReadFrequently: true });
    mapContext.drawImage(map, 0, 0, width, height);
    const rgba = mapContext.getImageData(0, 0, width, height).data;
    const labels = new Uint8Array(width * height);
    let count = 0;
    const sums = [];
    for (let pixel = 0; pixel < labels.length; pixel++) {
      const id = rgba[pixel * 4];
      labels[pixel] = id;
      count = Math.max(count, id);
      if (!sums[id]) sums[id] = [0, 0, 0];
      sums[id][0] += pixel % width;
      sums[id][1] += Math.floor(pixel / width);
      sums[id][2] += 1;
    }
    const means = sums.map(sum => sum ? [sum[0] / sum[2], sum[1] / sum[2]] : [0, 0]);
    const representative = means.map(() => [0, 0]);
    const bestDistance = means.map(() => Infinity);
    for (let pixel = 0; pixel < labels.length; pixel++) {
      const id = labels[pixel];
      if (!id) continue;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      const distance = (x - means[id][0]) ** 2 + (y - means[id][1]) ** 2;
      if (distance < bestDistance[id]) {
        bestDistance[id] = distance;
        representative[id] = [x / width, y / height];
      }
    }
    const centers = representative;
    materialState = { width, height, labels, count, centers };
    buildRegionGrid(count);
    showReadyToSelect();
    queueMaterialRender();
  } catch (error) {
    if (token !== materialLoadToken) return;
    console.error(error);
    materialState = null;
    $('#region-count').textContent = 'Masks unavailable';
    $('#selected-name').textContent = 'Verified PSU masks could not be loaded';
    $('#selected-uid').textContent = 'No synthetic fallback is used';
  }
}

function preloadMaterialRenders(scene) {
  for (const unit of scene.units) {
    for (const state of ['reduced', 'original', 'enhanced']) {
      const source = `assets/material/${scene.folder}/uid_${unit.uid}/${state}.png`;
      if (materialImageCache.has(source)) continue;
      const image = new Image();
      image.src = source;
      materialImageCache.set(source, image);
    }
  }
}

function showReadyToSelect() {
  selectedRegion = 0;
  regionLocked = false;
  $('#selection-toggle').checked = true;
  $('#locked-region-label').hidden = true;
  $('#selected-name').textContent = 'Selection ready · no region locked';
  $('#selected-uid').textContent = 'Click one of the colored masks in the image';
  $('#region-count').textContent = `${materialState.count} verified`;
  $('#material-controls').classList.add('is-ready');
  setMaterialSelectionState(false);
  updateSelectionHint();
}

function setMaterialSelectionState(enabled) {
  $('#material-range').disabled = !enabled;
  $('#unlock-region').disabled = !enabled;
  $('#material-controls').classList.toggle('is-locked', enabled);
  $('#material-canvas').classList.toggle('is-locked', enabled);
}

function updateSelectionHint() {
  const tip = $('#click-tip');
  if (editMode !== 'material' || regionLocked) {
    tip.style.display = 'none';
    return;
  }
  const visible = $('#selection-toggle').checked;
  tip.style.display = 'block';
  tip.innerHTML = visible
    ? '<span>＋</span> Click a colored mask to lock'
    : '<span>＋</span> Turn Selection on to choose a region';
}

function buildRegionGrid(count) {
  const grid = $('#region-grid');
  grid.innerHTML = '';
  for (let id = 1; id <= count; id++) {
    const button = document.createElement('button');
    button.textContent = String(id).padStart(2, '0');
    button.className = id === selectedRegion ? 'is-active' : '';
    button.title = `Select surface region ${id}`;
    button.addEventListener('click', () => selectRegion(id));
    grid.appendChild(button);
  }
  $('#region-count').textContent = `${count} verified`;
}

function selectRegion(id) {
  if (regionLocked || !id) return;
  selectedRegion = id;
  regionLocked = true;
  $('#material-range').value = 0;
  setMaterialSelectionState(true);
  $$('#region-grid button').forEach((button, index) => button.classList.toggle('is-active', index + 1 === id));
  updateSelectedRegion();
  updateMaterialReadout();
  updateSelectionHint();
  $('#stage-badge-text').textContent = 'Region locked';
  queueMaterialRender();
}

function unlockRegion() {
  regionLocked = false;
  selectedRegion = 0;
  $('#material-range').value = 0;
  $('#selection-toggle').checked = true;
  setMaterialSelectionState(false);
  $('#selected-name').textContent = 'Selection ready · no region locked';
  $('#selected-uid').textContent = 'Click one of the colored masks in the image';
  $('#locked-region-label').hidden = true;
  $('#stage-badge-text').textContent = 'Selection preview';
  updateMaterialReadout();
  updateSelectionHint();
  queueMaterialRender();
}

function selectRegionFromCanvas(event) {
  if (!materialState || regionLocked || !$('#selection-toggle').checked) return;
  const canvas = $('#material-canvas');
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / materialState.width, rect.height / materialState.height);
  const shownWidth = materialState.width * scale;
  const shownHeight = materialState.height * scale;
  const offsetX = (rect.width - shownWidth) / 2;
  const offsetY = (rect.height - shownHeight) / 2;
  const x = Math.floor((event.clientX - rect.left - offsetX) / scale);
  const y = Math.floor((event.clientY - rect.top - offsetY) / scale);
  if (x < 0 || y < 0 || x >= materialState.width || y >= materialState.height) return;
  const id = materialState.labels[y * materialState.width + x];
  if (id > 0) selectRegion(id);
}

function regionDescription() {
  const unit = edits[editScene].units[selectedRegion - 1];
  return unit ? unit.name : 'Surface unit';
}

function updateSelectedRegion() {
  if (!selectedRegion) return;
  const unit = edits[editScene].units[selectedRegion - 1];
  const name = `${edits[editScene].label} · ${regionDescription()} · UID ${unit.uid}`;
  $('#selected-name').textContent = name;
  $('#selected-uid').textContent = 'Audited PSU mask · unlock before choosing another region';
  $('#locked-region-name').textContent = name;
  $('#locked-region-label').hidden = false;
  $('#selected-color').style.background = `rgb(${unit.color.join(',')})`;
}

function updateMaterialReadout() {
  const value = Number($('#material-range').value);
  $('#material-output').textContent = `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}`;
  $('#stage-value').textContent = `t = ${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}`;
  renderMaterialImages();
}

function materialPath(unit, state) {
  return `assets/material/${edits[editScene].folder}/uid_${unit.uid}/${state}.png`;
}

function renderMaterialImages() {
  const scene = edits[editScene];
  const lower = $('#edit-lower');
  const upper = $('#edit-upper');
  if (editMode !== 'material') return;
  if (!regionLocked || !selectedRegion) {
    lower.src = scene.base;
    upper.style.display = 'none';
    $('#material-factor').textContent = 'Original · ×1.00';
    return;
  }

  const unit = scene.units[selectedRegion - 1];
  const value = Number($('#material-range').value);
  upper.style.display = 'block';
  if (value < 0) {
    lower.src = materialPath(unit, 'reduced');
    upper.src = materialPath(unit, 'original');
    upper.style.opacity = value + 1;
  } else {
    lower.src = materialPath(unit, 'original');
    upper.src = materialPath(unit, 'enhanced');
    upper.style.opacity = value;
  }
  const factor = value < 0
    ? 1 + (-value) * (unit.reduced - 1)
    : 1 + value * (unit.enhanced - 1);
  $('#material-factor').textContent = `Model response · ×${factor.toFixed(2)}`;
}

function queueMaterialRender() {
  if (!materialState || materialRenderQueued) return;
  materialRenderQueued = true;
  requestAnimationFrame(() => {
    materialRenderQueued = false;
    drawMaterialPreview();
  });
}

function drawMaterialPreview() {
  if (!materialState) return;
  const { width, height, labels } = materialState;
  const output = new ImageData(width, height);
  const pixels = output.data;
  const showSelection = $('#selection-toggle').checked;
  const accent = [255, 96, 59];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const id = labels[pixel];
      if (!id) continue;
      const offset = pixel * 4;
      const unit = edits[editScene].units[id - 1];
      const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        labels[pixel - 1] !== id || labels[pixel + 1] !== id ||
        labels[pixel - width] !== id || labels[pixel + width] !== id;

      if (showSelection) {
        const color = unit.color;
        pixels[offset] = color[0];
        pixels[offset + 1] = color[1];
        pixels[offset + 2] = color[2];
        pixels[offset + 3] = edge ? (id === selectedRegion ? 245 : 205) : (id === selectedRegion ? 150 : 112);
      }

      if (showSelection && id === selectedRegion && edge) {
        for (let channel = 0; channel < 3; channel++) pixels[offset + channel] = accent[channel];
        pixels[offset + 3] = 245;
      }
    }
  }
  const context = $('#material-canvas').getContext('2d');
  context.putImageData(output, 0, 0);
  if (showSelection) {
    context.save();
    context.font = '700 13px ui-sans-serif, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (let id = 1; id <= materialState.count; id++) {
      const center = materialState.centers[id];
      if (!center) continue;
      const x = center[0] * width;
      const y = center[1] * height;
      const unit = edits[editScene].units[id - 1];
      const label = unit.name;
      const boxWidth = Math.min(220, Math.max(74, context.measureText(label).width + 16));
      context.fillStyle = id === selectedRegion ? 'rgba(255,96,59,.96)' : 'rgba(17,40,32,.80)';
      context.fillRect(x - boxWidth / 2, y - 10, boxWidth, 20);
      context.fillStyle = '#fff';
      context.fillText(label, x, y + .5);
    }
    context.restore();
  }
}

const galleryItems = [
  ['assets/comparison/brang_88909760_6880126015_ours.png', 'Brandenburg · PSU-GS render'],
  ['assets/comparison/brang_88909760_6880126015_wildgaussians.png', 'Brandenburg · WildGaussians'],
  ['assets/illumination/Brandenburg/t_1.00.png', 'Brandenburg · target illumination'],
  ['assets/material/Brandenburg/uid_76/selection.png', 'Brandenburg · checkpoint-edited unit'],
  ['assets/comparison/sacre_25422767_2496685776_ours.png', 'Sacré-Cœur · PSU-GS render'],
  ['assets/comparison/sacre_25422767_2496685776_wildgaussians.png', 'Sacré-Cœur · WildGaussians'],
  ['assets/illumination/Sacre/t_1.00.png', 'Sacré-Cœur · target illumination'],
  ['assets/material/Sacre/uid_205/selection.png', 'Sacré-Cœur · checkpoint-edited unit'],
  ['assets/comparison/trevi_01693870_2401033603_ours.png', 'Trevi · PSU-GS render'],
  ['assets/comparison/trevi_01693870_2401033603_wildgaussians.png', 'Trevi · WildGaussians'],
  ['assets/illumination/Trevi/t_1.00.png', 'Trevi · target illumination'],
  ['assets/material/Trevi/uid_19/selection.png', 'Trevi · checkpoint-edited unit']
];

function buildGallery() {
  const grid = $('#gallery-grid');
  galleryItems.forEach(([src, caption]) => {
    const button = document.createElement('button');
    button.className = 'gallery-card';
    button.innerHTML = `<img src="${src}" loading="lazy" alt="${caption}"><span>${caption}</span>`;
    button.addEventListener('click', () => openLightbox(src, caption));
    grid.appendChild(button);
  });
}

function openLightbox(src, caption) {
  $('#lightbox-image').src = src;
  $('#lightbox-caption').textContent = caption;
  $('#lightbox').showModal();
}

$('#method-figure').addEventListener('click', () => openLightbox('assets/figures/method-main.png', 'PSU-GS paper main figure'));
$('#lightbox-close').addEventListener('click', () => $('#lightbox').close());
$('#lightbox').addEventListener('click', event => { if (event.target === $('#lightbox')) $('#lightbox').close(); });
$('#copy-citation').addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText($('#bibtex').textContent);
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = 'Copy BibTeX'; }, 1500);
  } catch (error) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($('#bibtex'));
    selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Selected';
  }
});

buildComparison();
buildEditor();
buildGallery();
