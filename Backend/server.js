const express=require("express")
const dotenv=require("dotenv")
const cors=require("cors")
const { default: mongoose } = require("mongoose")
const bodyParser = require("body-parser");

const app=express()
app.use(express.json())
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
dotenv.config()

mongoose.connect(process.env.MONGO_URL).then(()=> console.log("Mongo DB is connect")).catch((err) => console.log("Mongo db is not connected",(err)))

app.use("/api/upload", require("./Routes/routes"));


const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{ console.log(`server running on port ${PORT}`)})