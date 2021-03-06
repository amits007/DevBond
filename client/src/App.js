import React, {Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/navbar'
import Landing from './components/layout/landing'
import Register from './components/auth/register'
import Login from './components/auth/login';
import Alert  from './components/layout/alert';
// Redux
import { Provider } from 'react-redux';
import store from './store';
import {loadUser} from './action/auth';
import setAuthToken from './utils/setAuthToken';
import Dashboard from './components/dashboard/dashboard';
import PrivateRoute from './components/routing/privateroute';
import EditProfile from './components/profile-forms/editprofile';
import CreateProfile from './components/profile-forms/CreateProfile';
import AddExperience from './components/profile-forms/AddExperience';
import Profiles from './components/profiles/Profiles';
import AddEducation from './components/profile-forms/AddEducation';

if(localStorage.token) {
  setAuthToken(localStorage.token)
}

const App=() => { 
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return(
    <Provider store = {store}>
    <Router>
      <Fragment>
        <Navbar/>
        <Route exact path='/' component={Landing}/>
        <section className="container">
          <Alert/>
          <Switch>
            <Route exact path="/register" component = {Register}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path='/profiles' component={Profiles}/>
            <PrivateRoute exact path = "/dashboard" component={Dashboard}/>
            <PrivateRoute exact path= '/create-profile' component={CreateProfile}/>
            <PrivateRoute exact path= '/edit-profile' component={EditProfile}/>
            <PrivateRoute exact path= '/add-experience' component={AddExperience}/>
            <PrivateRoute exact path= '/add-education' component={AddEducation}/>
            
          </Switch>
          
        </section>
      </Fragment>
    </Router>
    </Provider>
)};
export default App;
