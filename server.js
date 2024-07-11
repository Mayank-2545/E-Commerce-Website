const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const product = require("./models/product.model.js");
const orders = require("./models/order.model.js");
const app = express();
const port = 8585 || process.env.port;

const upload = multer({ dest: "uploads/" });
const fs = require('fs'); 
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to the database
async function connectToDatabase() {
  try {
    await mongoose.connect(
      "mongodb+srv://edomm9:noa4xvjjYziPJxF2@e-commerce.uepqkvw.mongodb.net/?retryWrites=true&w=majority&appName=E-commerce"
    );
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

connectToDatabase();


//homepage
app.get("/", (req, res) => {
   res.set("Content-Type", "text/html"); 
  res.sendFile(path.join(__dirname, "public/index.html"));
});

//list all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 
//list a product by id
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await product.findById(id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//list order by id
app.get("/api/order/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Orders = await orders.findById(id);
    res.status(200).json(Orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//list all orders
app.get("/api/order", async (req, res) => {
  try {
    const Orders = await orders.find();
    res.status(200).json(Orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//add an order on database
app.post('/api/order', upload.single("image"), async(req, res)=>{
try{
  const newOrder = new orders(req.body);
  const savedOrder = await newOrder.save();
  res.status(200).json(savedOrder);
}catch(error){
  res.status(500).json({message: error.message});
}
}); 
//create a product on database
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const imagePath = "uploads/" + req.file;

    const newProduct = new product({
      name,
      quantity,
      price,
      image: imagePath,
    });

    const savedProduct = await newProduct.save();

    res
      .status(201) 
      .json({
        product: savedProduct,
        message: "Product with image uploaded successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (req.file) {
      try {
        await unlinkFile(req.file.path);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  }
});
//Update products
app.patch("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await product.findByIdAndUpdate(id, req.body);
    if (!products) {
      res.status(404).json({ message: "Product not found" });
    }
    const updated = await product.findById(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json(error.message);
  }
});
//delete products
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await product.findByIdAndDelete(id);
    if (!products) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//delete orders
app.delete("/api/order/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Orders = await orders.findByIdAndDelete(id);
    if (!Orders) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.listen(port, () => {
  console.log("Server is running on port", port);
});
