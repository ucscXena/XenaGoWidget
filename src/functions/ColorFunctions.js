export function getSelectColor() {
  return '#113871';
}

export function getHighlightedColor() {
  return '#DD55DD';
}

export function getWhiteColor() {
  return '#F7FFF7';
}

export function getCNVColorMask() {
  return [250, 0, 0];
}

export function getMutationColorMask() {
  return [0, 0, 200];
}

export function getCNVHighColorMask() {
  return [255, 0, 0];
}

export function getCNVLowColorMask() {
  return [0, 0, 255];
}

export function getMutation4ColorMask() { // same as CNV deleteion, loss of function
  // return [155, 100, 0];
  return [0, 0, 255];
}

export function getMutation3ColorMask() { // same as Xena VS, splice
  // return [150, 165, 0];
  return [255, 127, 14];
}

export function getMutation2ColorMask() { // same as Xena VS, missense/in_frame
  // return [0, 100, 155];
  return [31, 119, 180];
}

export function getGeneColorMask() {
  return [26, 83, 92];
}


export function getGeneSetColorMask() {
  return [255, 10, 10];
}
