const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb+srv://ITSJKS:ITSJKS123@todo-app.uhd14cn.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your TODOLIST"
})
const item2 = new Item({
  name: "Click on + button to add todo items"
})
const item3 = new Item({
  name: "Uncheck completed items to remove them"
})
const defaultItems = [item1, item2, item3];
const day = date.getDate();

app.get("/", (req, res) => {
  Item.find({}, (error, items) => {
    if (items.length == 0) {
      Item.insertMany(defaultItems, (error) => {
        if (error) console.log(error);
        else {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/")
    } else {

      res.render('index', {
        title: day,
        todoItems: items
      });
    }
  })
})
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("index", {
          title: foundList.name,
          todoItems: foundList.items
        })
      }
    }
  })
})
app.post("/delete", (req, res) => {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == day) {
    Item.deleteOne({
      _id: itemID
    }, (error) => {
      if (error) console.log(error)
      else {
        console.log("Successfully deleted the item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
})

app.post("/", (req, res) => {
  const itemName = req.body.todo;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName == day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening at port 3000");
})
