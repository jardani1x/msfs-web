export const weatherPresets = {
  clear: { id: 'clear', name: 'Clear', windKnots: 4, gustStrength: 0.5, cloudDensity: 0.1, rain: 0, fog: 0.01 },
  cloudy: { id: 'cloudy', name: 'Cloudy', windKnots: 12, gustStrength: 1.8, cloudDensity: 0.5, rain: 0.1, fog: 0.03 },
  storm: { id: 'storm', name: 'Storm', windKnots: 28, gustStrength: 5.5, cloudDensity: 0.95, rain: 1, fog: 0.08 },
  windy: { id: 'windy', name: 'Windy', windKnots: 24, gustStrength: 3.8, cloudDensity: 0.35, rain: 0.05, fog: 0.02 }
};
