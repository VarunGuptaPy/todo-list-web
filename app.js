//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://admin-varungupta:Kanpur123@todolist.fwcyl2k.mongodb.net/todolistDB');
const itemsSchema = new mongoose.Schema({
  name:String,
});
const Item = mongoose.model("Item",itemsSchema)
const item1 = new Item({
  name:"Welcome to your todolist!"
})
const item2 = new Item({
  name:"Hit the + button to add new item."
})
const item3 = new Item({
  name:"<--- Hit this to delete item."
})
const listSchema = mongoose.Schema({
  name:String,
  items:[itemsSchema]
})
const List = mongoose.model("List",listSchema);
app.get("/",async function(req, res) {
  Item.find({},function(err,data){
    if (data.length === 0){
      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log(err);
        }else {
          console.log("added to the db");
          res.redirect("/");
        }
      })
    }else{
      res.render("list", {listTitle: 'Today', newListItems: data});
    }
  });
  
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitles = req.body.list;
  const newItem = new Item({
    name:itemName,
  });
  if (listTitles === "Today"){
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name:listTitles},function(err,data){
      data.items.push(newItem);
      data.save();
      res.redirect('/' + listTitles)
    })
  }
});
app.get("/:dbName",function(req,res){
  const param =  _.capitalize(req.params.dbName);
  List.findOne({name:param},function(err,result){
    if(!err)
    {
      if (!result){
      const newItem = List({
        name:param,
        items:[item1,item2,item3],
      })
      newItem.save()
      res.redirect('/' + param)
    }else{
      res.render("list",{listTitle:param,newListItems:result.items})
    }
  }
    else{
      console.log(err);
    }
  })
})
app.get("/about", function(req, res){
  res.render("about");
});
app.post("/delete",function(req,res){
  const itemID = req.body.checkbox.trim();
  const dbTitle = req.body.dbTitle;
  if (dbTitle === "Today"){
    Item.findByIdAndRemove(itemID,function(err){
      if (!err){
        console.log("successfully deleted");
        res.redirect("/");
      }else {
        console.log(err);
      }
    })
  }
  else{
    List.findOne({name:dbTitle}, function(err, foundList){
      foundList.items.pull({ _id: itemID }); 
      foundList.save(function(){

          res.redirect("/" + dbTitle);
      });
    });
  }
})
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
