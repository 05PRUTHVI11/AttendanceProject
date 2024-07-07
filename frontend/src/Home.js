import React from 'react';
import './Home.css';

const Home = ({ userName }) => {
  return (
    <div className="classHome">
      <h2>Welcome, {userName}</h2>
      <p>Select a section from the navbar to manage the data.</p>
    </div>
  );
};

export default Home;
