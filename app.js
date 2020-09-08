//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongose = require("mongoose");
const { render } = require("ejs");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//conectamos mongose para crear la base de datos 
//mongose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
mongose.connect("mongodb+srv://adminLuis:test123@cluster0.whj1h.mongodb.net/todolistDB",{useNewUrlParser:true});

//se crea la estructura que va a tener la base de datos para recibir y guardar la onformacion

const itemSchema = {
  name: String
};
//se crea un modelo para la estructura monogoose

const Item = mongose.model("Item", itemSchema);
//se crean los documentos que seran registrados en la base de datos
const item1 = new Item({
  name: "bienvenido a tu lista de tareas"
});
const item2 = new Item({
  name: "hit + el boton de adcion nueva tarea"
});
const item3 = new Item({
  name: "hit para eliminar un item de la lista de tareas"
});

const defaultItems = [item1, item2, item3];

//se crea una estructura para la crear las colecciones de listas
const listasShema = {
  name: String,
  items:[itemSchema]
};
//se crea el modelo que recibe el nombre de las listas
const lista = mongose.model("lista",listasShema);
//se registran los documentos previamente creados a la base de datos


app.get("/", function(req, res) {//obtiene los datos de la pagina

  Item.find({}, function(err, foundItems){//busca en la base de datos mongoDB todos los items
    if(foundItems.length ===0){
      Item.insertMany(defaultItems, function(err){//inserta los items que se encuentran en el arreglo defaultitems a la base de dattos verificando si no se encuentran errores atraves de la funcion
        if(err){
          log(err);
        }else{
          console.log("se han registrado correctamente tu lista de tareas en DB");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "today", newListItems: foundItems});
    }
    
  })
  

});
app.get("/:customListName",function(req,res){//este metodo permite parametrizar varias paginas para no tener que usar muchos Gets
  //console.log(req.params.customListName);
  const nameNewList = _.capitalize(req.params.customListName);
  lista.findOne({name:nameNewList},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const lis = new lista({
          name:nameNewList,
          items: defaultItems
        });
        lis.save();
        res.redirect("/"+ nameNewList);
      }else{
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
      }
    }
  });

});
//en este fragmento de codigo se obtiene un item de para agregar a la lista 
app.post("/", function(req, res){

  const itemName = req.body.newItem;// se obtiene lo que el usuario escribe en la interfaz de la pagina
  const itenmList = req.body.list;
  const item = new Item({     //agrega el item que digito el usuario a la base de datos por medio de la estructura del modelo
    name: itemName
  });
  if(itenmList==="today"){
    item.save();// funcion del model para guradar 
    res.redirect("/");//lo redirige al home para poder vissualizar el item en la pagina
  }else{
    lista.findOne({name:itenmList},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+itenmList);
    });
    
  }
  
});

//ahora se procede a tener el post que permite borrar los items de la base de datos
app.post("/delete", function(req,res) {
  const itemDelete = req.body.checked;
  const nameOfList = req.body.nameLista;
  console.log(itemDelete);
  if(nameOfList === "today"){
    Item.findByIdAndRemove(itemDelete,function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("item elimindo");
        res.redirect("/");
      }
    });
  }else{
    lista.findOneAndUpdate({name:nameOfList},{$pull:{items:{_id:itemDelete}}}, function(err,foundDelete){
      if(!err){
        res.redirect("/"+ nameOfList);
      }
    });
  }
      
    
    
});


/* app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
 */
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
