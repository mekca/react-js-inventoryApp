import React, { Component } from 'react';
import './App.css';
import { Table, Button } from 'react-bootstrap';
import FormView from './Components/FormView';



//Firebase dependencies
var firebase = require('firebase');
var uuid = require('uuid');

//connects to firebase/data
var config = {
  apiKey: "AIzaSyC7Zg3IHEq10xN_m-4sDxL1QgZpAjYP7Ss",
  authDomain: "react-js-inventory-app.firebaseapp.com",
  databaseURL: "https://react-js-inventory-app.firebaseio.com",
  storageBucket: "react-js-inventory-app.appspot.com",
  messagingSenderId: "375476091121"
};
firebase.initializeApp(config);

//start of component 
class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      inventory: [],
      submitted: false,
      editMode: false,
      editFields: [],
      typed: '',
      change: []
    }

    //Handle Actions
    this._updateFireBaseRecord = this._updateFireBaseRecord.bind(this); //Updates the firebase record
    this._setFireBaseDataEditTable = this._setFireBaseDataEditTable.bind(this); //Sets the UUID we are going to modify
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  componentDidMount() {
    this._loadFirebaseData();
  }

  //Loading the data from firebase
  _loadFirebaseData() {
    var self = this;

    //Empty any records before we assign new ones
    this.setState({ inventory: [] });


    //Getting data from firebase
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) {

        //console.log(data.val());
        self.setState({
          inventory: self.state.inventory.concat(data.val())
        });
      });
    });

  }

  //Allows us to edit the fields and set the data back to itself.
  //It's a ReactJS requirement
  //Here's a good reference: http://stackoverflow.com/questions/22220873/how-to-reload-input-value-in-react-javascript-with-virtual-dom
  handleChange(event) {
    var change = {};
    change[event.target.name] = event.target.value;
    this.setState({ editFields: change });
  }

  _setFireBaseDataEditTable(event) {
    event.preventDefault();

    const recordId = event.target.value;

    console.log("The firebase uuid is", event.target.value);

    this.setState({
      editMode: true,
      editUUID: recordId,
      editFields: []
    });



    var self = this; //We loose what this is once we go into the firebase database

    //Query the firebase data
    firebase.database().ref().child("inventoryapp").orderByChild("uuid").on('value',
      (snapshot) => {
        snapshot.forEach(function (child) {
          //console.log(child.val()) // NOW THE CHILDREN PRINT IN ORDER
          var value = child.val();
          var name = value.inventory.name;
          var quantity = value.inventory.quantity;
          var description = value.inventory.description;
          var uuid = value.inventory.uuid;

          var editFields = {};

          if (uuid === recordId) {
            //console.log(value);
            editFields["name"] = name;
            editFields["quantity"] = quantity;
            editFields["description"] = description;
            editFields["uuid"] = uuid;

            self.setState({ editFields: editFields });

          }
        });
      }
    )
  }

  _updateFireBaseRecord(event) {
    event.preventDefault();

    //Getting the values of each child type input
    var details = {};
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      }
    });

    console.log("Data has been submitted!!!!");

    var uuid = details["uuid"];
    var self = this;

    firebase.database().ref().child('/inventoryapp/' + uuid)
      .update({ inventory: details });

    this._loadFirebaseData();

    //Resetting the property value
    this.setState({
      editMode: false
    });
  }

  handleCancel(event) {
    this.setState({ editmode: false });
  }

  _handleClick(event) {
    event.preventDefault();

    //Remove one element
    var uuid = event.target.value;

    firebase.database().ref().child('inventoryapp/' + uuid).remove();

    //Reload the data
    this._loadFirebaseData();
  }


  //Adding our function that will handle our form submit 
  onSubmit(event) {
    event.preventDefault();

    //Creating our initial variables
    const details = {};
    const id = uuid.v1(); //generating our unique key

    //Go through each element in the form making sure it's an input element
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } else {
        el.value = null
      }

      //Adding one more element uuid
      details['uuid'] = id;
    });


    //Saving to firebase
    firebase.database().ref('inventoryapp/' + id).set({
      inventory: details
    });

    this.setState({
      submitted: true
    })

    this._loadFirebaseData();

  }


  
  render() {
    
    return (
      <div className="App">
        <FormView data={this} />
      </div>
    );
  }
}


export default App;