const descriptors = [
  // Colors
  'red', 'blue', 'green', 'gold', 'silver', 'black', 'white', 'purple', 'pink',
  
  // Positive
  'happy', 'bright', 'swift', 'calm', 'wise', 'bold', 'brave', 'free', 'safe',
  
  // Nature
  'wild', 'soft', 'clear', 'clean', 'fresh', 'misty', 'quiet', 'sunny', 'rainy',
  
  // Tech
  'smart', 'cyber', 'digital', 'quantum', 'cosmic', 'hyper', 'ultra', 'mega'
];

const objects = [
  // Nature
  'river', 'cloud', 'star', 'bird', 'tree', 'moon', 'lake', 'wind', 'wave',
  
  // Animals
  'wolf', 'bear', 'lion', 'tiger', 'eagle', 'hawk', 'owl', 'fox', 'deer',
  
  // Tech
  'byte', 'code', 'data', 'file', 'link', 'node', 'page', 'path', 'port'
];

const actions = [
  'runs', 'jumps', 'flies', 'swims', 'walks', 'talks', 'reads', 'writes', 'plays',
  'moves', 'flows', 'grows', 'glows', 'fades', 'rides', 'falls', 'rises', 'shines'
];

export function generateMemorablePassword(): string {
  const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  // Capitalize first letter of each word for better readability
  const capitalizedDescriptor = descriptor.charAt(0).toUpperCase() + descriptor.slice(1);
  const capitalizedObject = object.charAt(0).toUpperCase() + object.slice(1);
  const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
  
  return `${capitalizedDescriptor}${capitalizedObject}${capitalizedAction}${number}`; // e.g. "RedRiverRuns1234"
} 