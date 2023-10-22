import express  from "express";
import bodyParser  from "body-parser";
import mongoose, { mongo }  from "mongoose";
import _ from "lodash";
// import date  from (__dirname + "/date.js");

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/todoListDB", {useNewUrlParser : true});

const todoSchema = new mongoose.Schema({
    Name : String
});

const ToDo = new mongoose.model("list", todoSchema);

const list1 = new ToDo({
    Name : "Study"
});

const list2 = new ToDo({
    Name : "eat"
});

const list3 = new ToDo({
    Name : "Sleep"
});

const list11 = new ToDo({
    Name : "Netflix"
});

const list12 = new ToDo({
    Name : "Popcorn"
});

const list13 = new ToDo({
    Name : "Webseries"
});

const defaultList = [list1, list2, list3];
const defaultList1 = [list11, list12, list13];

const itemSchema = {
    Name : String,
    items : [todoSchema]
};

const Item = mongoose.model("item", itemSchema ); 


app.get("/", function(req, res){
ToDo.find({})
    .then((foundItems) =>{
        if(foundItems.length === 0){
            ToDo.insertMany(defaultList)
            .then(()=>{
                console.log("Inserted Successfully");
            })
            .catch((error)=>{
                console.log(error);
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })
    .catch((error) =>{
        console.log(error);
    });
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    Item.findOne({Name : customListName})
    .then((foundList)=>{
        if(!foundList){
            const item = new Item({
                Name : customListName,
                items : defaultList1
            });
            item.save();
            res.redirect("/"+customListName);
        }else{
            res.render("list", {listTitle: foundList.Name, newListItems: foundList.items});
        }
    });  
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.List;

    const item = new ToDo({
        Name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        Item.findOne({Name : listName})
        .then((foundItems)=>{
            foundItems.items.push(item);
            foundItems.save();
            res.redirect("/"+listName);
        })
        .catch((error)=>{
            console.log(error);
        });
    }  
});

app.post("/delete", function(req, res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
    ToDo.findByIdAndRemove(checkedItem)
    .then(()=>{
        console.log("Deleted successfully");
    })
    .catch((error)=>{
        console.log(error);
    })
    res.redirect("/");
    }
    else{
        Item.findOneAndUpdate({Name : listName},{$pull: {items : {_id: checkedItem}}})
        .then(()=>{
            console.log("Successfully Updated");
            res.redirect("/"+listName);
        })
        .catch((error)=>{
            console.log(error);
        });   
    }  
});



app.get("/about", function (req, res){
    res.render("about");
});

app.listen(port, function(){
    console.log(`Server is running at https://localhost:${port}`);
});



