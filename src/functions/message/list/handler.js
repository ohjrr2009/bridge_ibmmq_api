"use strict";

const MQConnection = require("bridge_ibmmq/MQConnection")
const MQQueueMessagingManager = require("bridge_ibmmq/MQQueueMessagingManager")
const { httpResponse } = require('../../../util/httpUtils')

module.exports.handler = async function (event, context) {
  console.log(`Received event: ${JSON.stringify(event)}`)
  const { correlationId, messageId, limit } = event.queryStringParameters || {}
  const csrfToken = event.headers["ibm-mq-rest-csrf-token"]
  const queueManagerName = event.pathParameters.qmgrName
  const queueName = event.pathParameters.qName
  const mqConn = getConnectionData(queueManagerName)
  
  try {   
    const { channelName, hostIp, hostPort, userId } = mqConn
    console.log(`Connecting in IBM MQ with data: ${JSON.stringify({ channelName, hostIp, hostPort, userId, queueManagerName })}`)
    const conn = await mqConn.connect()
    const qmm = await new MQQueueMessagingManager['default'](conn, queueManagerName, queueName)
    
    const messageList = await qmm.getMessageList(correlationId, messageId, limit, csrfToken)
    console.log(`Received message list: ${messageList}`)
    return httpResponse(200, messageList, context)

  } catch (error) {
    console.error(`An error occured: ${error}`)
    return httpResponse(500, error.message, context)

  } finally {
    await mqConn.disconnect()
  }
}

function getConnectionData(queueManagerName) {
  return new MQConnection['default'](
    process.env.MQ_HOST,
    process.env.MQ_PORT,
    queueManagerName,
    process.env.MQ_CH,
    process.env.MQ_USR,
    process.env.MQ_PWD
  )
}