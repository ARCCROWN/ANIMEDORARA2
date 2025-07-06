import { Show, MoviesData } from '../types';

export const showsData: Show[] = [
  {
    id: "doraemon",
    title: "Doraemon",
    poster: "https://p325k7wa.twic.pics/high/doraemon/doraemon-story-of-seasons-2/00-page-setup/DSOS2_Header-Mobile.jpg?twic=v1/resize=760/step=10/quality=80",
    moviesCount: "10 Movies Available"
  },
  {
    id: "shinchan",
    title: "Shinchan",
    poster: "https://stat.ameba.jp/user_images/20200519/04/smayuzu/44/ee/j/o1080060914760914465.jpg?caw=800",
    moviesCount: "10 Movies Available"
  },
  {
    id: "pokemon",
    title: "Pokemon",
    poster: "https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABRi5AJkZ8Qy7tKM86nq8rX78sLZwi3E4iYH4vxYIr1wfwpyTfzMpOZFqk81pVJaQGGHk7SV74BxSd67eshn_gXLj9LpOiE-e3Dlo.jpg?r=a5e",
    moviesCount: "2 Movies Available"
  }
];

export const moviesData: MoviesData = {
  doraemon: [
    {
      id: "11",
      title: "Doraemon: Treasure Island",
      poster: "https://play-lh.googleusercontent.com/oESQPuIZhSWalyldjyVuGSTuEaWscToJsOuf4FEv_DeYM5bTzYHK1B726gJw33DSsX4rYbDQicScztASnZUh",
      genre: "Adventure, Fantasy, Family",
      rating: "8.2/10",
      watchSources: [
        { type: "dailymotion", id: "x91ccw4" },
        { type: "youtube", id: "dQw4w9WgXcQ" },
        { type: "facebook", url: "https://www.facebook.com/watch/1234567890" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/12345/view" },
        { type: "mediafire", url: "https://www.mediafire.com/file/abc123/file.mp4" },
        { type: "mega", url: "https://mega.nz/file/abc123" }
      ],
      isNew: true
    },
    {
      id: "12",
      title: "Doraemon: Nobita's Chronicle of the Moon Exploration",
      poster: "https://m.media-amazon.com/images/M/MV5BZGE4NGIzMmQtOTcwZi00Mjk4LWFhM2ItMDE0NWU4ZDU3ZjVkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Sci-Fi, Adventure, Family",
      rating: "7.8/10",
      watchSources: [
        { type: "dailymotion", id: "x9l0qlm" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "13",
      title: "Doraemon: Nobita and the Castle of the Undersea Devil",
      poster: "https://m.media-amazon.com/images/M/MV5BMGMyYzgyN2YtM2E3My00NzgwLWE1ZTMtODFlOTg0N2YyODgxXkEyXkFqcGc@._V1_QL75_UY281_CR5,0,190,281_.jpg",
      genre: "Adventure, Fantasy, Family",
      rating: "7.5/10",
      watchSources: [
        { type: "dailymotion", id: "x9lfwfq" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    },
    {
      id: "14",
      title: "Doraemon: Nobita and the Island of Miracles ~Animal Adventure",
      poster: "https://m.media-amazon.com/images/M/MV5BM2VkOTJlMmYtMDdiNC00YWI2LTkwY2QtMzAzZjAwZjA5OWI3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Adventure, Fantasy, Family",
      rating: "7.9/10",
      watchSources: [
        { type: "dailymotion", id: "x9koyam" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    },
    {
      id: "15",
      title: "Doraemon: Nobita's Great Adventure in the Antarctic",
      poster: "https://m.media-amazon.com/images/M/MV5BNDdmZTcwNDYtYTdkMS00MWNlLThkOTgtODU3NDQ2ZjZiZDJmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "7.6/10",
      watchSources: [
        { type: "dailymotion", id: "x9lj25c" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "16",
      title: "Doraemon: Nobita's Sky Utopia",
      poster: "https://m.media-amazon.com/images/M/MV5BNGU1ZGNkYzgtZTJhOC00ZjkyLTgzMWEtOTNiODMzODA3OTIwXkEyXkFqcGc@._V1_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "8.0/10",
      watchSources: [
        { type: "dailymotion", id: "x9jctji" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "17",
      title: "Doraemon: Nobita's Parallel Visit to the West",
      poster: "https://m.media-amazon.com/images/M/MV5BYjE2ZTY4NGMtOTljNC00Yjc4LWI2MTItMDA1ODk1MjNjNmYwXkEyXkFqcGc@._V1_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "8.2/10",
      watchSources: [
        { type: "dailymotion", id: "x9kzo14" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    },
    {
      id: "18",
      title: "Doraemon: Nobita and the Tin Labyrinth",
      poster: "https://m.media-amazon.com/images/M/MV5BZDFjMTYwM2YtZTJjZS00YTdlLWJmZWMtYmNmZGE4MGExNmM2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "7.5/10",
      watchSources: [
        { type: "dailymotion", id: "x9js9i2" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    },
    {
      id: "19",
      title: "Doraemon the Movie: Nobita's Spaceblazer",
      poster: "https://m.media-amazon.com/images/M/MV5BNmRjMzdjYjYtNmFiYy00OTMwLTg2NDctNjUyYWY0N2ZjNzEwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "8.0/10",
      watchSources: [
        { type: "dailymotion", id: "x94wgzy" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    },
    {
      id: "110",
      title: "Doraemon: Movie Nobita's Diary of the Creation of the World",
      poster: "https://m.media-amazon.com/images/M/MV5BMjRlYTE0Y2EtMjdmZi00OTIzLTk3NGItMjE2OGNkMDQ3NWE4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Adventure, Sci-Fi, Family",
      rating: "8.1/10",
      watchSources: [
        { type: "dailymotion", id: "x9j9li0" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: false
    }
  ],
  shinchan: [
    {
      id: "21",
      title: "Crayon Shin-chan: Burst Serving! Kung Fu Boys ~Ramen Rebellion~",
      poster: "https://m.media-amazon.com/images/M/MV5BYWRhODlhOTMtM2Y0MS00ODg2LWFkZWUtNWIxZjJkZTVmYjAxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "7.4/10",
      watchSources: [
        { type: "dailymotion", id: "x94nbwu" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "22",
      title: "Crayon Shin-chan: Honeymoon Hurricane ~The Lost Hiroshi~",
      poster: "https://m.media-amazon.com/images/M/MV5BMzA2MTgyMjgtYWE0Yy00OGQ1LWJlYzYtMzZjYjFhZTIxNjNhXkEyXkFqcGc@._V1_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "7.1/10",
      watchSources: [
        { type: "dailymotion", id: "x98dc5k" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "23",
      title: " Crayon Shinchan the Movie: Battle of Supernatural Powers ~Flying Sushi",
      poster: "https://krisworld.singaporeair.com/krisworlddigital/movies/posters/full/New-Dimension!-Crayon-Shinchan-the-Movie_CCE_146506_KA01.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "7.6/10",
      watchSources: [
        { type: "dailymotion", id: "x9jupou" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "24",
      title: "Crayon Shin-chan: Our Dinosaur Diary",
      poster: "https://m.media-amazon.com/images/M/MV5BMjIyMTlmOTctMWJlNy00NzViLThkZTctNmM2ODUyZGYwNTRjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.4/10",
      watchSources: [
        { type: "dailymotion", id: "x9js68o" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "25",
      title: "Crayon Shin-chan: Roar! Kasukabe Animal Kingdom",
      poster: "https://m.media-amazon.com/images/M/MV5BMjUxNzYzZjgtYzJlMS00YTBmLWE2ZjMtOGY5YzFlMjk1MWIyXkEyXkFqcGc@._V1_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.1/10",
      watchSources: [
        { type: "dailymotion", id: "x9jr9ic" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "26",
      title: "Crayon Shin-Chan: The Adult Empire Strikes Back",
      poster: "https://images.justwatch.com/poster/325342871/s718/crayon-shin-chan-storm-invoking-passion-the-adult-empire-strikes-back.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.9/10",
      watchSources: [
        { type: "dailymotion", id: "x9jez5u" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "27",
      title: "Crayon Shin-chan: The Battle of the Warring States",
      poster: "https://m.media-amazon.com/images/M/MV5BOWRjYzE1YmMtMzc2Ni00N2VmLTg4YmQtMmI1YWQ4M2E2NDZiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.4/10",
      watchSources: [
        { type: "dailymotion", id: "x9jrdxa" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "28",
      title: "Crayon Shin-chan: Explosion! The Hot Spring's Feel Good Final Battle",
      poster: "https://m.media-amazon.com/images/M/MV5BZTkxM2U1MDAtNGU3OC00M2M0LTg2OGMtM2IxY2RjNTcyYzlhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.7/10",
      watchSources: [
        { type: "dailymotion", id: "x9jeyw2" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "29",
      title: "Crayon Shin-chan: The Mystery of Tenkasu Academy",
      poster: "https://m.media-amazon.com/images/M/MV5BMDVjNDQzMWMtZWRlYy00ZmFmLWJhNzEtNjRjYzNkNGU0MTZlXkEyXkFqcGc@._V1_.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "8.8/10",
      watchSources: [
        { type: "dailymotion", id: "x9hsdvc" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    },
    {
      id: "210",
      title: "Crayon Shin-chan: The Legend Called Dance Amigo",
      poster: "https://images.justwatch.com/poster/320398717/s718/crayon-shin-chan-the-legend-called-dance-amigo.jpg",
      genre: "Comedy, Adventure, Family",
      rating: "9.1/10",
      watchSources: [
        { type: "dailymotion", id: "x9cqsuc" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/67890/view" }
      ],
      isNew: true
    }
  ],
  pokemon: [
    {
      id: "31",
      title: "Pokémon: Mewtwo Returns",
      poster: "https://m.media-amazon.com/images/M/MV5BMTM4NTAxMTQ4OV5BMl5BanBnXkFtZTYwNTM2MjI5._V1_FMjpg_UX1000_.jpg",
      genre: "Animation, Adventure, Fantasy",
      rating: "8.1/10",
      watchSources: [
        { type: "dailymotion", id: "x9cxr9a" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/24680/view" }
      ],
      isNew: false
    },
    {
      id: "32",
      title: "Pokémon—Zoroark: Master of Illusions",
      poster: "https://m.media-amazon.com/images/M/MV5BOTA2N2M5YjQtYzU1My00YzVmLWIxZjUtM2I4NDJiNWVjOWIzXkEyXkFqcGc@._V1_.jpg",
      genre: "Animation, Action, Adventure",
      rating: "7.9/10",
      watchSources: [
        { type: "dailymotion", id: "x853kk" }
      ],
      downloadSources: [
        { type: "drive", url: "https://drive.google.com/file/d/24680/view" }
      ],
      isNew: false
    }
  ]
};

export const getAllMovies = () => {
  return [
    ...moviesData.doraemon,
    ...moviesData.shinchan,
    ...moviesData.pokemon
  ];
};