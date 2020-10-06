import express from 'express'; 
import mongoose from 'mongoose' ; 
import cors from 'cors' ; 
import mongoMessages from './Schema/messageModal.js' ; 
import Pusher from 'pusher';

//--- App config ---// 

const app = express() ; 
const port = process.env.PORT  || 9000 ; 
const pusher = new Pusher({
  appId: '1085529',
  key: 'd130f6b91439c1ebb953',
  secret: '6dc6b558bf8a845a130f',
  cluster: 'eu',
  useTLS: true 
});



//--- middmewares ---// 

app.use(express.json()) ; 
app.use(cors())

//--- db config ---//

const mongoURI = 'mongodb+srv://jassem:20550248@cluster0.kap7f.mongodb.net/<messengerDB>?retryWrites=true&w=majority'
mongoose.connect(mongoURI ,{
  useCreateIndex : true , 
  useNewUrlParser : true , 
  useUnifiedTopology : true , 
})

mongoose.connection.once('open' , () => {

  console.log('db connected')

  const changeStream = mongoose.connection.collection('messages').watch()
  changeStream.on('change', (change) => {
    pusher.trigger('messages', 'newMessage', {
      'change' : change 
    }) ; 
  })
})

//--- api routes ---// 

app.get('/', (req, res) =>{

  res.status(200).send('hello world')

})

app.post('/save/message', (req , res ) => {
  const dbMessage = req.body 

  mongoMessages.create(dbMessage, (err, data)=> {
    if (err) {
      res.status(500).send(err)
    }else{
      res.status(201).send(data) 
    }
  })
})

app.get('/retrieve/conversation' , (req ,res ) => {
 mongoMessages.find((err , data ) => {
   if (err ) {
     res.status(500).send(err) 
   }else{
     data.sort((b, a)=>{
       return a.timestamp - b.timestamp ; 
     }) ; 
  
     res.status(201).send(data)

   }
 })
})

//--- Listen ---// 

app.listen(port, () => console.log(`app is running on : ${port}`))