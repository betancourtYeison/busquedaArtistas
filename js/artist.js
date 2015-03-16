
// Gobals

var LAST_FM_API_KEY = '42f75f939105d2110d6a0daf27db431c';
var LAST_FM_API_URL = 'http://ws.audioscrobbler.com/2.0/';
var COUNTRY = '';

// AJAX functions

function getArtist(name, callback) {
  $.ajax({
    data: {
      artist: name,
      api_key: LAST_FM_API_KEY,
      format: 'json',
      method: 'artist.getinfo'
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getArtistAlbums(name, callback) {
  $.ajax({
    data: {
      artist: name,
      api_key: LAST_FM_API_KEY,
      format: 'json',
      method: 'artist.gettopalbums'
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getAlbumInfo(artist, album, callback) {
  $.ajax({
    data: {
      artist: artist,
      album: album,
      api_key: LAST_FM_API_KEY,
      format: 'json',
      method: 'album.getinfo'
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getTopArtistsForCountry(country, callback) {
  COUNTRY = country;
  $.ajax({
    data: {
      country: country,
      api_key: LAST_FM_API_KEY,
      format: 'json',
      method: 'geo.gettopartists'
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getTopArtistsForMyCountry(callback) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    $.get('http://ws.geonames.org/countryCode', {
      type: "JSON",
      username: 'Yeison04',
      lat: latitude,
      lng: longitude
    }, function(data) {
      COUNTRY = data.countryName;
      getTopArtistsForCountry(data.countryName, callback);
    });
  });
}

// Template functions

function artistTemplate(artist) {
  var html = '';
  html += '<h2>' + artist.name + '<button class="btn btn-info get-albums pull-right">Albums</button></h2>';
  html += '<figure><img src="' + artist.image[artist.image.length-1]['#text'] + '" class="img-responsive img-thumbnail"></figure>';
  html += '<p class="bio">' + artist.bio.summary + '</p>';  
  return html;
}

function albumTemplate(album) {
  var html = '';
  html += '<div class="album album-onload" data-album="' + album.name + '" data-artist="' + album.artist.name + '">';
  html += '<figure>';
  html += '<h3>' + album.name + '</h3>';
  html += '<img src="' + album.image[album.image.length-1]['#text'] + '" class="img-responsive img-thumbnail">';
  html += '</figure>';
  html += '</div>';
  return html;
}

function albumsListTemplate(albums) {
  var html = '';
  html += '<h2>'+albums.topalbums.album[0].artist.name+'</h2>';  

  for (var i = 0; i < albums.topalbums.album.length; i++) {
    var album = albums.topalbums.album[i];
    html += albumTemplate(album);
  }

  return html;
}

function albumTrackTemplate(track) {
  var html = '';

  html += '<li>'; 
  html += '<a href="http://www.youtube.com/results?search_query=';
  html += (track.artist.name + ' ' + track.name).replace(new RegExp('\\s', 'g'), '+');
  html += '" target="_blank">' + track.name + '</a></li>';

  return html;
}

function albumDetailTemplate(album) {
  var html = '';
  html += '<div class="album-detail album-detail-onload">';
  html += '<figure>';
  html += '<h3>' + album.name + '</h3>';
  html += '<h4>' + album.artist + '</h4>';
  html += '<img src="' + album.image[album.image.length-1]['#text'] + '" class="img-responsive img-thumbnail">';
  html += '</figure>';
  html += '<ol>';

  for (var i = 0; i < album.tracks.track.length; i++) {
    var track = album.tracks.track[i];
    html += albumTrackTemplate(track);
  }

  html += '</ol>';
  html += '</div>';
  return html;
}

function albumTopArtistsForCountryTemplate(topartists) {
  var html = '';
  html += '<div class="album album-onload" data-artist="' + topartists.name + '">';
  html += '<figure>';
  html += '<h3>' + topartists.name + '</h3>';
  html += '<img src="' + topartists.image[topartists.image.length-1]['#text'] + '" class="img-responsive img-thumbnail">';
  html += '</figure>';
  html += '</div>';
  return html;
}

function topArtistsForCountryTemplate(topartists) {
   var html = '';
   html += '<h2> Top: '+ COUNTRY +'</h2>';

  for (var i = 0; i < topartists.artist.length; i++) {
    var albumTop = topartists.artist[i];
    html += albumTopArtistsForCountryTemplate(albumTop);
  }

  return html;
}


// Eventos

var $artistInput = $('#artista');
var $countryInput = $('#ciudad');
var $buttonArtist = $('#botonArtista');
var $buttonContry = $('#botonCiudad');
var $buttonMyContry = $('#botonMiCiudad');
var $buttonBack = $('#botonVolver');
var $resultOutArtist = $('#contentArtist');
var $resultOutCountry = $('#contentCountry');
var $decision = 0;

$artistInput.on('keyup', onKeyUpArtist);
$countryInput.on('keyup', onKeyUpCountry);
$buttonArtist.on('click', onSubmitArtist);
$buttonContry.on('click', onSubmitCountry);
$buttonMyContry.on('click', onSubmitMyCountry);
$buttonBack.on('click', function(){
  if($decision==0){
    onSubmitArtist()
  }else if($decision==1){
    getArtistAlbums($artistInput.val(), fillAlbumsInfo);
  }
});

function onKeyUpArtist(evt) {
  if(evt.keyCode == 13) { // Enter
    onSubmitArtist();
  }
}

function onKeyUpCountry(evt) {
  if(evt.keyCode == 13) { // Enter
    onSubmitCountry();
  }
}

function onSubmitArtist() {
  getArtist($artistInput.val(), fillArtistInfo);
  $resultOutArtist.html( '<p class="loading">cargando...</p>' );
}

function onSubmitCountry() {
  getTopArtistsForCountry($countryInput.val(), fillTopArtistsForCountryInfo);
  $resultOutCountry.html( '<p class="loading">cargando...</p>' );
}

function onSubmitMyCountry() {
  getTopArtistsForMyCountry(fillTopArtistsForCountryInfo);
  $resultOutCountry.html( '<p class="loading">cargando...</p>' );
}

function onErrorArtist() {
  $resultOutArtist.html( '<p class="error">Error... :(</p>' );
}

function onErrorCountry() {
  $resultOutCountry.html( '<p class="error">Error... :(</p>' );
}

function fillArtistInfo(jsonData) {
  if (jsonData.error) {
    return onErrorArtist();
  }

  var html = artistTemplate(jsonData.artist);
  $resultOutArtist.html( html );

  $('.get-albums').on('click', function() {
    getArtistAlbums(jsonData.artist.name, fillAlbumsInfo);
  });  
  $buttonBack.attr('disabled',true);
}

function fillAlbumsInfo(jsonData) { 
  if (jsonData.error) {
    return onErrorArtist();
  }

  $decision = 0;
  var html = albumsListTemplate(jsonData);
  $resultOutArtist.html( html );
  $resultOutArtist.find('.album-onload').removeClass('album-onload');

  $('.album').on('click', function() {
    var album = $(this).data('album');
    var artist = $(this).data('artist');
    getAlbumInfo(artist, album, fillAlbumDetailInfo);
  });
  $buttonBack.attr('disabled',false);
}

function fillAlbumDetailInfo(jsonData) {
  if (jsonData.error) {
    return onErrorArtist();
  }

  $decision = 1;
  var html = albumDetailTemplate(jsonData.album);
  $resultOutArtist.html( html );
  $resultOutArtist.find('.album-detail-onload').removeClass('album-detail-onload');
}

function fillTopArtistsForCountryInfo(jsonData) {  
  if (jsonData.error) {
    return onErrorCountry();
  }

  var html = topArtistsForCountryTemplate(jsonData.topartists);
  $resultOutCountry.html( html );
  $resultOutCountry.find('.album-onload').removeClass('album-onload');
}