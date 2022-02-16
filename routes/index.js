var express = require('express');
var router = express.Router();

const request = require('request');

const apiKey = '17698155ad82a29e7d9f4393dff48cec';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'https://image.tmdb.org/t/p/w300';

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
})

/* GET home page. */
router.get('/', function(req, res, next) {
  // request.get takes 2 args
  // 1. the URL to http "get"
  // 2. the callback function to run when the http response is back. 
  // The callback function takes 3 args:
  // 1. error (if any)
  // 2. the http response object
  // 3. json/data that the server sent back
  request.get(nowPlayingUrl, (error, response, movieData) => {
    const parsedData = JSON.parse(movieData);
    res.render('index', {
      parsedData: parsedData.results
    });
  });
});

router.get('/movie/:id', (req, res, next) => {
  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;

  request.get(thisMovieUrl, (error, response, movieDetails) => {
    const parsedData = JSON.parse(movieDetails);
    const moviePosterUrl = imageBaseUrl + parsedData.poster_path;

    res.render('single-movie', {
      parsedData
    });
  });
});

router.post('/search', (req, res, next) => {
  // fetch the input from the user
  const userSearchTerm = encodeURI(req.body.movieSearch);
  const cat = req.body.cat;

  // compile the movie url to call the search API
  let movieUrl = `${apiBaseUrl}/search/${cat}?api_key=${apiKey}&query=${userSearchTerm}`;

  console.log(movieUrl);
  
  // call the search API and parse the results
  request.get(movieUrl, (error, response, results) => {
    const parsedData = JSON.parse(results);

    // the json is different when cat == "person", so we need to treat it
    if(cat == "person" && parsedData.results != null) {
      let moviesArray = [];
      // concatenate the movies from the various actors that the search might eventually return
      parsedData.results.forEach(person => {
        moviesArray.push(...person.known_for);
      });
      // modify parsedData.results to reflect the new array
      parsedData.results = moviesArray;
    }

    // pass on:
    // 1. array with all the results 
    // 2. query string to be displayed on the top
    res.render('index', {
      parsedData: parsedData.results,
      userSearchTerm: req.body.movieSearch,
    });
  });
});

module.exports = router;
