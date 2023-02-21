//Express
const express = require("express");
//Mongoose setup
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-shups:Test123@cluster0.rxtfytw.mongodb.net/todolistDB");
//Lodash setup
const _ = require("lodash");

//express setup
const app = express();
//EJS setup
app.set("view engine", "ejs");
//Body-Parser setup
app.use(express.urlencoded());
//Static files setup
app.use(express.static("Public"));



//Mongoose Schema
const itemSchema = {
  name: String
};
//Mongosse Model
const Item = mongoose.model("Item", itemSchema);
//Mongoose Document
const item1 = new Item({
  name: "Welcome to your To Do List"
});

const item2 = new Item({
  name: "Hit the + button to add new item"
});

const item3 = new Item({
  name: "↞↞ Hit this to delete an item"
});
//Added above Itmes in below array
const defaultList = [item1, item2, item3];

//New Listschema for Custom list and connected that with itemSchema
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


//GET method for landing page with **deafault Items**
app.get("/", function(req, res) {

//Mongoose Find() method
  Item.find({}, function(err, arr){

  if(arr.length === 0){
//Mongoose InsertMany() method
  Item.insertMany(defaultList, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Succesfully updated");
      }
    });
  res.redirect("/");
  }
    else{
      res.render("list", {kindOfDay: "Today", newListItems: arr})
    }
  });

});


//GET method For custom list by User
app.get("/:anything", function(req, res){

const customName = _.capitalize(req.params.anything);
//Used findOne method to check list name
List.findOne({name: customName}, function(err, results){
  if(!err){
  if(!results){
    //Creating new List
    const list = new List({
      name: customName,
      items: defaultList
    });
    list.save();
    res.redirect("/"+ customName);
  }
  else{
    //Showing existing list
      res.render("list", {kindOfDay: results.name, newListItems: results.items});
  }
}

});

});


//1st POST method for adding Items
app.post("/", function(req, res){

let itemName = req.body.newItem;
let listName = req.body.list;

//Created Mongoose document
const  item = new Item({
name: itemName
});
//For custom list by User
if(listName === "Today"){
  item.save();
  res.redirect("/");
} else{
  List.findOne({name: listName}, function(err, results){
    results.items.push(item);
    results.save();
    res.redirect("/" + listName);
  });
}
});


//2nd POST method for deleting Items
app.post("/delete", function(req, res){
const itemID = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  //Mongoose find and Remove by ID method
  Item.findByIdAndRemove(itemID, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted");
      res.redirect("/");
    }
  });
} else {

  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, function(err, results){
    if(!err){
      res.redirect("/"+ listName);
    }
  });
}


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//local host 3000
app.listen(port, function() {
console.log("Server is running on port 3000");
});
