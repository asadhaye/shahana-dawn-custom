/**
 * Atmosphere Module — Mood colour state and lerp logic
 * Feature: immersive-room-atmosphere
 *
 * Owns all mood colour state for the immersive store.
 * Follows the existing module pattern: var declarations at top,
 * window.ImmersiveAtmosphere = { ... } at the bottom.
 *
 * Must be loaded BEFORE webgl-engine.js in theme.liquid.
 */

// Module-level colour state — six THREE.Color instances
var bgColorCurrent = new THREE.Color();
var blob1ColorCurrent = new THREE.Color();
var blob2ColorCurrent = new THREE.Color();
var bgColorNext = new THREE.Color();
var blob1ColorNext = new THREE.Color();
var blob2ColorNext = new THREE.Color();

/**
 * initMoodUniforms — called once from initImmersiveScene() after uniforms are created.
 * Sets both current and next colour uniforms to the initialMood palette.
 *
 * @param {object} uniforms  - The ShaderMaterial uniforms object
 * @param {object} initialMood - { background: '#hex', blob1: '#hex', blob2: '#hex' }
 */
function initMoodUniforms(uniforms, initialMood) {
  if (!uniforms || !initialMood) return;

  bgColorCurrent.set(initialMood.background);
  blob1ColorCurrent.set(initialMood.blob1);
  blob2ColorCurrent.set(initialMood.blob2);

  bgColorNext.set(initialMood.background);
  blob1ColorNext.set(initialMood.blob1);
  blob2ColorNext.set(initialMood.blob2);

  if (uniforms.uBgColor) uniforms.uBgColor.value.copy(bgColorCurrent);
  if (uniforms.uBlob1Color) uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
  if (uniforms.uBlob2Color) uniforms.uBlob2Color.value.copy(blob2ColorCurrent);

  if (uniforms.uBgColorNext) uniforms.uBgColorNext.value.copy(bgColorNext);
  if (uniforms.uBlob1ColorNext) uniforms.uBlob1ColorNext.value.copy(blob1ColorNext);
  if (uniforms.uBlob2ColorNext) uniforms.uBlob2ColorNext.value.copy(blob2ColorNext);
}

/**
 * setNextMood — called from goToRoom() when navigating to a new room.
 * Updates the "next" colour targets so updateMoodUniforms() can lerp toward them.
 *
 * @param {object} mood - { background: '#hex', blob1: '#hex', blob2: '#hex' }
 */
function setNextMood(mood) {
  if (!mood) return;
  bgColorNext.set(mood.background);
  blob1ColorNext.set(mood.blob1);
  blob2ColorNext.set(mood.blob2);
}

/**
 * updateMoodUniforms — called every frame from animate().
 * Lerps current colours toward next colours and copies results to uniforms.
 *
 * @param {object} uniforms   - The ShaderMaterial uniforms object
 * @param {number} lerpFactor - Lerp factor per frame (e.g. 0.04)
 */
function updateMoodUniforms(uniforms, lerpFactor) {
  if (!uniforms) return;

  bgColorCurrent.lerp(bgColorNext, lerpFactor);
  blob1ColorCurrent.lerp(blob1ColorNext, lerpFactor);
  blob2ColorCurrent.lerp(blob2ColorNext, lerpFactor);

  if (uniforms.uBgColor) uniforms.uBgColor.value.copy(bgColorCurrent);
  if (uniforms.uBlob1Color) uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
  if (uniforms.uBlob2Color) uniforms.uBlob2Color.value.copy(blob2ColorCurrent);
}

/**
 * snapCurrentToNext — called when the texture crossfade completes (t >= 1).
 * Immediately sets current = next and updates uniforms so no further lerp occurs.
 *
 * @param {object} uniforms - The ShaderMaterial uniforms object
 */
function snapCurrentToNext(uniforms) {
  if (!uniforms) return;

  bgColorCurrent.copy(bgColorNext);
  blob1ColorCurrent.copy(blob1ColorNext);
  blob2ColorCurrent.copy(blob2ColorNext);

  if (uniforms.uBgColor) uniforms.uBgColor.value.copy(bgColorCurrent);
  if (uniforms.uBlob1Color) uniforms.uBlob1Color.value.copy(blob1ColorCurrent);
  if (uniforms.uBlob2Color) uniforms.uBlob2Color.value.copy(blob2ColorCurrent);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
window.ImmersiveAtmosphere = {
  initMoodUniforms: initMoodUniforms,
  setNextMood: setNextMood,
  updateMoodUniforms: updateMoodUniforms,
  snapCurrentToNext: snapCurrentToNext,
};
