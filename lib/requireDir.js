const
  fs = require('fs'),
  path = require('path')
;

module.exports = requireDir;

function requireDir( dir ) {
  var 
    result = {}
  ;

  dir = path.resolve( __dirname, '../', dir );
  
  var
    files = fs.readdirSync( dir )
  ;

  files.forEach( function ( file ) {
    var 
      ext = path.extname( file ),
      key = path.basename( file, ext ),
      value
    ;

    file = path.resolve( dir, file );

    //try {
      value = require( file );
      result[key] = value;
    //} catch (e) {};
  });


  return result;
}