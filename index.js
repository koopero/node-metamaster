module.exports = MetaMaster;

const
  _ = require('underscore'),
  async = require('async'),
  command = require('./lib/command'),
  path = require('path'),
  requireDir = require( './lib/requireDir')
;

MetaMaster.ops = requireDir('operation');
MetaMaster.formats = requireDir('format');

var defaultOperations = _.keys( MetaMaster.ops );

function MetaMaster( file, options, cb ) {
  var opt = {};

  (function parseArgs( args ) {
    var
      i = 0,
      k = args.length - 1
    ;

    //console.log( args );

    if ( 'string' == typeof args[i] ) {
      opt.file = args[i];
      i++;
    }

    if ( 'function' == typeof args[k] ) {
      cb = args[k];
      k--;
    }

    for ( ; i<=k; i ++ ) {
      opt = _.extend( opt, args[i] );
    }

  })( arguments );

  function resolveKeys( keys ) {
    if ( 'string' == typeof keys ) {
      return keys.split(',');
    }
  }

  opt.keys = resolveKeys( opt.keys );

  //console.log( 'opt', opt );

  var
    proto = {},
    scope = Object.create( proto )
  ;


  proto.log = log;
  proto.get = walkObjects.bind( scope );

  proto.command = command.bind( scope );

  log( "MetaMaster.ops", MetaMaster.ops )


  //console.log( scope.command );
  //exit;

  var
    format = resolveFormat( opt.format ) || defaultFormat,
    keys = opt.keys,
    operations = _.union( defaultOperations )
  ;

  if ( format.operations ) {
    operations = _.union( operations, format.operations );
  }

  operations = operations.map( resolveOp );
  operations = _.sortBy( operations, function ( op ) {
    return parseFloat( op.weight ) || 0;
  } );



  if ( format.keys ) {
    keys = _.union( keys, format.keys );
  }


  scope.file = opt.file;




  async.mapSeries( operations, runOperation, runFormat )




  function resolveFormat( format ) {
    if ( 'string' == typeof format ) {
      format = firstWithKey( format, MetaMaster.formats );
    }

    return format;
  }

  function runOperation( op, cb ) {
    if ( !op )
      return onOpComplete();

    var opname = op.name || '<anon>';
    var opkeys = [ opname ];

    if ( op.keys )
      opkeys = _.union( opkeys, op.keys );

    var need = _.intersection( keys, opkeys );

    log( 'op?', opname, keys, opkeys, need );
    if ( !need.length && !op.trivial ) {
      return onOpComplete();
    }


    log( 'op!', opname, keys, opkeys, need );

    var result = op.call( scope, onOpComplete );


    if ( 'object' == typeof result ) {

      return onOpComplete( null, result );
    }
    // If op returned boolean, it's a signal that
    // it return syncronously, and we needn't
    // wait for a callback;
    else if ( 'boolean' == typeof result ) {
      return onOpComplete();
    }

    function onOpComplete( err, result ) {
      if ( 'object' == typeof result  ) {
        scope[opname] = _.defaults( result, scope[opname] );
        //scope[opname] = result;
      } else if ( err ) {
        scope[opname] = result || null;
      }

      cb();
    }


  }

  function resolveOp( op ) {
    if ( 'string' == typeof op ) {
      var name = op;
      op = firstWithKey( name, MetaMaster.ops );

      if ( op ) {
        op.name = op.name || name;
      }
    }

    return op;
  }

  function runFormat( err ) {
    var result = format.call( scope, opt );

    cb( err, result );
  }

  function log() {
    var logFunc = opt.log;
    if ( logFunc === true )
      logFunc = console.log;

    if ( logFunc )
      logFunc.apply( this, arguments );
  }
}

function defaultFormat( err ) {
  this.toString = JSON.stringify.bind( JSON, this, null, 2 );
  return this;
}


function firstWithKey( key ) {
  for ( var i = 1; i < arguments.length; i++ ) {
    var ob = arguments[i];
    if ( _.has( ob, key ) )
      return ob[key];
  }
}

function walkObjects( ) {
  var args = _.flatten( arguments );
  ARGS: for ( var i = 0; i < args.length; i ++ ) {
    var
      path = args[i].split('.'),
      ob = this
    ;

    while ( path.length > 1 ) {
      var key = path.shift();
      ob = ob[key];
      if ( ob === undefined )
        continue ARGS;
    }

    var
      key = path[0],
      val = ob[key]
    ;

    if ( val !== undefined )
      return val;
  }
}
