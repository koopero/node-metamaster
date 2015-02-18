module.exports = md5;

const
  crypto = require('crypto'),
  fs = require('fs')
;

function md5 ( cb ) {
  var
    scope = this,
    file = scope.get()
  ;


  if ( !file )
    return false;

  var readStream = fs.createReadStream ( file ),
    hasher = crypto.createHash( 'md5' );

  readStream.on('data', function ( d ) {
    hasher.update( d );
  });

  readStream.on('end', function () {
    scope['md5'] = hasher.digest('hex');
    cb();
  });
}
