import { RedditPost } from '../types';

const MEME_SUBREDDITS = [
  'wholesomememes',
  'EducationalMemes',
  'ScienceMemes', 
  'mathmemes',
  'historymemes',
  'ProgrammerHumor',
  'chemistrymemes',
  'physicsmemes',
  'biologymemes',
  'GetMotivated',
  'studying',
  'booksuggestions',
  'coolguides',
  'todayilearned'
];

// Comprehensive content filtering for teen-friendly, educational content
const BLOCKED_KEYWORDS = [
  // Political content
  'trump', 'biden', 'election', 'democrat', 'republican', 'politics', 'political',
  'congress', 'senate', 'president', 'vote', 'voting', 'campaign', 'liberal', 
  'conservative', 'left wing', 'right wing', 'antifa', 'maga', 'gop',
  'ukraine', 'russia', 'putin', 'war', 'israel', 'palestine', 'gaza',
  
  // Inappropriate/negative content
  'nsfw', 'adult', 'mature', 'explicit', 'inappropriate', 'offensive',
  'violence', 'violent', 'kill', 'death', 'dead', 'murder', 'suicide',
  'hate', 'racist', 'racism', 'sexist', 'discrimination', 'bullying',
  'drugs', 'alcohol', 'smoking', 'drunk', 'high', 'weed', 'marijuana',
  'sex', 'sexual', 'porn', 'nude', 'naked', 'xxx', 'adult content',
  'depression', 'anxiety', 'mental health crisis', 'self harm',
  'curse', 'swear', 'profanity', 'f*ck', 'sh*t', 'damn', 'hell',
  'toxic', 'cringe', 'stupid', 'idiot', 'loser', 'failure',
  'covid', 'pandemic', 'disease', 'illness', 'sick', 'hospital'
];

const BLOCKED_SUBREDDITS = [
  'politicalhumor', 'politicalmemes', 'conservativememes', 'libertarianmeme',
  'therightcantmeme', 'theleftcantmeme', 'politicalcompass',
  'dankmemes', 'edgymemes', 'offensivememes', 'darkhumor', 'imgoingtohellforthis',
  'teenagers', 'relationshipmemes', 'adulthumor', 'nsfw', 'nsfw_memes'
];

// Positive keywords to prioritize educational and uplifting content
const POSITIVE_KEYWORDS = [
  'education', 'learning', 'study', 'school', 'science', 'math', 'history',
  'reading', 'books', 'knowledge', 'discovery', 'facts', 'interesting',
  'motivational', 'inspiring', 'positive', 'wholesome', 'uplifting',
  'achievement', 'success', 'progress', 'growth', 'improvement',
  'friendship', 'kindness', 'helping', 'support', 'encouraging',
  'creative', 'art', 'music', 'coding', 'programming', 'technology',
  'innovation', 'future', 'dream', 'goal', 'aspiration'
];

const isContentAppropriate = (title: string, subreddit?: string): boolean => {
  const titleLower = title.toLowerCase();
  const subredditLower = subreddit?.toLowerCase() || '';
  
  // Check for blocked subreddits
  if (BLOCKED_SUBREDDITS.some(blocked => subredditLower.includes(blocked))) {
    return false;
  }
  
  // Check for blocked keywords in title
  if (BLOCKED_KEYWORDS.some(keyword => titleLower.includes(keyword))) {
    return false;
  }
  
  // Prioritize content with positive keywords (educational/wholesome)
  const hasPositiveContent = POSITIVE_KEYWORDS.some(keyword => 
    titleLower.includes(keyword) || subredditLower.includes(keyword)
  );
  
  // Accept educational subreddits even without positive keywords
  const isEducationalSubreddit = MEME_SUBREDDITS.some(educational => 
    subredditLower.includes(educational.toLowerCase())
  );
  
  return hasPositiveContent || isEducationalSubreddit || titleLower.includes('wholesome');
};

let usedMemeIds = new Set<string>();

// Enhanced Reddit API with time filters for better quality memes
export const fetchTrendingMemes = async (): Promise<RedditPost[]> => {
  try {
    const randomSubreddit = MEME_SUBREDDITS[Math.floor(Math.random() * MEME_SUBREDDITS.length)];
    const sortTypes = ['hot', 'top', 'new'];
    const timeFilters = ['day', 'week', 'month'];
    const randomSort = sortTypes[Math.floor(Math.random() * sortTypes.length)];
    const randomTime = timeFilters[Math.floor(Math.random() * timeFilters.length)];
    
    // Build URL with time filter for 'top' posts
    const baseUrl = `/reddit-api/r/${randomSubreddit}/${randomSort}.json?limit=25`;
    const url = randomSort === 'top' ? `${baseUrl}&t=${randomTime}` : baseUrl;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'web:destresstoimpress:v1.0 (by /u/PennAppsTeam) contact: team@destresstoimpress.com'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Reddit API');
    }
    
    const data = await response.json();
    
    // Transform Reddit API format to our expected format
    const posts = data.data?.children || [];
    
    const imagePosts = posts
      .map((child: any) => child.data)
      .filter((post: any) => 
        post && 
        post.url && 
        !post.over_18 &&
        !post.spoiler &&
        !post.is_video &&
        !usedMemeIds.has(post.id) &&
        isContentAppropriate(post.title, post.subreddit) &&
        (post.url.match(/\.(jpeg|jpg|png|gif)$/i) || 
         post.url.includes('i.redd.it') ||
         post.url.includes('imgur.com'))
      )
      .map((post: any) => ({
        id: post.id,
        title: post.title,
        url: post.url,
        thumbnail: post.thumbnail !== 'self' ? post.thumbnail : post.url,
        preview: post.preview ? {
          images: [{
            source: {
              url: post.preview.images[0]?.source?.url?.replace(/&amp;/g, '&') || post.url,
              width: post.preview.images[0]?.source?.width || 500,
              height: post.preview.images[0]?.source?.height || 500
            }
          }]
        } : undefined,
        is_video: post.is_video,
        domain: post.domain,
        ups: post.ups,
        created_utc: post.created_utc
      }));
    
    return imagePosts;
  } catch (error) {
    console.error('Error fetching memes:', error);
    // Fallback: try a different subreddit
    try {
      const fallbackSubreddit = MEME_SUBREDDITS[Math.floor(Math.random() * MEME_SUBREDDITS.length)];
      const fallbackResponse = await fetch(
        `/reddit-api/r/${fallbackSubreddit}/hot.json?limit=10`,
        {
          headers: {
            'User-Agent': 'web:destresstoimpress:v1.0 (by /u/PennAppsTeam) contact: team@destresstoimpress.com'
          }
        }
      );
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const fallbackPosts = fallbackData.data?.children || [];
        
        const fallbackMemes = fallbackPosts
          .map((child: any) => child.data)
          .filter((post: any) => 
            post && 
            post.url && 
            !post.over_18 &&
            !post.spoiler &&
            !post.is_video &&
            isContentAppropriate(post.title, post.subreddit) &&
            (post.url.match(/\.(jpeg|jpg|png|gif)$/i) || 
             post.url.includes('i.redd.it') ||
             post.url.includes('imgur.com'))
          )
          .slice(0, 5)
          .map((post: any) => ({
            id: post.id,
            title: post.title,
            url: post.url,
            thumbnail: post.thumbnail !== 'self' ? post.thumbnail : post.url,
            preview: post.preview ? {
              images: [{
                source: {
                  url: post.preview.images[0]?.source?.url?.replace(/&amp;/g, '&') || post.url,
                  width: post.preview.images[0]?.source?.width || 500,
                  height: post.preview.images[0]?.source?.height || 500
                }
              }]
            } : undefined,
            is_video: post.is_video,
            domain: post.domain,
            ups: post.ups,
            created_utc: post.created_utc
          }));
          
        return fallbackMemes;
      }
    } catch (fallbackError) {
      console.error('Fallback Reddit fetch failed:', fallbackError);
    }
    return [];
  }
};

export const getUniqueRedditMeme = async () => {
  const memes = await fetchTrendingMemes();
  
  if (memes.length === 0) {
    return null;
  }
  
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];
  
  // Mark as used
  usedMemeIds.add(randomMeme.id);
  
  // Clean up old used IDs if we have too many (keep last 100)
  if (usedMemeIds.size > 100) {
    const idsArray = Array.from(usedMemeIds);
    usedMemeIds = new Set(idsArray.slice(-50));
  }
  
  return {
    id: randomMeme.id,
    title: randomMeme.title,
    url: getImageUrl(randomMeme),
    thumbnail: randomMeme.thumbnail,
    redditUrl: `https://reddit.com/r/${randomMeme.domain}`,
    score: randomMeme.ups,
    subreddit: randomMeme.domain
  };
};

const getImageUrl = (post: RedditPost): string => {
  if (post.domain.includes('i.redd.it')) {
    return post.url;
  }
  
  if (post.preview && post.preview.images.length > 0) {
    // Decode HTML entities in the URL
    return post.preview.images[0].source.url.replace(/&amp;/g, '&');
  }
  
  if (post.domain.includes('imgur.com') && !post.url.includes('.gifv')) {
    return post.url;
  }
  
  return post.thumbnail;
};

export const resetUsedMemes = () => {
  usedMemeIds.clear();
};