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

  const [timestamp_DB, setTimestamp_DB] = useState([]);
  const [altitude_DB, setAltitude_DB] = useState([]);
  const [lux_DB, setLux_DB] = useState([]);
  const [pressure_DB, setPressure_DB] = useState([]);
  const [temperature_DB, setTemperature_DB] = useState([]);

  const [labels, setLabels] = useState([]);

  const [mqttClient, setMqttClient] = useState(null);
  
  const STORE_DB_DATA = "/storeDBData"
  const GET_DB_DATA = "/getDBData"

  useEffect(() => {
    // Connect to MQTT broker
   
    const client = mqtt.connect(process.env.REACT_APP_MQTT_BROKER);

    setMqttClient(client);

    client.on('connect', () => {
      setStatus("ATTIVA");
      getDBData();
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
      getDBData();
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
          timestamp: timestamp,
          temperature: temperature,
          altitude: altitude,
          pressure: pressure,
          lux: lux
        },
        {
          
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

  const getDBData = async () => {

    try {
         
      const response = await axios.post(GET_DB_DATA, 
        {
          
        },
        {
          
        }
      ); 
      
      
      setLabels(response.data.map(obj => obj.timestamp));
      setTimestamp_DB(response.data.map(obj => obj.timestamp));
      setAltitude_DB(response.data.map(obj => obj.altitude));
      setLux_DB(response.data.map(obj => obj.lux));
      setPressure_DB(response.data.map(obj => obj.pressure));
      setTemperature_DB(response.data.map(obj => obj.temperature));
    
    } catch (err) {
      if(!err?.response){
        console.error('Server non attivo!');
      }else if(err.response?.status === 500){
        console.error(err.response?.data);
      }else{
        console.error('Query di caricamento fallita!');
      }
    }    
  }

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
        data: temperature_DB,
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
        data: pressure_DB,
        backgroundColor: "#e5c710",
        borderColor: "#e5c710",
      }
    ]
  }

  const altitudeData = {
    labels,
    datasets: [
      {
        label: "Altitude",
        data: altitude_DB,
        backgroundColor: "#851515",
        borderColor: "#851515",
      }
    ]
  }

  const luxData = {
    labels,
    datasets: [
      {
        label: "Lux",
        data: lux_DB,
        backgroundColor: "#2d5f40",
        borderColor: "#2d5f40",
      }
    ]
  }
  
  const publishMessage = () => {
    if (mqttClient) {
      const message = JSON.stringify({
        message: "refresh_data"
      }); // Replace with the desired message
      mqttClient.publish('WEB_REQ', message);
    }
  };
  


  return (
    <section className='Progetto_SOD_WEB'>
      <div className='container'>
        <div className='header-div'>
          <h1>Progetto Sistemi Operativi Dedicati</h1>
          <h2>Castellucci Giacomo - Compagnoni Paolo - Silveri Nicola</h2>
        </div>
        <div className='real-time-div'>
          <div className='connection-monitor'>
            <p className='real-time-title'>Dati in tempo reale</p>
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
            <button onClick={publishMessage}>Richiedi nuovo dato</button>
          </div>
        </div>

        <div className='line-charts-div'>
          <div className='line-chart'>
            <Line options={options} data={tempData}/>
            <p>Ultimo aggiornamento: {timestamp_DB[timestamp_DB.length - 1]}</p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={pressureData}/>
            <p>Ultimo aggiornamento: {timestamp_DB[timestamp_DB.length - 1]}</p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={altitudeData}/>
            <p>Ultimo aggiornamento: {timestamp_DB[timestamp_DB.length - 1]}</p>
          </div>
          <div className='line-chart'>
            <Line options={options} data={luxData}/>
            <p>Ultimo aggiornamento: {timestamp_DB[timestamp_DB.length - 1]}</p>
          </div>
        </div>
      </div>
      
      
    </section>
  );
};

export default App;
