const
  handlebars = require('handlebars'),
  child_process = require('child_process')
;

module.exports = {
  line: line,
  exec: exec,
  json: json,
  bind: bind,
};


function line( command ) {
  command = handlebars.compile( command );
  command = command( this );

  return command; 
}

function exec( command, cb ) {
  command = line.call( this, command );

  console.log( "exec", command );

  child_process.exec ( 
    command, 
    {

    },
    function ( err, stdout, stderr ) {
      if ( err ) {
        return cb();
      } 

      cb( null, stdout, stderr );
    }
  );
} 

function json ( command, cb ) {
  exec.call( this, command, function ( err, stdout, stderr ) {
    try {
      var json = JSON.parse( stdout );
    } catch ( e ) {
      return cb( e );
    }

    cb( err, json, stderr );
  } );
}

function bind ( scope ) {
  return {
    line: line.bind( scope ),
    exec: exec.bind( scope ),
    json: json.bind( scope )
  }
}