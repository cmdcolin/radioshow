'use strict'

const AWS = require('aws-sdk')
const multipart = require('./multipart')

const s3 = new AWS.S3()
const DB = new AWS.DynamoDB.DocumentClient()

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300

// Main Lambda entry point
exports.handler = async event => {
  return await getUploadURL(event)
}

const getUploadURL = async function (event) {
  try {
    const data = multipart.parse(event)
    const { filename, pic, user, message, password } = data
    if (password !== process.env.Password) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Access denied' }),
      }
    }
    const timestamp = +Date.now()
    const Key = `${timestamp}-${filename}`
    const ThumbKey = `${timestamp}-thumb-${filename}`

    const uploadThumbnailURL = pic
      ? await s3.getSignedUrlPromise('putObject', {
          Bucket: process.env.UploadBucket,
          Key: ThumbKey,
          Expires: URL_EXPIRATION_SECONDS,
          ACL: 'public-read',
        })
      : undefined

    const uploadURL = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.UploadBucket,
      Key,
      Expires: URL_EXPIRATION_SECONDS,
      ACL: 'public-read',
    })

    await DB.put({
      TableName: 'filesRadio',
      Item: {
        timestamp,
        filename: Key,
        thumbnail: ThumbKey,
        message,
        user,
      },
    }).promise()

    return JSON.stringify({
      uploadURL,
      uploadPicURL,
      uploadThumbnailURL,
      Key,
    })
  } catch (e) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({ message: `${e}` }),
    }
    return response
  }
}
