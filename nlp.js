const { NlpManager } = require('node-nlp');
const readline = require('readline');
const puerto = 4500;
const logfn = (status, time) => console.log(status, time);
const manager = new NlpManager({ languages: ['es'] ,nlu: { useNoneFeature: false ,log: logfn} });
manager.load("model.nlp");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
iniciar();

function iniciar(){
  rl.question('Hola soy tu bot que quieres decirme? ', (texto) => {
    (async() => {
        if(texto == "procesa"){
          await manager.train();
          manager.save();
        }
        if(texto == "exit" || texto == "salir"){
            process.exit()
        }
        const response = await manager.process('es', texto);
        console.log(response);
        console.log("BOT responde: "+response.answer);
        conversar();
    })();
  });
}
function conversar(){
  rl.question('sigamos conversando, en que mas puedo ayudarte? ', (texto) => {
    (async() => {
      if(texto == "exit" || texto == "salir"){
          process.exit()
      }
      const response = await manager.process('es', texto);
      if(response.intent == "None"){
        console.log("BOT responde: Lo siento no pude entender :( pregunta nuevamente...");
      }else{        
        console.log(response);
        console.log("BOT responde: "+response.answer);
        console.log("BOT intencion: "+response.intent);
        if(response.sourceEntities && response.sourceEntities[0]){
          console.log("BOT entity: "+response.sourceEntities[0].text);
        }
      }

      conversar();
    })();
  });
}



const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/train', (req,res)=>{
  console.log("estoy tratando de entrenar datos");
  console.log(req.body);
  let text = req.body.text;
  let intention = req.body.intention;
  let answers = req.body.answers;
  manager.addDocument('es', text, intention);
  for(var answer of answers){
      manager.addAnswer('es', intention, answer);
  }
  res.json({"message": "agregado nuevo set de entrenamiento","data":req.body});
})
app.post('/startTrain', (req,res)=>{
  (async() => {
      await manager.train();
      manager.save();
      res.json({"message": "OKey ya ta entrenado"});
  })();
})


app.listen(puerto, function () {

});
