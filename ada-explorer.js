const request = require('request');

module.exports = (context, cb) => {
  const url = `https://cardanoexplorer.com/api/addresses/summary/${context.query.address}`;
  request(url, (error, response) => {
    if (!error && response.statusCode == 200) {
      cb(null, JSON.parse(response.body));
    }else{
      cb(null, error);
    }
  });
}
