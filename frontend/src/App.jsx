import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import mqtt from 'mqtt/dist/mqtt';
import axios from './api/axios';
import './style.css';

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
  const [status, setStatus] = useState("NON ATTIVA");
  
  const STORE_DB_DATA = "/storeDBData"

  useEffect(() => {
    // Connect to MQTT broker
    const client = mqtt.connect('ws://192.168.1.8:1884');

    client.on('connect', () => {
      setStatus("ATTIVA");
    });

    // Subscribe to a topic
    client.subscribe('WEB_REQ');

    // Handle incoming messages
    client.on('message', (topic, message) => {

      const { timestamp, temperature, altitude, pressure, lux } = JSON.parse(message.toString());
      setTimestamp(timestamp);
      setTemperature(temperature);
      setAltitude(altitude);
      setLux(lux);
      setPressure(pressure);

      storeDBData(timestamp, temperature, altitude, lux, pressure);
    });

    // Unsubscribe and disconnect when component unmounts
    return () => {
      client.unsubscribe('WEB_REQ');
      client.end();
      setStatus("NON ATTIVA");
    };
  }, []);

  const storeDBData = async (timestamp, temperature, altitude, lux, pressure) => {

    try {
         
      await axios.post(STORE_DB_DATA, 
        {
          timestamp,
          temperature,
          altitude,
          pressure,
          lux
        },
        {
          headers: { 'Content-Type': 'application/json'},
        }
      ); 

    } catch (err) {
      if(!err?.response){
        console.error('Server non attivo!');
      }else if(err.response?.status === 500){
        console.error(err.response?.data);
      }else{
        console.error('Query di inserimento fallita!');
      }
    }    
  }

  const labels = ["CIAO"];

  const options = {
    plugins: {
      legend: {
        position: "top",
      }
    }
  };

  const tempData = {
    labels,
    datasets: [
      {
        label: "Temperatura",
        data: [0, 1, 2],
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
      }
    ]
  }

  const pressureData = {
    labels,
    datasets: [
      {
        label: "Pressione",
        data: [0, 1, 2],
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
      }
    ]
  }

  const altitudeData = {
    labels,
    datasets: [
      {
        label: "Altitude",
        data: [0, 1, 2],
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
      }
    ]
  }

  const luxData = {
    labels,
    datasets: [
      {
        label: "Lux",
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
          <div className='connection-monitor'>
            <p className={status=== 'NON ATTIVA' ? 'disabled' : 'enabled' }>Connessione MQTT: {status}</p>
          </div>
          <div className='single-value-div'>
            <div className='single-value'>
              <h3>Temperatura</h3>
              <h4>{temperature} °C</h4>
            </div>
            <div className='single-value'>
              <h3>Altitudine</h3>
              <h4>{altitude} mt</h4>
            </div>
            <div className='single-value'>
              <h3>Pressione</h3>
              <h4>{pressure} atm</h4>
            </div>
            <div className='single-value'>
              <h3>Luminosità</h3>
              <h4>{lux} lux</h4>
            </div>
          </div>
          <div className='latest-update'>
            <p>Ultimo aggiornamento: {timestamp}</p>
          </div>
        </div>

        <div className='line-charts-div'>
          <div className='line-chart'>
            <Line options={options} data={tempData}/>
            <p>Ultimo aggiornamento: </p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={pressureData}/>
            <p>Ultimo aggiornamento: </p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={altitudeData}/>
            <p>Ultimo aggiornamento: </p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={luxData}/>
            <p>Ultimo aggiornamento: </p>
          </div>
        </div>
      </div>
      
      
    </section>
  );
};

export default App;
