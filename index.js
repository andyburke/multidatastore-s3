'use strict';

const AWS = require( 'aws-sdk' );
const extend = require( 'extend' );

const S3_Driver = {
    init: async function() {
        if ( !this.options.bucket ) {
            throw new Error( 'Must specify a bucket!' );
        }

        this.s3 = new AWS.S3( this.options.s3 );

        let bucket_exists = false;

        try {
            bucket_exists = await this.s3.headBucket( {
                Bucket: this.options.bucket
            } ).promise();
        }
        catch( ex ) {
            bucket_exists = false;
        }

        if ( bucket_exists ) {
            return;
        }

        await this.s3.createBucket( {
            Bucket: this.options.bucket,
            CreateBucketConfiguration: {
                LocationConstraint: this.options.region
            }
        } ).promise();

        await this.s3.waitFor( 'bucketExists', {
            Bucket: this.options.bucket
        } ).promise();
    },

    put: async function( object ) {
        const path = this.options.get_object_path( object );
        if ( !path ) {
            throw new Error( 'invalid object path' );
        }

        const data = JSON.stringify( object, null, 4 );

        await this.options.s3.upload( {
            Bucket: this.options.bucket,
            ContentType: 'application/json',
            Key: path,
            Body: data
        } ).promise();
    },

    get: async function( id ) {
        const path = this.options.get_id_path( id );
        if ( !path ) {
            throw new Error( 'invalid id path' );
        }

        const response = await this.options.s3.getObject( {
            Bucket: this.options.bucket,
            Key: path
        } ).promise();

        const object = JSON.parse( response && response.body );

        return object;
    },

    del: async function( id ) {
        const path = this.options.get_id_path( id );
        if ( !path ) {
            throw new Error( 'invalid id path' );
        }

        await this.options.s3.deleteObject( {
            Bucket: this.options.bucket,
            Key: path
        } ).promise();
    }
};

module.exports = {
    create: function( _options ) {
        const options = extend( {
            readable: true,
            id_field: 'id',
            s3: {
                apiVersion: '2006-03-01',
                region: 'us-west-2'
            },
            bucket: null,
            get_object_path: object => {
                return `/${ object[ this.options.id_field ] }.json`;
            },
            get_id_path: id => {
                return `/${ id }.json`;
            }
        }, _options );

        const instance = Object.assign( {}, S3_Driver );
        instance.options = options;

        return instance;
    }
};