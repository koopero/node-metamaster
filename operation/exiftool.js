module.exports = exiftool;
exiftool.keys = ['dimensions','time'];


const
  COMMAND = 'exiftool {{ file }} -json -c "%+.8f"',
  /*
    A list of subtypes for which exiftool will report correct but useless
    types. For example, the correct mimetype for PSDs is
    application/vnd.adobe.photoshop, but for all intents and purposes, we
    should be treating it as an image.
  */
  IGNORE_TYPE_FOR_SUBTYPE = {
    'vnd.adobe.photoshop': true,
    'm2ts': true
  }
;


function exiftool ( cb ) {
  var scope = this;

  scope.command.json( COMMAND, function ( err, res ) {
    scope.log( 'exiftool', err, res );
    if ( err ) {
      cb( null, res );
      return;
    }

    if ( Array.isArray( res ) )
      res = res[0];
    //res = ExifToolExtract( res );

    cb( null, res );
  } );
}

/* Work-in-progress on exiftool templates. Commented lines
are fields we may want to process at some point. */
var ExifToolStd = {
  "ExifToolVersion": true,
  "FileType": true,
  "MIMEType": true,
  "Orientation": true, // "Rotate 90 CW", // From image file
  "Rotation": true, // 90 From video file
  //"XResolution": 300,
  //"YResolution": 300,
  //"ResolutionUnit": "inches",
  "ApertureValue":      true,
  "ExposureCompensation":   true,
  //"FocalLength":      true,
  //"ImageBoundary": "0 0 4608 3072",
  //"Timezone": "-08:00",
  //"DaylightSavings": "No",
  //"DateDisplayFormat": "D/M/Y",
  "ColorSpace": '../image-colorspace',

  /*
  "ImageWidth": '../image-width',
  "ImageHeight": '../image-height',

  "ExifImageWidth": '../image-width',
  "ExifImageHeight": '../image-height',
  */

  "BitsPerSample": '../image-bitdepth',//8,
  //"ColorComponents": 3,

/*
    GPSVersionID: '2.2.0.0',
    GPSLatitudeRef: 'North',
    GPSLongitudeRef: 'East',
    GPSAltitudeRef: 'Above Sea Level',
    GPSTimeStamp: '18:14:50',
    GPSSatellites: 0,
    GPSMapDatum: 'WGS-84',
    GPSDateStamp: '2008:05:08',
*/

    GPSAltitude: parseFloat,// '593.3 m Above Sea Level',
    GPSDateTime: Date,
    GPSLatitude: parseFloat,
    GPSLongitude: parseFloat,

  "Aperture": true,

  //"DateTimeCreated": "2013:11:15 14:04:30",

  //"LensSpec": "10-30mm f/3.5-5.6 VR [4]",

  //"SubSecCreateDate": "2013:11:15 14:04:30.24",
  //"SubSecDateTimeOriginal": "2013:11:15 14:04:30.24",
  //"SubSecModifyDate": "2013:11:15 14:04:30.24",

  "FOV": parseFloat
}

function ExifToolExtract ( src, template ) {
  if ( !template )
    template = ExifToolStd;

  if ( Array.isArray ( src ) )
    src = src[0];

  var meta = {},
    exif = meta['exif'] = {};

  for ( var k in src ) {
    var dst = exif,
      field = template[k],
      value = src[k];

    //if ( value === undefined )
    //  continue;

    if ( true || field === true ) {
      field = {

      }
    } else if ( 'function' == typeof field ) {
      field = {
        func: field
      }
    } else if ( 'string' == typeof field ) {
      field = {
        dest: field
      }
    } else if ( !field ) {
      continue;
    }

    field.dest = field.dest || k;

    if ( field.dest.indexOf('../') === 0 ) {
      dst = meta;
      field.dest = field.dest.substr( 3 );
    }

    if ( field.func )
      value = field.func( value );

    //console.warn( "EXIF FIELD", k, field );


    dst[ field.dest ] = value;
  }

  // Get image size. Exiftool as at least a dozen possible fields
  // representing image dimensions, and most of them have the potential
  // to be wrong, depending on the camera manufacturer.
  // ImageSize _seems_ to be the most reliable.

  if ( src['ImageSize'] ) {
    var match = /(\d+)x(\d+)/.exec( src['ImageSize'] );
    if ( match ) {
      meta['image-width'] = parseInt( match[1] );
      meta['image-height'] = parseInt( match[2] );
    }
  }



  // Get rotation

  var rotKey = 'image-rotation',
    mirrorKey = 'image-mirror';

  switch ( exif.Orientation || exif.Rotation ) {
    case 'Mirror horizontal':
      meta[mirrorKey] = 'horizontal';
    break;

    case 'Rotate 180':
      meta[rotKey] = 180;
    break;

    case 'Mirror vertical':
      meta[mirrorKey] = 'vertical';
    break;

    case 'Mirror horizontal and rotate 270 CW':
      meta[mirrorKey] = 'horizontal';
      meta[rotKey] = 270;

    break;

    case 90:
    case 'Rotate 90 CW':
      meta[rotKey] = 90;
    break;

    case 'Mirror horizontal and rotate 90 CW':
      meta[mirrorKey] = 'horizontal';
      meta[rotKey] = 90;
    break;

    case 270:
    case 'Rotate 270 CW':
      meta[rotKey] = 270;
    break;
  }

  // Type
  if ( exif.MIMEType ) {
    var parse = exif.MIMEType.split('/');

    if ( !IGNORE_TYPE_FOR_SUBTYPE[ parse[1] ] ) {
      meta.type = parse[0];
    }

    meta.subtype = parse[1];
  }

  return meta;
}
