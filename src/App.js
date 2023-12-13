import React from 'react';
import Form from './components/Form';
import Seo from './components/seo';
import Banner from './components/Banner';

function App() {
  return (
    <div className="App">
      <Seo title="Asahi Europe and International"/>
      <Banner/>
      <Form />
    </div>
  );
}

export default App;
