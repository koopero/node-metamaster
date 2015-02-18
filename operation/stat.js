module.exports = stat;

stat.trivial = true;
stat.keys = [ 'file','type','subtype','size'];
stat.weight = -2;

const
  fs = require('fs')
;


function stat( cb ) {
  var
    scope = this,
    file = scope.file
  ;

  if ( !file )
    return false;

  var statFunc = fs.stat;

  statFunc( file, onStat );

  function onStat( err, stat ) {
    if ( stat ) {
      if ( stat.isFile() ) {
        scope.type = scope.type || 'file';
      } else {
        if ( stat.isDirectory() ) {
          scope.type = scope.type || 'inode';
          scope.subtype = scope.subtype || 'directory';
        }

        if ( stat.isSymbolicLink() ) {
          scope.type = 'inode';
          scope.subtype = 'symbolic-link';
        }
      }
    } else {
      scope.file = undefined;
    }

    cb( err, stat );
  }

}
