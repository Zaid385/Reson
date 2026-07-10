export const QwertyKeyMap: Record<string, number> = {
  // Row 1 (pads 0-7)
  'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3,
  'Digit5': 4, 'Digit6': 5, 'Digit7': 6, 'Digit8': 7,
  // Row 2 (pads 8-15)
  'KeyQ': 8, 'KeyW': 9, 'KeyE': 10, 'KeyR': 11,
  'KeyT': 12, 'KeyY': 13, 'KeyU': 14, 'KeyI': 15,
  // Row 3 (pads 16-23)
  'KeyA': 16, 'KeyS': 17, 'KeyD': 18, 'KeyF': 19,
  'KeyG': 20, 'KeyH': 21, 'KeyJ': 22, 'KeyK': 23,
  // Row 4 (pads 24-31)
  'KeyZ': 24, 'KeyX': 25, 'KeyC': 26, 'KeyV': 27,
  'KeyB': 28, 'KeyN': 29, 'KeyM': 30, 'Comma': 31
}

export const KeyboardLabels: Record<string, string[]> = {
  qwerty: [
    '1','2','3','4','5','6','7','8',
    'Q','W','E','R','T','Y','U','I',
    'A','S','D','F','G','H','J','K',
    'Z','X','C','V','B','N','M',','
  ],
  azerty: [
    '&','é','"','\'','(','-','è','_',
    'A','Z','E','R','T','Y','U','I',
    'Q','S','D','F','G','H','J','K',
    'W','X','C','V','B','N','M',','
  ],
  qwertz: [
    '1','2','3','4','5','6','7','8',
    'Q','W','E','R','T','Z','U','I',
    'A','S','D','F','G','H','J','K',
    'Y','X','C','V','B','N','M',','
  ]
}
