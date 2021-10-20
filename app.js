//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Shruti:test123@cluster0.gquhi.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};


const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to ur todolist"
})

const item2 = new Item({
  name: "Click + to add new item"
})

const item3 = new Item({
  name: " <-- Click the checkbox to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err)
          console.log(err);
        else
          console.log("Successfully default items added");
      });

      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });

});


app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, (err, foundList) => {

    if (!err) {

      if (!foundList) {
        // create a list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // show an existing file
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    } else
      console.log(err);

  });

});


app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});


app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    // findByIdAndRemove function deletes the item only if it has a callback function otherwise it jst returns the value
    Item.findByIdAndRemove(checkedItem, (err) => {

      if (err)
        console.log(err);
      else
      res.redirect("/")
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedItem}}}, (err, foundItems) => {
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }


})


app.get("/about", function (req, res) {
  res.render("about");
})


let port = process.env.PORT;
if(port == null || port == "")
port = 3000;

app.listen(port, () => {
  console.log("Server successfully started");
})















// const items = ["Buy Food", "Cook Food", "Eat Food"];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// Item.insertMany([item1, item2, item3], (err) => {
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully added");
//   }
// })

// app.get("/", function(req, res) {

// const day = date.getDate();

// Item.find({}, (err, items) => {}

//   res.render("list", {listTitle: "Today", newListItems: items});

// });


// console.log("Saved");


// if (req.body.list === "Work") {
//   workItems.push(item);
//   res.redirect("/work");
// } else {
//   items.push(item);