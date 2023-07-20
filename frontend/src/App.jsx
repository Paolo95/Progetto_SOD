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

// Registra i componenti di Chart.js
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

  // status è la variabile che memorizza lo stato attuale della connessione. All'avvio è 'NON ATTIVA'
  const [status, setStatus] = useState("NON ATTIVA");

  // Variabili per visualizzare lo storico dei dati del BMP280
  const [timestamp_DB_BMP, setTimestamp_DB_BMP] = useState([]);
  const [altitude_DB, setAltitude_DB] = useState([]);
  const [pressure_DB, setPressure_DB] = useState([]);
  const [temperature_DB, setTemperature_DB] = useState([]);
  const [labels_BMP, setLabels_BMP] = useState([]);

  // Variabili per visualizzare i dati in tempo reale del BMP280
  const [timestamp_RT_BMP, setTimestamp_RT_BMP] = useState([]);
  const [altitude_RT, setAltitude_RT] = useState([]);
  const [pressure_RT, setPressure_RT] = useState([]);
  const [temperature_RT, setTemperature_RT] = useState([]);

  // Variabili per visualizzare lo storico dei dati del BH1750
  const [timestamp_DB_BH, setTimestamp_DB_BH] = useState([]);
  const [lux_DB, setLux_DB] = useState([]);
  const [labels_BH, setLabels_BH] = useState([]);

  // Variabili per visualizzare i dati in tempo reale del BH1750
  const [timestamp_RT_BH, setTimestamp_RT_BH] = useState([]);
  const [lux_RT, setLux_RT] = useState([]);

  // Variabili per visualizzare L'RTC
  const [timestamp_RTC, setRTCTimestamp] = useState();
  const [latestRTCTimestamp, setLatestRTCTimestamp] = useState();

  // mqttClient memorizza l'oggetto che contiene la connessione all'MQTT
  const [mqttClient, setMqttClient] = useState(null);

  // E' la variabile che contiene il messaggio "RTC SYNC SUCCESSFULL" quando la sincronizzazione è stata effettuata
  const [message, setMessage] = useState('');

  // showMEssage regola la visualizzazione del messaggio "RTC SYNC SUCCESSFULL"
  const [showMessage, setShowMessage] = useState(false);
  
  // Costanti per le route delle API
  const STORE_BMP_DATA = "/storeBMPData"
  const STORE_BH_DATA = "/storeBHData"

  const GET_BMP_DATA = "/getBMPData"
  const GET_BH_DATA = "/getBHData"

  // useEffect per connettersi al broker MQTT e sottoscriversi ai topic

  useEffect(() => {

    // Connessione al broker MQTT
    
    const client = mqtt.connect(process.env.REACT_APP_MQTT_BROKER);

    setMqttClient(client);

    client.on('connect', () => {
      setStatus("ATTIVA");
      getBMPData();
      getBHData();
    });

    // Sottoscrizione ai vari topic
    client.subscribe('BMP280');
    client.subscribe('BH1750');
    client.subscribe('RTC');

    // Gestione dei messaggi in arrivo nei topic
    client.on('message', (topic, message) => {

      if(message.toString() === 'RTC sync successfull!'){

          setMessage(message.toString());
          showMessageFor10Seconds(message.toString());

      }else{

        const { timestamp, temperature, altitude, pressure, lux } = JSON.parse(message.toString());
      
        // Se è presente una stringa 'error' nel valore di un sensore, imposta i valori dei sensori visualizzati in real time
        // a -1 e i timestamp alla data corrente

        if ( (timestamp === 'error' || temperature === 'error' || altitude === 'error' || pressure === 'error' ) && (topic === 'BMP280' ) ) {
  
          setTimestamp_RT_BMP(new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }));
  
          setTemperature_RT("-1");
          setAltitude_RT("-1");
          setPressure_RT("-1");        
  
        }else if (( timestamp === 'error' || lux === 'error' ) && ( topic === 'BH1750' )){
  
          setTimestamp_RT_BH(new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }));

          setLux_RT("-1");

        }else if(( timestamp === 'error' ) && ( topic === 'RTC' ) ){
          
          setLatestRTCTimestamp("Error");
          setRTCTimestamp();

        }else if(( timestamp !== 'error' || temperature !== 'error' || altitude !== 'error' || pressure !== 'error' ) && topic === 'BMP280' ){

          const { timestamp, temperature, altitude, pressure } = JSON.parse(message.toString());
          storeBMPData(timestamp, temperature, altitude, pressure);
          setTimestamp_RT_BMP(timestamp);
          setTemperature_RT(temperature);
          setAltitude_RT(altitude);
          setPressure_RT(pressure);

        } else if(( timestamp !== 'error' || lux !== 'error' ) && topic === 'BH1750' ){

          const { timestamp, lux } = JSON.parse(message.toString());
          storeBHData(timestamp, lux);
          setTimestamp_RT_BH(timestamp);
          setLux_RT(lux);

        } else if(( timestamp !== 'error'  ) && topic === 'RTC' ){
          
            const { timestamp } = JSON.parse(message.toString());
            setRTCTimestamp(new Date(timestamp));
            setLatestRTCTimestamp(timestamp);
        }
            
      }

    });

    // Disconnessione quando il componente si smonta
    return () => {
      client.end();
      setStatus("NON ATTIVA");
    };

    // eslint-disable-next-line
  }, []);

  
  useEffect(() => {

    // Aggiorna il timestamp RTC ogni secondo
    if ( timestamp_RTC ) {
      
      const interval = setInterval(() => {
        setRTCTimestamp(prevTimestamp => new Date(prevTimestamp.getTime() + 1000));
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    };

    
  }, [timestamp_RTC]);

  // Funzione per memorizzare i dati provenienti dal sensore BMP280 tramite chiamata API
  const storeBMPData = async (timestamp, temperature, altitude, pressure) => {
  
    // Logica per memorizzare i dati provenienti dal sensore BMP280
    try {
         
      await axios.post(STORE_BMP_DATA, 
        {
          timestamp: timestamp,
          temperature: temperature,
          altitude: altitude,
          pressure: pressure,
        },
        {
          
        }
      ); 

      getBMPData();

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

  // Funzione per memorizzare i dati provenienti dal sensore BH1750 tramite chiamata API
  const storeBHData = async (timestamp, lux) => {

    // Logica per memorizzare i dati provenienti dal sensore BH1750
    try {
         
      await axios.post(STORE_BH_DATA, 
        {
          timestamp: timestamp,
          lux: lux
        },
        {
          
        }
      ); 

      getBHData();

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

   // Funzione per ottenere i dati del sensore BMP280 tramite chiamata API
  const getBMPData = async () => {
    
   // Logica per ottenere i dati del sensore BMP280
      try {
         
      const response = await axios.post(GET_BMP_DATA, 
        {
          
        },
        {
          
        }
      ); 
      
      setLabels_BMP(response.data.map(obj => new Date(obj.timestamp).toLocaleString()));
      setTimestamp_DB_BMP(response.data.map(obj => obj.timestamp));
      setAltitude_DB(response.data.map(obj => obj.altitude));
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

  // Funzione per ottenere i dati del sensore BH1750 tramite chiamata API
  const getBHData = async () => {
    
    // Logica per ottenere i dati del sensore BH1750
    try {
         
      const response = await axios.post(GET_BH_DATA, 
        {
          
        },
        {
          
        }
      ); 
      
      setLabels_BH(response.data.map(obj => new Date(obj.timestamp).toLocaleString()));
      setTimestamp_DB_BH(response.data.map(obj => obj.timestamp));
      setLux_DB(response.data.map(obj => obj.lux));
    
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

  // Opzioni di Chart.js
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
        },
      },
    },
  };

  // Oggetti dati di Chart.js per i diversi grafici a linee
  const tempData = {
    labels: labels_BMP,
    datasets: [
      {
        label: "Temperatura",
        data: temperature_DB,
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
      }
    ],
  }

  const pressureData = {
    labels: labels_BMP,
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
    labels: labels_BMP,
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
    labels: labels_BH,
    datasets: [
      {
        label: "Luminosità",
        data: lux_DB,
        backgroundColor: "#008000",
        borderColor: "#008000",
      }
    ]
  }
  
   // Funzione per pubblicare la richiesta del sensore BMP280 tramite MQTT
  const publishMessageBMP = () => {
    
     // Logica per pubblicare la richiesta dei dati del sensore BMP280
    if (mqttClient) {
      const message = JSON.stringify({
        "sensor": "BMP280"
      }); 
      mqttClient.publish('WEB_REQ', message);
    }
    
  };

  // Funzione per pubblicare la richiesta del sensore BH1750 tramite MQTT
  const publishMessageBH = () => {
    
    // Logica per pubblicare la richiesta dei dati del sensore BH1750
    if (mqttClient) {
      const message = JSON.stringify({
        "sensor": "BH1750"
      }); 
      mqttClient.publish('WEB_REQ', message);
    }
    
  };

  // Funzione per pubblicare la richiesta di sincronizzazione RTC tramite MQTT
  const publishMessageRTCSync = () => {

    // Logica per pubblicare la richiesta di sincronizzazione RTC
    if (mqttClient) {
      const message = JSON.stringify({
        "sensor": "RTC_SYNC"
      }); 
      mqttClient.publish('WEB_REQ', message);
    }
  };

  // Funzione per pubblicare la richiesta di lettura RTC tramite MQTT
  const publishMessageRTCRead = () => {

     // Logica per pubblicare la richiesta di lettura RTC
    if (mqttClient) {
      const message = JSON.stringify({
        "sensor": "RTC_READ"
      });
      mqttClient.publish('WEB_REQ', message);
    }
  };

  // Funzione per mostrare un messaggio per 5 secondi
  
  const showMessageFor10Seconds = (messageText) => {

    // Logica per mostrare il messaggio
    setMessage(messageText);
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 5000); 
  };


  return (
    <section className='Progetto_SOD_WEB'>
      <div className='container'>
        <div className='header-div'>
          <h1>Progetto Sistemi Operativi Dedicati</h1>
          <h2>Castellucci Giacomo - Compagnoni Paolo - Silveri Nicola</h2>
        </div>
        <div className='real-time-div'>
          {/* Visualizzazione dei dati in tempo reale */}
          <div className='connection-monitor'>
            <p className='real-time-title'>Dati in tempo reale</p>
            <p className={status=== 'NON ATTIVA' ? 'disabled' : 'enabled' }>Connessione MQTT: {status}</p>
          </div>
          <div className='sensor-values-div'>
            <div className='sensor-values'>
              <div className='sensor-value'>
                <div>
                  <h3>Temperatura</h3>
                  <h4>{temperature_RT} °C</h4>
                </div>
                <div>
                  <h3>Pressione</h3>
                  <h4>{pressure_RT} atm</h4>
                </div>  

                <div>
                  <h3>Altitudine</h3>
                  <h4>{altitude_RT} mt</h4>
                </div>  
                
              </div>                

              <div className='latest-update'>               
                <button className='btn' onClick={publishMessageBMP}>Aggiorna</button>
                <p>Ultimo aggiornamento: {timestamp_RT_BMP}</p>
              </div>           
           
            </div>
          
          
            <div className='sensor-values'>
              <div className='sensor-value'>
                <div>
                  <h3>Luminosità</h3>
                  <h4>{lux_RT} lux</h4>
                </div> 
                
              </div>                

              <div className='latest-update'>
                <button className='btn' onClick={publishMessageBH}>Aggiorna</button>
                <p>Ultimo aggiornamento: {timestamp_RT_BH}</p>
              </div>           
           
            </div>

            <div className='sensor-values'>
              <div className='sensor-value'>
                <div>
                  <h3>RTC</h3>
                  <h4>{ !timestamp_RTC ? "" : timestamp_RTC.toLocaleString()}</h4>
                </div> 
                
              </div>                

              <div className='latest-rtc'>
                <button className='btn' onClick={publishMessageRTCSync}>Sync</button>
                <button className='btn' onClick={publishMessageRTCRead}>Leggi</button>
              </div> 

              <div>
                <p>Ultimo aggiornamento: { !latestRTCTimestamp? "" : latestRTCTimestamp.toLocaleString() }</p>
              </div>          
           
            </div>

            {showMessage && <div className='enabled'>{message}</div>}
            
          </div>
          
        </div>

        <div className='line-charts-div'>
         
             {/* Visualizzazione dei grafici a linea */}
              <div className='line-chart'>
                <Line options={options} data={tempData}/>
                <p>Ultimo aggiornamento: {timestamp_DB_BMP[timestamp_DB_BMP.length - 1] ? new Date(timestamp_DB_BMP[timestamp_DB_BMP.length - 1]).toLocaleString() : ""}</p>
              </div>         
              <div className='line-chart'>
                <Line options={options} data={pressureData} />
                <p>Ultimo aggiornamento: {timestamp_DB_BMP[timestamp_DB_BMP.length - 1] ? new Date(timestamp_DB_BMP[timestamp_DB_BMP.length - 1]).toLocaleString() : ""}</p>
              </div>
              <div className='line-chart'>
                <Line options={options} data={altitudeData} />
                <p>Ultimo aggiornamento: {timestamp_DB_BMP[timestamp_DB_BMP.length - 1] ? new Date(timestamp_DB_BMP[timestamp_DB_BMP.length - 1]).toLocaleString() : ""}</p>
              </div>
              <div className='line-chart'>
                <Line options={options} data={luxData} />
                <p>Ultimo aggiornamento: {timestamp_DB_BH[timestamp_DB_BH.length - 1] ? new Date(timestamp_DB_BH[timestamp_DB_BH.length - 1]).toLocaleString() : ""}</p>
              </div>
            
              
        </div>

      
      </div>
      
      
    </section>
  );
};

export default App;
