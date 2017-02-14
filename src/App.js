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
      edit: false
    }
  }

  componentDidMount() {
    this._loadFirebaseData();
  }

  //Loading the data from the firebase 
  _loadFirebaseData() { 
// 'this' will mean something else outside of the funciton 
// using 'self' as way to set 'this' setState in function
    var self = this;

    //this empties out the array
    this.setState({ inventory: [] });

    //Getting data from firebase 
    // forEach(action) returns boolean / guarantees the children (data entered) will be iterated in their query order.
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) { 
        self.setState({inventory: self.state.inventory.concat(data.val())
        });
      });
    });
  }

  _handleClick(event) {
    event.preventDefault();
    console.log(event.target.value);

    //remove one element
    var uuid = event.target.value;
    firebase.database().ref().child('inventoryapp/' + uuid).remove();

    //Reload the data
    this._loadFirebaseData();
  }

   handleButton(event){
    var myUuid = uuid;
    //var edit = true;
      return firebase.database().ref().child('/inventoryapp/' + uuid)
      .update({ inventory: myUuid });
    
  }

  //Adding our function that will handle our form submit 
  onSubmit(event) {
    event.preventDefault();

    const details = {}       // const = var // empty array set to details
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
    //var inputForm;
    //var table;
    //var rows;
    // output may mean something
    var output;

    // if (edt true)
    // enter code  / encompass all of the return 
/*var output = function(){
  if(edit) {
   return  (rows) 
  } else
*/
  


   var inputForm = <span>
      <h2>Please enter your inventory Item</h2>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input type="text" placeholder="Enter Name..." name="name" />
        <input type="text" placeholder="Enter description..." name="description" />
        <input type="text" placeholder="Enter quantity..." name="quantity" />
        <button type="submit">Submit</button>
      </form>
    </span>

    //Only runs if the form has been submitted
    // if (this.state.submitted && this.state.inventory.length) {

    var self = this;
    var rows = this.state.inventory.map(function (item, index) {
      return Object.keys(item).map(function (s) {

        return (
          <tr key={s}>
            <th> {item[s].inventory.name} </th>
            <th> {item[s].inventory.description} </th>
            <th> {item[s].inventory.quantity} </th>
            <th><button value={item[s].inventory.uuid} onClick={self._handleClick.bind(self)}>Delete</button> </th>
            <th><button value={item[s].inventory.uuid} onButton={self.handleButton.bind(self)}>Edit </button></th>
          </tr>
        )
      });
    });

   var table = (
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

//output = replace return below
    return (
      <div className="App">
        <div className="App-header">
          <h2>React-JS-InventoryApp</h2>
        </div>
        <div className="text-center">
          {inputForm}
          <br />
          {table}
        </div>
      </div>
    );
  }

// return --> output:
//  }

}


export default App;
