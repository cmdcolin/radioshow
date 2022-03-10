'use strict'

const AWS = require('aws-sdk')
const multipart = require('./multipart')

const DB = new AWS.DynamoDB.DocumentClient()

// Main Lambda entry point
exports.handler = async event => {
  return await getUploadURL(event)
}

const getUploadURL = async function (event) {
  try {
    const data = multipart.parse(event)
    const { filename, user, message, password } = data
    if (password !== process.env.Password) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Access denied' }),
      }
    }
    const timestamp = +Date.now()
    const Key = `${timestamp}-${filename}`

    await DB.put({
      TableName: filesRadio,
      Key: {
        filename,
      },
      UpdateExpression: 'set user = :user, message=:message',
      ExpressionAttributeValues: {
        ':message': message,
        ':user': user,
      },
      ReturnValues: 'UPDATED_NEW',
    }).promise()

    return JSON.stringify({
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
