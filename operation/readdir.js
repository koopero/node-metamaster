module.exports = readdir;

readdir.keys = [ 'file','type','subtype','size'];


const
  fs = require('fs')
;


function readdir( cb ) {
  var
    scope = this,
    file = scope.file,
    opt = {
      noHidden: true
    }
  ;

  if ( !file )
    return false;


  fs.readdir( file, function( err, listing ) {
    if ( listing && opt.noHidden )
      listing = listing.filter( function( str ) {
        return str.substr(0,1) !== '.';
      });

    cb( err, listing );
  } );
}
