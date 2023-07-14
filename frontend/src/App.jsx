import React, { useEffect } from 'react';
import mqtt from 'mqtt/dist/mqtt';
import { MQTTComponent } from './components/MQTTComponent';

const App = () => {

  MQTTComponent();

  return (
    <div>
      {/* Your React components */}
    </div>
  );
};

export default App;
