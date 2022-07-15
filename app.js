const express = require("express");
const bodyparser = require("body-parser");
const mongoose  = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://root:dkgulati@cluster0.t1qjn.mongodb.net/todolistDB", {useNewUrlParser:true});
 

const itemsSchema = {  
  name : String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your ToDoList!"
})

const item2 = new Item({
  name : "Hit the + button to add a new item."
})

const item3 = new Item({
  name : "<-- Hit this to delete an item."
})
const defaultItems = [item1,item2,item3];
const ListSchema = {
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List",ListSchema);
app.get("/", function (req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
            
        });
        res.redirect("/");
    }else{
    res.render("list", { listTitle: "Today", newListItems: foundItems});
    }
  });
});
app.get("/:customListName",function(req,res){
  const CustomListName = _.capitalize(req.params.customListName);
  List.findOne({name : CustomListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name : CustomListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + CustomListName);
      }
      else{
        res.render("list",{ listTitle: CustomListName, newListItems: foundList.items});
      }
    }
  })
  
});
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete" , function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted Checked Item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName} , {$pull:{items : {_id : checkedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is running on port 3000");
});

//https://calm-shore-72644.herokuapp.com/
