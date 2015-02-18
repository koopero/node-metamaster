module.exports = path;

path.trivial = true;
path.weight = -3;

const
  p = require('path')
;

function path ( cb ) {
  var file = this.file || this.path.name;

  if ( !file )
    return false;


  file = p.resolve( file );

  var extname = p.extname( file );

  return {
    fullname: file,
    dirname: p.dirname( file ),
    extname: extname,
    basename: p.basename( file, extname ),
    filename: p.basename( file )
  };
}
