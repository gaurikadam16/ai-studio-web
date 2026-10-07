// All options shown in the settings panel. Change them here, the UI updates.
export const IMAGE_STYLES = ['Realistic', 'Anime', '3D', 'Painting', 'Logo', 'Poster'];

export const IMAGE_SIZES = [
  { id: 'square', label: 'Square', ratio: '1:1', box: [16, 16] },
  { id: 'post', label: 'Post', ratio: '4:5', box: [14, 18] },
  { id: 'story', label: 'Story', ratio: '9:16', box: [11, 20] },
  { id: 'wide', label: 'Wide', ratio: '16:9', box: [22, 12] },
];

// Kling 3.0 makes 3–15 second videos
export const VIDEO_LENGTHS = [5, 10, 15];
// Scenes (multi-shot): each scene's length, total 15 seconds max, 2–6 scenes
export const SCENE_SECONDS = [3, 4, 5, 6, 7, 8, 10];
export const MAX_VIDEO_SECONDS = 15;
export const MAX_SCENES = 6;

export const VIDEO_SHAPES = [
  { id: 'landscape', label: 'Landscape 16:9', ratio: '16:9' },
  { id: 'vertical', label: 'Reels 9:16', ratio: '9:16' },
];
export const CAMERA_MOVES = ['Zoom in', 'Pan', 'Slow-mo'];

// Shown as buttons under the prompt box on Home
export const QUICK_TEMPLATES = [
  { label: 'YouTube thumbnail', mode: 'image', prompt: 'Bold YouTube thumbnail, excited face, big clear subject, bright background, space for title text' },
  { label: 'Product ad', mode: 'image', prompt: 'Clean product photo on a soft studio background, dramatic side light, premium look' },
  { label: 'Birthday poster', mode: 'image', prompt: 'Colourful birthday poster with balloons, confetti and space for a name' },
  { label: 'Instagram reel intro', mode: 'video', prompt: 'Fast energetic reel intro, camera flies through neon city lights at night' },
];

// Credit prices — MUST match PRICING in server/index.js (the server decides, the app only shows)
export const IMAGE_CREDIT_EACH = 2;           // 1 image
export const VIDEO_CREDIT_PER_SEC_SOUND = 10; // 1 second of video with sound
export const VIDEO_CREDIT_PER_SEC_SILENT = 5; // 1 second of video without sound
export const TOTAL_CREDITS = 500;             // free credits for a new account (used for the credits bar)
export const LOW_CREDITS = 20;                // warn the user below this

// How many photos you can upload (MUST match MAX_IMAGE_REFS / MAX_VIDEO_REFS in server/index.js)
export const MAX_IMAGE_PHOTOS = 10;
export const MAX_VIDEO_PHOTOS = 4;

// Full list for the Templates page
export const TEMPLATES = [
  { id: 't1', category: 'Social media', label: 'YouTube thumbnail', mode: 'image', size: 'wide', prompt: 'Bold YouTube thumbnail, excited face, big clear subject, bright background, space for title text' },
  { id: 't2', category: 'Social media', label: 'Instagram post', mode: 'image', size: 'post', prompt: 'Eye-catching Instagram post, clean layout, bright colours, one clear subject in the centre' },
  { id: 't3', category: 'Social media', label: 'Story / Status', mode: 'image', size: 'story', prompt: 'Vertical story design with bold text space at the top, vibrant background, modern look' },
  { id: 't4', category: 'Business', label: 'Product ad', mode: 'image', size: 'square', prompt: 'Clean product photo on a soft studio background, dramatic side light, premium look' },
  { id: 't5', category: 'Business', label: 'Company logo', mode: 'image', size: 'square', style: 'Logo', prompt: 'Simple modern logo for a company, flat colours, clean shapes, plain background' },
  { id: 't6', category: 'Business', label: 'Office / team banner', mode: 'image', size: 'wide', prompt: 'Professional banner of a modern office with a happy diverse team, bright natural light' },
  { id: 't7', category: 'Festivals & events', label: 'Birthday poster', mode: 'image', size: 'post', style: 'Poster', prompt: 'Colourful birthday poster with balloons, confetti and space for a name' },
  { id: 't8', category: 'Festivals & events', label: 'Diwali greeting', mode: 'image', size: 'square', prompt: 'Warm Diwali greeting with glowing diyas, rangoli and soft golden lights, space for a message' },
  { id: 't9', category: 'Festivals & events', label: 'Ganesh Chaturthi', mode: 'image', size: 'post', prompt: 'Beautiful Ganpati decoration with flowers, lights and a festive background, space for a greeting' },
  { id: 't10', category: 'Video', label: 'Instagram reel intro', mode: 'video', prompt: 'Fast energetic reel intro, camera flies through neon city lights at night' },
  { id: 't11', category: 'Video', label: 'Product spin', mode: 'video', prompt: 'Product slowly rotating on a clean studio table, soft reflections, premium lighting' },
  { id: 't12', category: 'Video', label: 'Travel drone shot', mode: 'video', prompt: 'Drone shot flying over green hills and a fort at sunrise, clouds below, cinematic' },
];

// Starting characters (you can edit them on the My Characters page)
export const DEFAULT_CHARACTERS = [
  { id: 'ria', name: 'Ria', color: '#3A3F52', description: 'young Indian woman, mid 20s, long black hair, friendly smile, casual modern clothes' },
  { id: 'dev', name: 'Dev', color: '#4A3A34', description: 'Indian man, early 30s, short hair, neat beard, smart casual shirt' },
];

// Empty brand kit (filled in on the Brand Kit page)
export const EMPTY_BRAND_KIT = { name: '', colors: ['#F2A65A', '#1A1A1A'], tone: '', keywords: '' };

// Words added to the prompt for each Style (so the AI knows what look you want)
export const STYLE_PROMPTS = {
  Realistic: 'photorealistic, natural lighting, sharp focus, high detail',
  Anime: 'anime style, clean line art, vibrant colours, expressive',
  '3D': '3D render, soft studio lighting, smooth materials, high detail',
  Painting: 'oil painting, visible brush strokes, rich textures',
  Logo: 'simple flat vector logo, clean shapes, plain background, no extra text',
  Poster: 'bold poster design, strong composition, eye-catching colours',
};

// Words added to the prompt for each Camera movement (video)
export const CAMERA_PROMPTS = {
  'Zoom in': 'slow camera zoom in',
  Pan: 'smooth sideways camera pan',
  'Slow-mo': 'slow motion',
};