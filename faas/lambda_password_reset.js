'use strict';

var AWS = require('aws-sdk');
const uuid = require('uuid');

 

module.exports.password_reset = (event, context, callback) => {
  const ttl = 900;
  var message = event.Records[0].Sns.Message;
  console.log('Message received from SNS:', message);

  var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  var params = {
    TableName: 'csye6225',
    Key: {
      'id': { S: message }
    }
  };

  // Call DynamoDB to read the item from the table
  ddb.getItem(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } 
    
    else {
      console.log(data);
      //Token already exists
      if (typeof data.Item === 'undefined') {
        console.log("Generating token for user: " + message);
        var createTime = Math.floor(new Date().getTime() / 1000);
        //ttl 30 seconds
        var expirationTime = createTime + ttl;
        var token = uuid.v4();
        var create_params = {
          TableName: 'csye6225',
          Item: {
            'id': { S: message },
            'CreateTime': { N: createTime.toString() },
            'ExpirationTime': { N: expirationTime.toString(10) },
            'token': {S: token}
          }
        };

        // Call DynamoDB to add the item to the table
        ddb.putItem(create_params, function (err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
            sendEmail(message, token);
          }
        });
      }
      else{
        console.log("Token already exists for user: " + message);
        var currentTime = Math.floor(new Date().getTime() / 1000);
        var time_elapsed = currentTime-(parseInt(data.Item.CreateTime.N));
        console.log(time_elapsed);
        if(time_elapsed > ttl){
          console.log("Token should have been expired. Generating token for user: " + message);
          var createTime = Math.floor(new Date().getTime() / 1000);
          var expirationTime = createTime + ttl;
          var token = uuid.v4();
          var create_params = {
            TableName: 'csye6225',
            Item: {
              'id': { S: message },
              'CreateTime': { N: createTime.toString() },
              'ExpirationTime': { N: expirationTime.toString(10) },
              'token': {S: token}
            }
          };
  
          // Call DynamoDB to add the item to the table
          ddb.putItem(create_params, function (err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Success", data);
              sendEmail(message, token);
            }
          });
        }
      }
    }
  });


  callback(null, "Success");
};

function sendEmail(toAddress, token){
  // Create sendEmail params 
  var link = `http://prod.jiachenyu.me/reset?email=${toAddress}&token=${token}`;
  var params = {
    Destination: { /* required */
      ToAddresses: [
        toAddress
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Text: {
        Charset: "UTF-8",
        Data: `You have requested to chanage your password. Click the link to enter your new password: ${link} `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Reset your password'
      }
      },
    Source: 'test@prod.jiachenyu.me', /* required */
  };

  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
      console.log("Message sent to "+toAddress);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
}