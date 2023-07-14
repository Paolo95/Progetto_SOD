const Sensor_data = require('../model/Sensor_data');
const mqtt = require('mqtt');


const handlegetMQTTData = async (req, res) => {
    
    // MQTT broker URL
    const brokerUrl = 'mqtt://192.168.1.8';

    // Create a client instance
    const client = mqtt.connect(brokerUrl);

    // Handle connection events
    client.on('connect', () => {
        console.log('Connected to MQTT broker');

    // Publish a message to a topic
        client.publish('mytopic', 'Hello, MQTT!');

    // Subscribe to a topic
        client.subscribe('WEB_REQ');
    });

    client.on('message', (topic, message) => {
        console.log('Received message:', message.toString());
    });

    client.on('error', (error) => {
        console.error('MQTT error:', error);
    });

    client.on('close', () => {
        console.log('Disconnected from MQTT broker');
    });

    // Disconnect from the MQTT broker
    process.on('SIGINT', () => {
        client.end(() => {
            console.log('Disconnected from MQTT broker');
            process.exit();
        });
    });

}

module.exports = { handlegetMQTTData };