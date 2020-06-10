import express from 'express';
import {
  promises
} from 'fs';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

const timestamp = new Date();

const router = express.Router();

global.jsonURL = '../assets/grades.json';

//endpoint para criar uma grade
router.post('/', async (req, res) => {
  let grade = req.body;
  try {
    let data = await readFile(jsonURL, 'utf8');
    let json = JSON.parse(data);

    grade = {
      id: json.nextId++,
      ...grade,
      timestamp: timestamp,
    };

    json.grades.push(grade);

    await writeFile(jsonURL, JSON.stringify(json));
    res.send(grade);
    res.end();
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

//endpoint para atualizar uma grade
router.put('/', async (req, res) => {
  try {
    let updateGrade = req.body;
    let data = await readFile(jsonURL, 'utf8');

    let json = JSON.parse(data);
    let oldIndex = json.grades.findIndex(
      (grade) => grade.id === updateGrade.id
    );
    //atualização de campos específicos dentro da api
    json.grades[oldIndex].value = updateGrade.value;

    await writeFile(jsonURL, JSON.stringify(json));
    res.send(updateGrade);
    res.end();

  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

//endpoint para excluir uma grade
router.delete('/:id', async (req, res) => {
  try {
    let data = await readFile(jsonURL, 'utf8');

    let json = JSON.parse(data);
    let grades = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10)
    );
    json.grades = grades;

    await writeFile(jsonURL, JSON.stringify(json));
    res.send(`Grade deleted - ID: ${req.params.id}`);
    res.end();
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});


export default router;