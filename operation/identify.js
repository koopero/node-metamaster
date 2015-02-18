const
  COMMAND = 'identify -format {{{ identify.format }}} {{ file }}',
  FIELD_DELIM = '|',
  DEFAULT_FIELDS = {
    'b': false,  // file size
    'c': false,  // comment
    'd': false,  // directory
    'e': false,  // filename extension
    'f': false,  // filename
    'g': false,  // page geometry
    'h': Number,  // current image height in pixels
    'i': false,  // input filename
    'k': false,  // number of unique colors
    'l': String,  // label
    'm': false,  // magick
    'n': parseInt,  // number of scenes
    'o': false,  // output filename
    'p': parseInt,  // page number
    'q': parseInt,  // quantum depth
    'r': String,  // image class and colorspace
    's': parseInt,  // scene number
    'w': Number,  // current width in pixels
    'x': Number,  // x resolution
    'y': Number,  // y resolution
    'z': parseInt,  // image depth
    'A': MagickBoolean,  // image alpha channel
    'C': String,  // image compression type
    'D': String,  // image dispose method
    'H': parseInt,  // page height
    'W': parseInt,  // page width
    'X': parseFloat,  // page x offset
    'Y': parseFloat,  // page y offset
    'Q': parseFloat,  // image compression quality
    'T': parseFloat,  // image delay
    '@': false,  // bounding box
  }
;

const
  _ = require('underscore')
;

module.exports = identify;

identify.keys = [];

function identify( cb ) {
  var scope = this;

  if ( !scope.file )
    return false;

  scope.identify = {};

  var fields = {};
  _.extend( fields, DEFAULT_FIELDS );

  var fieldKeys = _.map( fields, function ( v, k ) { if ( v ) { return k; } } );
  fieldKeys = _.filter( fieldKeys );

  //fieldKeys = _.filter( fieldKeys,  );

  console.log( fieldKeys );

  var fieldPlaceholders = _.filter( _.map( fieldKeys, function ( v, k ) {
    return '%'+v;
  }));

  


  var formatStr = fieldPlaceholders.join( FIELD_DELIM );
  formatStr = '"'+formatStr+'\\n"';

  scope.identify.format = formatStr;


  return scope.command.exec( COMMAND, onIdentify );

  function onIdentify( err, stdout, stderr ) {
      var
        parse = stdout.split('\n'),
  			ret = {
          pages: []          
        },
  			numPages = 0;

  		parse.map( function ( line ) {
  			if ( !line )
  				return;

  			numPages ++;
  			line = line.split( FIELD_DELIM );

  			var page = {},
  				i = 0;

        _.each( fieldKeys, function ( key, ind ) {
          var 
            format = fields[key],
            value = line[ind]
          ;
          if ( !format )
            return;

          value = format( value );
          if ( value || value === 0 )
            page[key] = value;
        });

        page.r = page.x + page.w;
  			page.b = page.y + page.h;

  			if ( ret.x === undefined ) {
  				ret.x = page.x;
  				ret.y = page.y;
  				ret.r = page.r;
  				ret.b = page.b;
  			} else {
  				ret.x = Math.min( page.x, ret.x );
  				ret.y = Math.min( page.y, ret.y );
  				ret.r = Math.max( page.r, ret.r );
  				ret.b = Math.max( page.b, ret.b );
  			}

        ret.pages.push( page );
  		} );

  		if ( ret.x || ret.y ) {
  			ret['image-offset'] = ret.x + ',' + ret.y;
  		}
  		ret['image-width'] = ret.r - ret.x;
  		ret['image-height'] = ret.b - ret.y;

  		delete ret.x;
  		delete ret.y;
  		delete ret.r;
  		delete ret.b;

  		if ( !ret['image-transparent'] )
  			delete ret['image-transparent'];

  		if ( ret.xres && ret.xres == ret.yres )
  			ret['image-resolution'] = ret.xres;

  		delete ret.xres;
  		delete ret.yres;

  		if ( numPages > 1 ) {
  			if ( meta['subtype'] == 'gif' )
  				ret['animation-frames'] = numPages;
  			else
  				ret['image-layers'] = numPages;
  		}

      cb( null, ret );
  }
}

function MagickBoolean ( str ) {
  return str == 'True';
}
