const cheerio = require('cheerio');
const request = require('request');
const async = require('async');
const urls = require('./urls');

const general = {
  method: 'GET',
  path: '/{file*}',
  handler: {
    directory: {
      path: 'public'
    }
  }
};

let data = [];
const calls = urls.map((url) => (cb) => {
  request(url, (error, response, body) => {
    if (error) {
      // Uncomment the log if you wish to see sites encountering errors
      // console.error(`Error with ${url} - ${error}`);
      return cb();
    }
    const $ = cheerio.load(body),
    share = $('a[href*="github.com"]').map(function(i, el) {
      return $(this).attr('href');
    }).get().join(' ');
    if (share.length > 0) {
      data.push(share);
    };

    const twitter = $('a[href*="twitter.com"]').map(function(i, el) {
      return $(this).attr('href');
    }).get().join(' ');
    if (twitter.length > 0) {
      data.push(twitter);
    };
    cb();
  });
});

async.parallel(calls, function cb(err, results){
  if (err) {throw err;};
  console.log(`The following ${data.length} github and twitter sites were found from the array of urls provided:  ${data}`);
});

const home = {
  method: 'GET',
  path: '/',
  handler:(req, reply) => {
    req.headers['content-type'] === 'text' ? reply().code(400) :
    reply.view('index', {data});
  }
};

module.exports = [
  general,
  home
];
