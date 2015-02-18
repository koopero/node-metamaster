const
  COMMAND = 'ffprobe {{ file }} -v quiet -print_format json -show_format -show_streams'
;
module.exports = ffprobe;

function ffprobe ( cb ) {
  var 
    scope = this,
    file = scope.file
  ;

  if ( !file )
    return false;


  scope.command.json( COMMAND, function ( err, json ) {
    if ( json ) {
      scope['ffprobe'] = json;
    }
    cb();
  } );
}
/*

    commandJson( [
      { "tool": "ffprobe" },
      "-v quiet",
      "-print_format json", 
      "-show_format",
      "-show_streams",
      {input: true }
    ], function ( err, result ) {
      if ( err ) {
        cb( null, meta );
        return;
      }



      var hasVideo = false, 
        hasAudio = false;

      if ( result.streams ) {
        result.streams.forEach ( function ( stream ) {
          if ( stream['codec_type'] == 'video' && !hasVideo ) {
            hasVideo = true;
            meta['video-codec'] = stream["codec_name"];
            meta['image-width'] = stream['width'];
            meta['image-height'] = stream['height'];
            meta['video-fps'] = parseFrameRate( stream['avg_frame_rate'] ) || parseFrameRate( stream['r_frame_rate'] );
            meta['image-sample-aspect'] = parseRatio( stream['sample_aspect_ratio' ] );
          }

          //console.warn ( "STREAM", stream );

          if ( stream['codec_type'] == 'audio' && !hasAudio) {
            //console.warn( 'audio', stream );
            hasAudio = true;
            meta['audio-codec'] = stream['codec_name'];
            if ( stream['sample_rate'] )
              meta['audio-samplerate'] = parseInt( stream['sample_rate'] );

            meta['audio-channels'] = stream['channels'];
          }
        });
      }

      if ( result.format ) {
        var format = result.format;
        var duration = parseFloat( format['duration'] );

        if ( duration )
          meta['media-duration'] = duration;
      }

      if ( hasVideo ) {
        meta['type'] = 'video';
      } else if ( hasAudio ) {
        meta['type'] = 'audio';
      }


      cb( null, meta );
    })
*/