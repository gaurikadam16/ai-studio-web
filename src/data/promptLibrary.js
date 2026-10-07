/**
 * PROMPT LIBRARY — expert prompts with fill-in-the-blanks.
 * Write {key} in the prompt where the user's words go, and describe that key in "fields".
 * "settings" = the best settings for this prompt (applied automatically).
 * "photos": 'optional' | 'required'  -> shows a hint to add the user's own photo(s).
 * To add your own prompt: copy one block, change the id (must be unique), and edit the text.
 */

export const PROMPT_CATEGORIES = [
  'Festivals', 'Business & Ads', 'Products', 'Food', 'Social Media',
  'Portraits & People', 'Real Estate', 'Travel & Places', 'Cinematic Video', 'Reels & Shorts',
];

export const PROMPT_LIBRARY = [
  // ---------------------------------------------------------------- FESTIVALS (image)
  {
    id: 'diwali-greeting', mode: 'image', category: 'Festivals', emoji: '🪔', color: '#7A3E12',
    title: 'Diwali greeting card',
    description: 'Warm, glowing Diwali wish with diyas and rangoli, with space for your message.',
    prompt: 'A luxurious Diwali greeting card design, rows of glowing clay diyas and a detailed {colors} rangoli on a dark wooden floor, soft bokeh fairy lights and floating golden sparkles in the background, elegant space at the top for the text "{message}" written in beautiful golden calligraphy, small text at the bottom "From {sender}", warm festive mood, ultra detailed, professional greeting card',
    fields: [
      { key: 'message', label: 'Greeting text', default: 'Happy Diwali', placeholder: 'Happy Diwali / शुभ दीपावली' },
      { key: 'sender', label: 'From (name / shop)', default: 'The Sharma Family', placeholder: 'Your name or business' },
      { key: 'colors', label: 'Rangoli colours', default: 'orange, pink and gold', options: ['orange, pink and gold', 'red and yellow', 'purple and teal', 'white and gold'] },
    ],
    settings: { style: 'Realistic', size: 'square', count: 2 },
  },
  {
    id: 'ganpati-poster', mode: 'image', category: 'Festivals', emoji: '🐘', color: '#8A2B1B',
    title: 'Ganesh Chaturthi poster',
    description: 'Grand Ganpati Bappa idol with flowers and lights — perfect for wishes and mandal posters.',
    prompt: 'A grand, devotional poster of a beautifully decorated Lord Ganesha idol seated on an ornate golden throne, covered with marigold and rose garlands, soft temple lights and diyas around, {background}, cinematic warm lighting, the text "{message}" in elegant Marathi-style golden lettering at the top, small text "{mandal}" at the bottom, highly detailed, festive and divine mood',
    fields: [
      { key: 'message', label: 'Greeting text', default: 'Ganpati Bappa Morya', placeholder: 'गणपती बाप्पा मोरया' },
      { key: 'mandal', label: 'Mandal / family name', default: 'Shree Ganesh Mitra Mandal', placeholder: 'Your mandal or family' },
      { key: 'background', label: 'Background', default: 'a festive red and gold pandal background', options: ['a festive red and gold pandal background', 'a calm night sky with fireworks', 'a temple courtyard at dusk', 'a floral wall of marigolds'] },
    ],
    settings: { style: 'Realistic', size: 'post', count: 2 },
  },
  {
    id: 'holi-portrait', mode: 'image', category: 'Festivals', emoji: '🎨', color: '#8A1B6E',
    title: 'Holi celebration photo',
    description: 'Joyful people throwing colours, bright and energetic.',
    prompt: 'A joyful candid photo of {people} celebrating Holi, laughing and throwing clouds of bright pink, yellow and blue colour powder into the air, colour dust frozen in mid-air, sunny afternoon in {place}, shallow depth of field, vibrant colours, sharp faces, professional festival photography',
    fields: [
      { key: 'people', label: 'Who is in the photo', default: 'a group of young Indian friends', placeholder: 'e.g. a happy family of four' },
      { key: 'place', label: 'Where', default: 'an old Indian street', placeholder: 'e.g. a village courtyard' },
    ],
    settings: { style: 'Realistic', size: 'wide', count: 2 },
  },
  {
    id: 'wedding-invite', mode: 'image', category: 'Festivals', emoji: '💍', color: '#6B4A1E',
    title: 'Wedding invitation',
    description: 'Royal Indian wedding invite with names and date.',
    prompt: 'An elegant royal Indian wedding invitation card, {theme}, intricate gold foil borders and a floral mandala, the names "{names}" in large beautiful calligraphy at the centre, the date "{date}" below in smaller elegant text, luxury paper texture, symmetrical layout, soft lighting, high detail',
    fields: [
      { key: 'names', label: 'Couple names', default: 'Rahul & Priya', placeholder: 'Bride & Groom' },
      { key: 'date', label: 'Date', default: '12 December 2026', placeholder: 'Wedding date' },
      { key: 'theme', label: 'Theme', default: 'deep maroon and gold colour theme', options: ['deep maroon and gold colour theme', 'pastel pink and ivory theme', 'royal blue and gold theme', 'green and gold South Indian temple theme'] },
    ],
    settings: { style: 'Poster', size: 'post', count: 2 },
  },
  {
    id: 'birthday-poster', mode: 'image', category: 'Festivals', emoji: '🎂', color: '#7A2E5A',
    title: 'Birthday wish poster',
    description: 'Colourful birthday poster with the person’s name and age.',
    prompt: 'A cheerful birthday poster for {name} turning {age}, colourful balloons, confetti and a beautiful {cake} in the centre, the text "Happy Birthday {name}" in big playful 3D letters at the top, {theme} colour theme, bright soft lighting, festive and fun, high detail',
    fields: [
      { key: 'name', label: 'Name', default: 'Aarav', placeholder: 'Birthday person' },
      { key: 'age', label: 'Age', default: '5', placeholder: 'e.g. 25' },
      { key: 'cake', label: 'Cake', default: 'two-layer chocolate cake with candles', placeholder: 'e.g. unicorn cake' },
      { key: 'theme', label: 'Colours', default: 'pink and gold', options: ['pink and gold', 'blue and silver', 'rainbow', 'black and gold'] },
    ],
    settings: { style: 'Poster', size: 'post', count: 2 },
  },

  // ---------------------------------------------------------------- BUSINESS & ADS (image)
  {
    id: 'sale-banner', mode: 'image', category: 'Business & Ads', emoji: '🏷️', color: '#7A1B1B',
    title: 'Sale / offer banner',
    description: 'Eye-catching discount banner for your shop or website.',
    prompt: 'A bold modern sale banner for {shop}, the text "{offer}" in huge bright letters as the main focus, {product} shown attractively on the side, dynamic shapes and {colors} colours, clean layout with space for small text, professional advertising design, sharp and eye-catching',
    fields: [
      { key: 'shop', label: 'Shop / brand', default: 'a clothing store', placeholder: 'e.g. Kadam Sarees' },
      { key: 'offer', label: 'Offer text', default: 'FLAT 50% OFF', placeholder: 'e.g. Buy 1 Get 1 Free' },
      { key: 'product', label: 'Product to show', default: 'stylish kurtas on hangers', placeholder: 'e.g. mobile phones' },
      { key: 'colors', label: 'Colours', default: 'red and yellow', options: ['red and yellow', 'black and gold', 'blue and white', 'green and orange'] },
    ],
    settings: { style: 'Poster', size: 'wide', count: 2 },
  },
  {
    id: 'logo', mode: 'image', category: 'Business & Ads', emoji: '✳️', color: '#1E4A6B',
    title: 'Modern logo',
    description: 'Simple, clean logo for your business.',
    prompt: 'A simple modern minimalist logo for "{name}", a {business}, clever icon combining {idea}, flat vector style, {colors} colours, clean geometric shapes, the brand name in a neat sans-serif font below the icon, plain white background, professional brand identity',
    fields: [
      { key: 'name', label: 'Business name', default: 'Aaryans Technology', placeholder: 'Your brand name' },
      { key: 'business', label: 'Type of business', default: 'technology company', placeholder: 'e.g. bakery, gym' },
      { key: 'idea', label: 'Icon idea', default: 'a spark and the letter A', placeholder: 'e.g. a coffee cup and a leaf' },
      { key: 'colors', label: 'Colours', default: 'orange and dark grey', placeholder: 'e.g. green and white' },
    ],
    settings: { style: 'Logo', size: 'square', count: 4 },
  },
  {
    id: 'headshot', mode: 'image', category: 'Business & Ads', emoji: '👔', color: '#2E3A4A',
    title: 'Professional headshot',
    description: 'LinkedIn-ready photo from your selfie.',
    photos: 'required', photoHint: 'Add 1 clear selfie (face visible, good light).',
    prompt: 'Turn the person in photo 1 into a professional corporate headshot, keep the exact same face and identity, wearing {outfit}, {background}, soft studio lighting, confident friendly expression, sharp focus on the eyes, LinkedIn profile photo quality',
    fields: [
      { key: 'outfit', label: 'Outfit', default: 'a well-fitted navy blue blazer and white shirt', options: ['a well-fitted navy blue blazer and white shirt', 'a black suit and tie', 'a formal saree', 'a smart casual shirt'] },
      { key: 'background', label: 'Background', default: 'plain soft grey studio background', options: ['plain soft grey studio background', 'blurred modern office background', 'clean white background'] },
    ],
    settings: { style: 'Realistic', size: 'square', count: 2 },
  },

  // ---------------------------------------------------------------- PRODUCTS (image)
  {
    id: 'product-studio', mode: 'image', category: 'Products', emoji: '📦', color: '#3E3A6B',
    title: 'Premium product photo',
    description: 'Your product on a podium with studio lights — like big brand ads.',
    photos: 'optional', photoHint: 'Add a photo of your product for the best match.',
    prompt: 'A premium e-commerce product photo of {product}, placed on a {podium}, soft studio lighting with gentle shadows and reflections, {background} background, minimal and elegant composition, ultra sharp, high-end advertising photography',
    fields: [
      { key: 'product', label: 'Product', default: 'a perfume bottle', placeholder: 'e.g. the product in photo 1' },
      { key: 'podium', label: 'Stand', default: 'white marble podium', options: ['white marble podium', 'wooden block', 'round stone pedestal', 'glass cube'] },
      { key: 'background', label: 'Background colour', default: 'soft beige', placeholder: 'e.g. pastel pink' },
    ],
    settings: { style: 'Realistic', size: 'square', count: 2 },
  },
  {
    id: 'product-lifestyle', mode: 'image', category: 'Products', emoji: '🛍️', color: '#4A3A1E',
    title: 'Product in real life',
    description: 'Your product being used in a natural lifestyle scene.',
    photos: 'optional', photoHint: 'Add a photo of your product for the best match.',
    prompt: 'A natural lifestyle photo of {person} using {product} in {place}, candid moment, warm natural window light, cosy and realistic atmosphere, the product clearly visible and in focus, shallow depth of field, professional brand photography',
    fields: [
      { key: 'product', label: 'Product', default: 'a ceramic coffee mug', placeholder: 'e.g. the bag in photo 1' },
      { key: 'person', label: 'Who uses it', default: 'a smiling young woman', placeholder: 'e.g. a college student' },
      { key: 'place', label: 'Where', default: 'a bright modern kitchen', placeholder: 'e.g. a cafe' },
    ],
    settings: { style: 'Realistic', size: 'post', count: 2 },
  },

  // ---------------------------------------------------------------- FOOD (image)
  {
    id: 'food-menu', mode: 'image', category: 'Food', emoji: '🍛', color: '#7A4A12',
    title: 'Mouth-watering dish',
    description: 'Restaurant-quality food photo for menus and Swiggy/Zomato.',
    prompt: 'A mouth-watering close-up food photo of {dish}, served in {plate}, steam rising, garnished beautifully, on a rustic wooden table with {props} around, soft side lighting, rich colours, shallow depth of field, professional menu photography',
    fields: [
      { key: 'dish', label: 'Dish', default: 'hot paneer butter masala with butter naan', placeholder: 'e.g. vada pav' },
      { key: 'plate', label: 'Served in', default: 'a copper bowl', options: ['a copper bowl', 'a banana leaf', 'a white ceramic plate', 'a steel thali'] },
      { key: 'props', label: 'Things around', default: 'fresh coriander, chillies and spices', placeholder: 'e.g. a glass of lassi' },
    ],
    settings: { style: 'Realistic', size: 'square', count: 2 },
  },

  // ---------------------------------------------------------------- SOCIAL MEDIA (image)
  {
    id: 'yt-thumbnail', mode: 'image', category: 'Social Media', emoji: '▶️', color: '#7A1B1B',
    title: 'YouTube thumbnail',
    description: 'Bold, clickable thumbnail with big text.',
    photos: 'optional', photoHint: 'Add your photo to put your own face in the thumbnail.',
    prompt: 'An eye-catching YouTube thumbnail about {topic}, {person} with a {emotion} expression on the right side, big bold 3D text "{title}" on the left with a thick outline, bright high-contrast {colors} background, dramatic lighting, very clean and readable, viral thumbnail style',
    fields: [
      { key: 'topic', label: 'Video topic', default: 'earning money online', placeholder: 'e.g. Pune street food tour' },
      { key: 'title', label: 'Big text (2–4 words)', default: 'EARN ₹50,000!', placeholder: 'Short, bold words' },
      { key: 'person', label: 'Person', default: 'a young Indian man', placeholder: 'e.g. the person in photo 1' },
      { key: 'emotion', label: 'Expression', default: 'shocked and excited', options: ['shocked and excited', 'happy and smiling', 'serious and confident', 'curious'] },
      { key: 'colors', label: 'Background', default: 'yellow and red', placeholder: 'e.g. blue and purple' },
    ],
    settings: { style: 'Poster', size: 'wide', count: 2 },
  },
  {
    id: 'quote-post', mode: 'image', category: 'Social Media', emoji: '💬', color: '#2E4A3A',
    title: 'Motivational quote post',
    description: 'Aesthetic Instagram post with your quote.',
    prompt: 'An aesthetic Instagram quote post, the quote "{quote}" written in elegant {font} typography in the centre, background of {background}, calm and inspiring mood, soft light, lots of empty space, minimal and beautiful social media design',
    fields: [
      { key: 'quote', label: 'Quote', default: 'Small steps every day', placeholder: 'Your quote' },
      { key: 'font', label: 'Font style', default: 'serif', options: ['serif', 'handwritten script', 'bold modern sans-serif'] },
      { key: 'background', label: 'Background', default: 'misty mountains at sunrise', placeholder: 'e.g. soft beige paper texture' },
    ],
    settings: { style: 'Realistic', size: 'post', count: 2 },
  },
  {
    id: 'story-promo', mode: 'image', category: 'Social Media', emoji: '📱', color: '#3E1E6B',
    title: 'Instagram story promo',
    description: 'Vertical story announcing an event or launch.',
    prompt: 'A trendy vertical Instagram story design announcing {event}, big bold headline "{headline}" at the top, {visual} in the middle, the details "{details}" at the bottom in clean small text, {colors} colour palette, modern gradient shapes, high contrast, professional social media design',
    fields: [
      { key: 'event', label: 'What is it', default: 'a new cafe opening', placeholder: 'e.g. a yoga workshop' },
      { key: 'headline', label: 'Headline', default: 'GRAND OPENING', placeholder: 'e.g. NEW LAUNCH' },
      { key: 'visual', label: 'Main picture', default: 'a cup of latte art coffee', placeholder: 'e.g. a smiling yoga teacher' },
      { key: 'details', label: 'Details', default: 'Sunday 10 AM · FC Road, Pune', placeholder: 'Date · Place' },
      { key: 'colors', label: 'Colours', default: 'purple and orange', placeholder: 'e.g. teal and white' },
    ],
    settings: { style: 'Poster', size: 'story', count: 2 },
  },

  // ---------------------------------------------------------------- PORTRAITS & PEOPLE (image)
  {
    id: 'cinematic-portrait', mode: 'image', category: 'Portraits & People', emoji: '🎞️', color: '#2E2E3A',
    title: 'Cinematic portrait',
    description: 'Movie-poster style portrait with dramatic light.',
    photos: 'optional', photoHint: 'Add your photo to keep your own face.',
    prompt: 'A cinematic portrait of {person}, {outfit}, standing in {place}, dramatic {light} lighting, moody atmosphere, shallow depth of field, film grain, shot on a 85mm lens, looks like a still from a Bollywood blockbuster',
    fields: [
      { key: 'person', label: 'Person', default: 'a confident young Indian woman', placeholder: 'e.g. the person in photo 1' },
      { key: 'outfit', label: 'Wearing', default: 'wearing a black leather jacket', placeholder: 'e.g. a red saree' },
      { key: 'place', label: 'Where', default: 'a rainy Mumbai street at night', placeholder: 'e.g. a desert at sunset' },
      { key: 'light', label: 'Light', default: 'neon blue and pink', options: ['neon blue and pink', 'golden hour', 'soft window', 'high-contrast black and white'] },
    ],
    settings: { style: 'Realistic', size: 'post', count: 2 },
  },
  {
    id: 'anime-character', mode: 'image', category: 'Portraits & People', emoji: '✨', color: '#4A1E6B',
    title: 'Anime character',
    description: 'Turn anyone into a beautiful anime character.',
    photos: 'optional', photoHint: 'Add a photo to turn that person into anime.',
    prompt: 'A beautiful anime illustration of {person}, {outfit}, in {place}, expressive big eyes, soft cel shading, vibrant colours, detailed background, Studio Ghibli inspired atmosphere, high quality anime art',
    fields: [
      { key: 'person', label: 'Who', default: 'a cheerful school girl', placeholder: 'e.g. the person in photo 1' },
      { key: 'outfit', label: 'Wearing', default: 'wearing a yellow raincoat', placeholder: 'e.g. a hero costume' },
      { key: 'place', label: 'Where', default: 'a flower field under a big blue sky', placeholder: 'e.g. a futuristic city' },
    ],
    settings: { style: 'Anime', size: 'post', count: 2 },
  },
  {
    id: 'kids-cartoon', mode: 'image', category: 'Portraits & People', emoji: '🧸', color: '#1E5A6B',
    title: 'Kids storybook picture',
    description: 'Cute 3D cartoon scene for kids’ stories.',
    prompt: 'A cute 3D Pixar-style illustration of {character} {action} in {place}, big expressive eyes, soft colourful lighting, rounded shapes, magical and happy mood, children’s storybook quality, highly detailed',
    fields: [
      { key: 'character', label: 'Character', default: 'a little elephant', placeholder: 'e.g. a curious boy' },
      { key: 'action', label: 'Doing what', default: 'flying a kite', placeholder: 'e.g. reading a book' },
      { key: 'place', label: 'Where', default: 'a sunny green meadow', placeholder: 'e.g. a jungle' },
    ],
    settings: { style: '3D', size: 'square', count: 2 },
  },

  // ---------------------------------------------------------------- REAL ESTATE (image)
  {
    id: 'interior', mode: 'image', category: 'Real Estate', emoji: '🛋️', color: '#4A3A2E',
    title: 'Interior design',
    description: 'Beautiful room design for builders and decorators.',
    photos: 'optional', photoHint: 'Add a photo of your empty room to redesign it.',
    prompt: 'A beautiful {style} {room} interior design, {colors} colour scheme, large windows with soft natural light, stylish furniture and plants, tidy and spacious, architectural photography, wide angle, ultra realistic, magazine quality',
    fields: [
      { key: 'room', label: 'Room', default: 'living room', options: ['living room', 'bedroom', 'kitchen', 'office cabin', 'balcony'] },
      { key: 'style', label: 'Style', default: 'modern Indian', options: ['modern Indian', 'Scandinavian', 'luxury', 'minimal', 'traditional wooden'] },
      { key: 'colors', label: 'Colours', default: 'beige, white and wood', placeholder: 'e.g. grey and teal' },
    ],
    settings: { style: 'Realistic', size: 'wide', count: 2 },
  },

  // ---------------------------------------------------------------- TRAVEL (image)
  {
    id: 'travel-poster', mode: 'image', category: 'Travel & Places', emoji: '🏔️', color: '#1E4A3A',
    title: 'Travel poster',
    description: 'Stunning destination poster with its name.',
    prompt: 'A breathtaking travel poster of {place} at {time}, {details}, dramatic sky, vivid colours, the name "{title}" in large elegant letters at the top, cinematic wide view, professional tourism advertising',
    fields: [
      { key: 'place', label: 'Place', default: 'Sinhagad Fort near Pune', placeholder: 'e.g. Goa beach' },
      { key: 'title', label: 'Title text', default: 'SINHAGAD', placeholder: 'Place name' },
      { key: 'time', label: 'Time', default: 'sunrise', options: ['sunrise', 'sunset', 'monsoon morning', 'starry night'] },
      { key: 'details', label: 'Details', default: 'clouds below the hills and lush green valleys', placeholder: 'e.g. palm trees and waves' },
    ],
    settings: { style: 'Realistic', size: 'post', count: 2 },
  },

  // ---------------------------------------------------------------- CINEMATIC VIDEO
  {
    id: 'v-drone', mode: 'video', category: 'Cinematic Video', emoji: '🚁', color: '#1E3A5A',
    title: 'Drone shot of a place',
    description: 'Smooth flying drone shot over any location.',
    prompt: 'A smooth cinematic drone shot slowly flying forward over {place} at {time}, {details}, soft volumetric light, gentle camera movement, ultra realistic, 4K travel documentary look',
    fields: [
      { key: 'place', label: 'Place', default: 'green Western Ghats mountains with a waterfall', placeholder: 'e.g. Marine Drive, Mumbai' },
      { key: 'time', label: 'Time', default: 'sunrise', options: ['sunrise', 'sunset', 'monsoon morning', 'night with city lights'] },
      { key: 'details', label: 'Details', default: 'mist rolling over the hills', placeholder: 'e.g. waves hitting the shore' },
    ],
    settings: { length: 5, shape: 'landscape', camera: 'Zoom in', music: false },
  },
  {
    id: 'v-rain-street', mode: 'video', category: 'Cinematic Video', emoji: '🌧️', color: '#2E3A4A',
    title: 'Rainy street mood',
    description: 'Moody slow-motion rain scene with a person.',
    prompt: '{person} walking slowly with an umbrella through a {place} in heavy rain, neon reflections on the wet road, raindrops in slow motion, the camera tracks smoothly beside them, moody cinematic colour grade, film look',
    fields: [
      { key: 'person', label: 'Person', default: 'a young man in a beige coat', placeholder: 'e.g. a girl in a yellow raincoat' },
      { key: 'place', label: 'Street', default: 'busy Mumbai street at night', placeholder: 'e.g. quiet village lane' },
    ],
    settings: { length: 5, shape: 'landscape', camera: 'Slow-mo', music: false },
  },
  {
    id: 'v-photo-alive', mode: 'video', category: 'Cinematic Video', emoji: '🖼️', color: '#4A2E5A',
    title: 'Bring a photo to life',
    description: 'Your photo starts moving naturally.',
    photos: 'required', photoHint: 'Add 1 photo — it becomes the first frame.',
    prompt: 'The scene in the photo comes to life: {motion}, natural and realistic movement, gentle camera {camera}, soft cinematic lighting, keep the people and place exactly the same',
    fields: [
      { key: 'motion', label: 'What moves', default: 'the people smile and look at each other, hair moves in a light breeze', placeholder: 'e.g. the child waves at the camera' },
      { key: 'camera', label: 'Camera', default: 'push-in', options: ['push-in', 'pan to the right', 'slow orbit'] },
    ],
    settings: { length: 5, shape: 'landscape', camera: 'Zoom in', music: false },
  },
  {
    id: 'v-nature', mode: 'video', category: 'Cinematic Video', emoji: '🌿', color: '#1E4A2E',
    title: 'Nature close-up',
    description: 'Beautiful macro nature shot, calm and relaxing.',
    prompt: 'A stunning macro slow-motion shot of {subject}, {action}, morning dew drops sparkling, soft golden backlight, creamy blurred background, peaceful and relaxing, nature documentary quality',
    fields: [
      { key: 'subject', label: 'Subject', default: 'a lotus flower', placeholder: 'e.g. a butterfly' },
      { key: 'action', label: 'What happens', default: 'slowly opening its petals', placeholder: 'e.g. landing on a flower' },
    ],
    settings: { length: 5, shape: 'landscape', camera: 'Slow-mo', music: false },
  },

  // ---------------------------------------------------------------- PRODUCT & FOOD VIDEO
  {
    id: 'v-product-spin', mode: 'video', category: 'Business & Ads', emoji: '🔄', color: '#3E3A6B',
    title: 'Product ad video',
    description: 'Your product rotating with premium lights.',
    photos: 'optional', photoHint: 'Add a photo of your product for the best match.',
    prompt: '{product} slowly rotating on a {surface}, premium studio lighting with soft reflections, {effect}, elegant and luxurious mood, smooth camera orbit, high-end commercial advertisement',
    fields: [
      { key: 'product', label: 'Product', default: 'a luxury wrist watch', placeholder: 'e.g. the product in photo 1' },
      { key: 'surface', label: 'Surface', default: 'black glossy stand', options: ['black glossy stand', 'white marble table', 'wooden table', 'water surface'] },
      { key: 'effect', label: 'Effect', default: 'light dust particles floating', options: ['light dust particles floating', 'water splashes around', 'rose petals falling', 'smoke swirling'] },
    ],
    settings: { length: 5, shape: 'vertical', camera: 'Pan', music: true },
  },
  {
    id: 'v-food-sizzle', mode: 'video', category: 'Food', emoji: '🔥', color: '#7A3E12',
    title: 'Sizzling food video',
    description: 'Hot, steaming food shot for restaurant reels.',
    prompt: 'A close-up slow-motion video of {dish} being {action}, steam and sizzle rising, glistening textures, warm restaurant lighting, shallow depth of field, mouth-watering food commercial',
    fields: [
      { key: 'dish', label: 'Dish', default: 'a hot sizzling brownie with ice cream', placeholder: 'e.g. pav bhaji' },
      { key: 'action', label: 'Action', default: 'served on a hot iron plate with chocolate sauce poured on top', placeholder: 'e.g. topped with melting butter' },
    ],
    settings: { length: 5, shape: 'vertical', camera: 'Zoom in', music: true },
  },

  // ---------------------------------------------------------------- REELS & SHORTS
  {
    id: 'v-reel-intro', mode: 'video', category: 'Reels & Shorts', emoji: '⚡', color: '#3E1E6B',
    title: 'Reel intro',
    description: 'Fast, energetic opening for Instagram Reels.',
    prompt: 'A fast energetic intro for a {topic} reel, the camera rushes through {scene}, bold light streaks and quick smooth motion, vibrant {colors} colours, high energy, trendy social media style',
    fields: [
      { key: 'topic', label: 'Reel topic', default: 'tech review', placeholder: 'e.g. fitness' },
      { key: 'scene', label: 'Scene', default: 'a neon-lit futuristic city at night', placeholder: 'e.g. a busy gym' },
      { key: 'colors', label: 'Colours', default: 'purple and blue', placeholder: 'e.g. orange and red' },
    ],
    settings: { length: 5, shape: 'vertical', camera: 'Zoom in', music: true },
  },
  {
    id: 'v-festival-reel', mode: 'video', category: 'Reels & Shorts', emoji: '🎆', color: '#7A2E12',
    title: 'Festival celebration reel',
    description: 'Joyful festival moment for wishes and status.',
    prompt: '{people} celebrating {festival} at night, {activity}, fireworks lighting up the sky, warm golden glow on happy faces, festive joyful atmosphere, smooth cinematic camera movement',
    fields: [
      { key: 'festival', label: 'Festival', default: 'Diwali', options: ['Diwali', 'Ganesh Chaturthi', 'Navratri', 'Christmas', 'Eid', 'New Year'] },
      { key: 'people', label: 'Who', default: 'a happy Indian family', placeholder: 'e.g. a group of friends' },
      { key: 'activity', label: 'Doing what', default: 'lighting diyas and sparklers on the balcony', placeholder: 'e.g. dancing garba' },
    ],
    settings: { length: 5, shape: 'vertical', camera: 'Pan', music: true },
  },
  {
    id: 'v-fashion', mode: 'video', category: 'Reels & Shorts', emoji: '👗', color: '#6B1E4A',
    title: 'Fashion walk',
    description: 'Model walking confidently — great for clothing brands.',
    photos: 'optional', photoHint: 'Add a photo of the outfit or model.',
    prompt: '{model} walking confidently towards the camera wearing {outfit}, in {place}, fabric flowing naturally, slow-motion fashion runway style, soft cinematic lighting, high-end fashion commercial',
    fields: [
      { key: 'model', label: 'Model', default: 'a young Indian woman', placeholder: 'e.g. the person in photo 1' },
      { key: 'outfit', label: 'Outfit', default: 'a flowing red silk saree with gold border', placeholder: 'e.g. a white kurta' },
      { key: 'place', label: 'Where', default: 'an old palace corridor', placeholder: 'e.g. a city street' },
    ],
    settings: { length: 5, shape: 'vertical', camera: 'Slow-mo', music: true },
  },
  {
    id: 'v-real-estate', mode: 'video', category: 'Real Estate', emoji: '🏠', color: '#4A3A2E',
    title: 'Home walkthrough',
    description: 'Smooth camera moving through a beautiful home.',
    prompt: 'A smooth cinematic walkthrough video of a {home}, the camera glides slowly from the {start} into the {end}, {style} interiors, warm natural light, spacious and luxurious feel, real estate showcase',
    fields: [
      { key: 'home', label: 'Home', default: '3 BHK luxury apartment', placeholder: 'e.g. farmhouse villa' },
      { key: 'start', label: 'Start room', default: 'entrance door', placeholder: 'e.g. garden' },
      { key: 'end', label: 'End room', default: 'living room with a balcony view', placeholder: 'e.g. master bedroom' },
      { key: 'style', label: 'Style', default: 'modern', options: ['modern', 'luxury', 'minimal', 'traditional'] },
    ],
    settings: { length: 10, shape: 'landscape', camera: 'Pan', music: true },
  },
];

// Fill {key} placeholders with the user's words (empty boxes use the default)
export function fillPrompt(template, values = {}) {
  return template.prompt.replace(/\{(\w+)\}/g, (_, key) => {
    const field = template.fields.find((f) => f.key === key);
    const v = (values[key] ?? '').toString().trim();
    return v || field?.default || '';
  });
}