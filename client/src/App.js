import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import CreateRoom from './routes/createRoom';
import Room from './routes/room';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path='/' exact component={CreateRoom} />
                    <Route path='/room/:roomId' component={Room} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
