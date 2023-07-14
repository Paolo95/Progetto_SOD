import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import mqtt from 'mqtt/dist/mqtt';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const App = () => {

  const [timestamp, setTimestamp] = useState("");
  const [altitude, setAltitude] = useState("");
  const [lux, setLux] = useState("");
  const [pressure, setPressure] = useState("");
  const [temperature, setTemperature] = useState("");

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
      const { timestamp, temperature, altitude, pressure, lux } = JSON.parse(message.toString());
      setTimestamp(timestamp);
      setTemperature(temperature);
      setAltitude(altitude);
      setLux(lux);
      setPressure(pressure);
    });

    // Unsubscribe and disconnect when component unmounts
    return () => {
      client.unsubscribe('your/topic');
      client.end();
    };
  }, []);


  const labels = ["CIAO"];

  const options = {};

  const data = {
    labels,
    datasets:[
      {
        label: "React",
        data: [0, 1, 2],
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
      }
    ]
  }

  return (
    <section className='Progetto_SOD_WEB'>
      <div className='container'>
        <div className='header-div'>
          <h1>Progetto Sistemi Operativi Dedicati</h1>
          <h2>Castellucci Giacomo - Compagnoni Paolo - Silveri Nicola</h2>
        </div>
        <div className='real-time-div'>
          <div className='single-value-div'>
            <h3>Temperatura</h3>
            <h4>{temperature} °C</h4>
          </div>
          <div className='single-value-div'>
            <h3>Altitudine</h3>
            <h4>{altitude} mt</h4>
          </div>
          <div className='single-value-div'>
            <h3>Pressione</h3>
            <h4>{pressure} atm</h4>
          </div>
          <div className='single-value-div'>
            <h3>Luminosità</h3>
            <h4>{lux} lux</h4>
          </div>
        </div>

        <div>
          <Line options={options} data={data}/>
        </div>
      </div>
      
      
    </section>
  );
};

export default App;
