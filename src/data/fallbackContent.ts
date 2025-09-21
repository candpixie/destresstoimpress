import { MoodContent, Meme } from '../types';

export const fallbackMoodContent: Record<string, MoodContent> = {
  Happy: {
    mood: 'Happy',
    playlists: [
      {
        title: 'Feel Good Pop Hits',
        url: 'https://www.youtube.com/playlist?list=PLDcnymzs18LU4Kexrs91TVdfnplU3I5zs',
        thumbnail: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Upbeat Energy Mix',
        url: 'https://www.youtube.com/playlist?list=PLrAl6__4OIIP2Db6w6RB1fMXd9KoA2bLr',
        thumbnail: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    movies: [
      {
        title: 'Feel Good Movie Clips',
        url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs',
        thumbnail: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Comedy Gold Moments',
        url: 'https://www.youtube.com/watch?v=Kb2Qkz43zC8',
        thumbnail: 'https://images.pexels.com/photos/4123897/pexels-photo-4123897.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  },
  Sad: {
    mood: 'Sad',
    playlists: [
      {
        title: 'Comfort Songs',
        url: 'https://www.youtube.com/playlist?list=PLWwAypAcFRgKAIIFqBr9oy-ZKKWs5vyUr',
        thumbnail: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Healing Melodies',
        url: 'https://www.youtube.com/playlist?list=PLvd7SKvnCvJnj_k4AHMqMSRPcFJDTe5Xr',
        thumbnail: 'https://images.pexels.com/photos/1644881/pexels-photo-1644881.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    movies: [
      {
        title: 'Inspirational Movie Scenes',
        url: 'https://www.youtube.com/watch?v=tbnzAVRZ9Xc',
        thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Uplifting Film Moments',
        url: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
        thumbnail: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  },
  Stressed: {
    mood: 'Stressed',
    playlists: [
      {
        title: 'Relaxing Nature Sounds',
        url: 'https://www.youtube.com/playlist?list=PLpDnOXChmgV4tQYXz7hWF42P5EoN5zN6g',
        thumbnail: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Meditation Music',
        url: 'https://www.youtube.com/playlist?list=PLWwAypAcFRgKAIIFqBr9oy-ZKKWs5vyUr',
        thumbnail: 'https://images.pexels.com/photos/3775138/pexels-photo-3775138.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    movies: [
      {
        title: 'Peaceful Nature Documentaries',
        url: 'https://www.youtube.com/watch?v=LoebZZ8K5N0',
        thumbnail: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Calming Short Films',
        url: 'https://www.youtube.com/watch?v=hFZFjoX2cGg',
        thumbnail: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  },
  Chill: {
    mood: 'Chill',
    playlists: [
      {
        title: 'Lo-Fi Hip Hop Beats',
        url: 'https://www.youtube.com/playlist?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo',
        thumbnail: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Chillout Electronic',
        url: 'https://www.youtube.com/playlist?list=PLDcnymzs18LU4Kexrs91TVdfnplU3I5zs',
        thumbnail: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
    movies: [
      {
        title: 'Aesthetic Short Films',
        url: 'https://www.youtube.com/watch?v=MBRqu0YOH14',
        thumbnail: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        title: 'Chill Movie Scenes',
        url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        thumbnail: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  }
};

export const fallbackMemes: Meme[] = [
  {
    id: '1',
    title: 'Programmer Humor',
    url: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    title: 'Study Life',
    url: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    title: 'Coffee Addiction',
    url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '4',
    title: 'Gaming Life',
    url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];