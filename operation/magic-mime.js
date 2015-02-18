const
  /*
    libmagic calls will report files as application/octet-stream, even when
    it actually recognizes the file. Here are prefixes of such files and 
    their actual mime types.

    This list will certainly grow.
  */
  MAGIC_TO_MIME = {
    'Targa image data': { 'type': 'image', 'subtype': 'x-targa' },
    'SGI image data': { 'type': 'image', 'subtype': 'x-rgb' },
    'Sun raster image data': { type: 'image', subtype: 'sun-raster' },
    'XWD X Window Dump image data': { type: 'image', subtype: 'x-xwindowdump'},
    'MPEG transport stream data': { type: 'video', subtype: 'MP2T'} 
  },

  JUNK_TYPES = [
    'application',
    'file'
  ]
;


const 
  _ = require('underscore'),
  mmmagic = require('mmmagic'),
  imt = require('internet-media-type')
;

module.exports = magicMime;

magicMime.keys = [ 'type', 'subtype' ];

function magicMime( cb ) {
  var 
    scope = this,
    file = scope.file
  ;

  if ( !file )
    return false;

  var magic = new mmmagic.Magic( mmmagic.MAGIC_MIME_TYPE );

  magic.detectFile( file, function ( err, mimeType ) {
    if ( mimeType ) {
      var match = imt.parse( mimeType );

      if ( !scope.type || JUNK_TYPES.indexOf( scope.type ) != -1 )
        scope.type = match.type;

      if ( match.subtype )
        scope.subtype = match.subtype;

      scope['magic-mime'] = mimeType;
    }
    cb();
  } );
}