import React, { useEffect } from 'react';
import mqtt from 'mqtt/dist/mqtt.min.js';

export const MQTTComponent = () => {

  useEffect(() => {
    // Connect to MQTT broker
    const client = mqtt.connect('ws://192.168.1.8:1884');

    client.on('connect', () => {
      console.log("MQTT connected!");
    });

    // Subscribe to a topic
    client.subscribe('WEB_REQ');

    // Handle incoming messages
    client.on('message', (topic, message) => {
      console.log(`Received message on topic ${topic}: ${message.toString()}`);
      // Do something with the received message
    });

    // Unsubscribe and disconnect when component unmounts
    return () => {
      client.unsubscribe('your/topic');
      client.end();
    };
  }, []);


  return <div>MQTT Component</div>;
};
