import React, { Component } from 'react';
import './App.css';
import { Table } from 'react-bootstrap';

//Firebase dependencies
var firebase = require('firebase');
var uuid = require('uuid');

var config = {
  apiKey: "AIzaSyC7Zg3IHEq10xN_m-4sDxL1QgZpAjYP7Ss",
  authDomain: "react-js-inventory-app.firebaseapp.com",
  databaseURL: "https://react-js-inventory-app.firebaseio.com",
  storageBucket: "react-js-inventory-app.appspot.com",
  messagingSenderId: "375476091121"
};
firebase.initializeApp(config);


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inventory: [],
      submitted: false,
      edit: false,
      editInput: []
    }
  //Handle Actions / Binds?
  this._formChange = this._formChange.bind(this);
  this._handleClick = this._handleClick.bind(this);
  this._handleButton = this._handleButton.bind(this);


  }
  componentDidMount() {
    this._loadFirebaseData();
  }

  _loadFirebaseData() {   // 'this' will mean something else outside of the funciton - using 'self' as way to set 'this' setState in function
    var self = this;

    //this empties out the array
    this.setState({ inventory: [] });

    //pulls data from firebase / forEach(action) returns boolean 
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) {   
        self.setState({inventory: self.state.inventory.concat(data.val())
        });
      });
    });
  }

  _formChange(event) {
    this.prop.onChange(event.target.value);
  }
    // handle delete event 
  _handleClick(event) {
    event.preventDefault();
    console.log(event.target.value);

    //remove one element
    var uuid = event.target.value;
    firebase.database().ref().child('inventoryapp/' + uuid).remove();

    //Reload the data
    this._loadFirebaseData();
  }
    //Edit event handle 
   _handleButton(event){
     event.preventDefault();
        //identify the value being targeted 
     var itemId = event.target.value;
     //set the state to receive and edit the data
     this.setState({
      edit: true,
      editUuid: itemId,  // targets the UUID - 
      editInput: []
     });

     var self = this; // we loose this once we go into firebase data 

      //pulls data for database / request info by child  - Parent = form as Child = input 
       firebase.database().ref().child("InventoryApp").orderByChild("uuid").on('value', 
       (snapshot) => { snapshot.forEach(function(child){
         var value = child.val();
         var name = value.inventory.name;
         var quantity = value.inventory.quantity;
         var description = value.inventory.description;
         var uuid = value.inventory.uuid;

         var editInput = {};

         if(uuid === itemId){
           editInput['name'] = name;
           editInput['quantity'] = quantity;
           editInput['description'] = description;
           editInput['uuid'] = uuid;
         
           self.setSelf({editInput: editInput});
          }
        });
      }
    )
  }
  //update data info - editScreen
  _upDate(event){
    event.preventDefault();

    const updateItem = {};

    event.target.childNodes.forEach(function(e){
      if (e.tagName === "INPUT") {
        updateItem[e.tagName] = e.value
      } else {
        e.value = null
      }
    });
    this.setState({editInput: false});

    var uuid = updateItem['uuid'];

    var self = this;

    firebase.database().ref().child('/inventoryApp/' + uuid)
    .update({inventory: updateItem});

    self._loadFirebaseData();

  }
  //handles Data input into firebase 
  onSubmit(event) {
    event.preventDefault();

    const details = {}       // CONST is equal to VAR
    const id = uuid.v1();

    //Go through each element in the form making sure it's an input element
    //details[name:'value'] / details [description: 'value']
    event.target.childNodes.forEach(function (i) {
      if (i.tagName === 'INPUT') {
        details[i.name] = i.value
      } else {
        i.value = null
      }

      details['uuid'] = id;

    })

    firebase.database().ref('inventoryapp/' + id).set({
      inventory: details
    });

    this.setState({
      submitted: true
    })

    this._loadFirebaseData();
  }


  render() {
    var inputForm;
    var table;
    var rows;
    var editScreen;
    var output;
     

    
  editScreen = (<span>
            <h2>Edit your inventory</h2>
              <form onSubmit={this._upDate.bind(this)}>
                <input type="text" value={this.state.editInput.name} onChange={this._formChange} name="name" />
                <input type="text" value={this.state.editInput.quantity} onChange={this._formChange} name="description"/>
                <input type="text" value={this.state.editInput.description} onChange={this._formChange} name="quantity"/>
                <input type="text" className="hideinput" value={this.state.editInput.uuid} name="uuid" />
                <button type="submit">Submit</button>
                </form>
            </span>);  


  inputForm = <span>
      <h2>Please enter your inventory Item</h2>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input type="text" placeholder="Enter Name..." name="name" />
        <input type="text" placeholder="Enter description..." name="description" />
        <input type="text" placeholder="Enter quantity..." name="quantity" />
        <button type="submit">Submit</button>
      </form>
    </span>


  var self = this;
  rows = this.state.inventory.map(function (item, index) {
      return Object.keys(item).map(function (s) {

        return (
          <tr key={s}>
            <th> {item[s].inventory.name} </th>
            <th> {item[s].inventory.description} </th>
            <th> {item[s].inventory.quantity} </th>
            <th><button value={item[s].inventory.uuid} onClick={self._handleClick}>Delete</button> </th>
            <th><button value={item[s].inventory.uuid} onClick={self._handleButton}>Edit</button></th>
          </tr>
        )
      });
    });

  table = (
      <span>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th> Name </th>
              <th> Description </th>
              <th> Quantity </th>
              <th> Delete </th>
              <th> Edit </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </span>
    )

if(this.state.edit){
  output=(
    <div className='App'>
      <div className="App-header">
        <h2> Inventory App </h2>
      </div>
      <div className="text-center" >
          {editScreen}
      </div>
  </div>);
} else {
    output =(
      <div className="App">
        <div className="App-header">
          <h2>React-JS-InventoryApp</h2>
        </div>
        <div className="text-center">
          {inputForm}
          <br />
          {table}
        </div>
    </div>);
  }

    return  (
      <div className="App">
      {output}
      </div>
    );
     
}
}



export default App;
