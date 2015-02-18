const
  _ = require('underscore'),
  imt = require('internet-media-type')
;

module.exports = httpHeaders;
httpHeaders.keys = [ 'mime', 'stat' ];


function httpHeaders() {
  var 
    scope = this,
    result = Object.create({
      toString: str
    })
  ;

  set('Content-Type', imt.format( scope, true ));

  if ( scope.stat ) {
    set('Content-Length', scope.stat.size );
    set('Last-Modified', scope.stat.mtime );
  }

  if ( scope.md5 ) {
    set('Content-MD5', scope.md5 );
  }


  return result;

  function set( key, value ) {
    if ( value !== undefined )
      result[key] = value;
  } 

  function str() {
    var
      pairs = _.pairs( result ),
      lines = _.map( pairs, function ( arr ) {
        return arr.join(': ');
      } )
    ;

    if ( lines.length )
      lines.push('');

    return lines.join('\n');
  }
}

