import express from 'express';
import { promises } from 'fs';
import gradesRouter from './routes/grades.js';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

const app = express();
app.use(express.json());
app.use('/grades', gradesRouter);

global.jsonURL = './assets/grades.json';

app.listen(3000, async () => {
  try {
    await readFile(jsonURL, 'utf8');
    console.log('API STARTED!');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      grades: [],
    };
    writeFile(jsonURL, JSON.stringify(initialJson)).catch((err) => {
      console.log(err);
    });
  }
});
