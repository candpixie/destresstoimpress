// Educational and wholesome meme content inspired by Reddit analysis
const EDUCATIONAL_MEMES = [
  {
    id: 'edu-1',
    title: 'When you finally understand that math concept',
    url: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-2',
    title: 'Study group vs. solo study energy',
    url: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-3',
    title: 'Coffee: The fuel of learning',
    url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-4',
    title: 'When coding finally works on the first try',
    url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-5',
    title: 'Science experiments: Expectation vs Reality',
    url: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-6',
    title: 'Reading one more chapter before bed',
    url: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-7',
    title: 'When you ace that difficult exam',
    url: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-8',
    title: 'Library: The ultimate study sanctuary',
    url: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-9',
    title: 'Group project coordination in a nutshell',
    url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'edu-10',
    title: 'When you discover a new learning technique',
    url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

let usedMemeIds = new Set<string>();
export const getUniqueRedditMeme = async () => {
  // Filter out already used memes
  const availableMemes = EDUCATIONAL_MEMES.filter(meme => !usedMemeIds.has(meme.id));
  
  // If all memes have been used, reset the used set
  if (availableMemes.length === 0) {
    usedMemeIds.clear();
    const randomMeme = EDUCATIONAL_MEMES[Math.floor(Math.random() * EDUCATIONAL_MEMES.length)];
    usedMemeIds.add(randomMeme.id);
    
    return {
      id: randomMeme.id,
      title: randomMeme.title,
      url: randomMeme.url,
      thumbnail: randomMeme.thumbnail,
      redditUrl: null,
      score: null,
      subreddit: 'Educational Content'
    };
  }
  
  const randomMeme = availableMemes[Math.floor(Math.random() * availableMemes.length)];
  
  // Mark as used
  usedMemeIds.add(randomMeme.id);
  
  return {
    id: randomMeme.id,
    title: randomMeme.title,
    url: randomMeme.url,
    thumbnail: randomMeme.thumbnail,
    redditUrl: null,
    score: null,
    subreddit: 'Educational Content'
  };
};

export const resetUsedMemes = () => {
  usedMemeIds.clear();
};