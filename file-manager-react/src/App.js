import './App.css';
import { Navbar } from './components/Navbar/Navbar';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Home } from './components/Featured/Home/Home';
import { Dashboard } from './components/Featured/Dashboard/Dashboard';

function App() {
  return (
    <div className="App">
      <Router>
        <div className="head">
          <Navbar />
        </div>
        <div id="body">
          {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
