import express from "express"
import { url } from "inspector"
const app = express()
import path from "path"
import { fileURLToPath } from "url"
import pkg from 'body-parser';
const { urlencoded } = pkg;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname)))
app.use(express.json())
app.use(urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/a",(req,res)=>{
  console.log(req.body)
  res.send(`<nova-frame id="aqa">Hello, ${req.body.test}</nova-frame>`)
})

app.listen(3000, () => {
  console.log("Server is running on 3000")
})
