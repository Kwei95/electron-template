import React from 'react';
import {HashRouter,Route,Switch,Redirect} from 'react-router-dom'
import {HomePage,OtherPage} from './pages/index'
function App() {
  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/home" component={HomePage}></Route>
          <Route path="/other"  component={OtherPage}></Route>
          <Redirect path='/' to='/home'></Redirect>
          <Route render={() => <h1>404 not found  ！</h1>} />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
