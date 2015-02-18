module.exports = dimensions;
dimensions.trivial = true;
dimensions.weight = 5;


function dimensions() {
  const
    get = this.get
  ;

  var result = {
    unrotated: {}
  };


  result.unrotated.width = get( [
    'exiftool.ExifImageWidth',
    'exiftool.ImageWidth'
  ]);

  result.unrotated.height = get( [
    'exiftool.ExifImageHeight',
    'exiftool.ImageHeight'
  ]);

	switch ( get([
    'exiftool.Orientation',
    'exittool.Rotation'
  ]) ) {
		case 'Mirror horizontal':
			result.mirror = 'horizontal';
		break;

		case 'Rotate 180':
			result.rotate = 180;
		break;

		case 'Mirror vertical':
			result.mirror = 'vertical';
		break;

		case 'Mirror horizontal and rotate 270 CW':
			result.mirror = 'horizontal';
			result.rotate = 270;
		break;

		case 90:
		case 'Rotate 90 CW':
			result.rotate = 90;
		break;

		case 'Mirror horizontal and rotate 90 CW':
			result.mirror = 'horizontal';
			result.rotate = 90;
		break;

		case 270:
		case 'Rotate 270 CW':
			result.rotate = 270;
		break;
	}


  switch ( result.rotate ) {
    case 90:
    case 270:
      result.width = result.width || result.unrotated.height;
      result.height = result.height || result.unrotated.width;
    break;

    default:
      result.width = result.width || result.unrotated.width;
      result.height = result.height || result.unrotated.height;
  };

  if ( !result.width && !result.height )
    return false;


  return result;




}
