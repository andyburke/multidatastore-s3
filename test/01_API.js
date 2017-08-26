'use strict';

const S3_Driver = require( '../index.js' );
const tape = require( 'tape-async' );

tape( 'API: imports properly', t => {
    t.ok( S3_Driver, 'module exports' );
    t.equal( S3_Driver && typeof S3_Driver.create, 'function', 'exports create()' );
    t.end();
} );

tape( 'API: API is correct on driver instance', t => {

    const s3_driver = S3_Driver.create();

    t.ok( s3_driver, 'got driver instance' );

    t.equal( s3_driver && typeof s3_driver.init, 'function', 'exports init' );
    t.equal( s3_driver && typeof s3_driver.put, 'function', 'exports put' );
    t.equal( s3_driver && typeof s3_driver.get, 'function', 'exports get' );
    t.equal( s3_driver && typeof s3_driver.del, 'function', 'exports del' );

    t.end();
} );