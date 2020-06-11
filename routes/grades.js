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
    json.grades[oldIndex].student = updateGrade.student;
    json.grades[oldIndex].subject = updateGrade.subject;
    json.grades[oldIndex].type = updateGrade.type;
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

//endpoint para consultar uma grade
router.get('/:id', async (req, res) => {
  try {
    let data = await readFile(jsonURL, 'utf8');
    let json = JSON.parse(data);

    const gradeFound = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );
    if (gradeFound) {
      res.send(gradeFound);
    } else {
      res.send('Grade not found');
      res.end();
    }
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

//endpoint para consultar a nota total de um aluno em uma disciplina
router.post('/sum', async (req, res) => {
  let gradeReq = req.body;
  try {
    let data = await readFile(jsonURL, 'utf8');
    let json = JSON.parse(data);

    let student = json.grades.filter((grade) => grade.student === gradeReq.student);
    let subject = student.filter((student) => student.subject === gradeReq.subject);
    let gradeSum = subject.reduce((acc, curr) => acc + curr.value, 0);
    res.send(
      `${gradeReq.student}'s total grade for "${gradeReq.subject}" is: ${gradeSum}`
    );
  } catch (err) {
    res.status(400).send({
      error: err.message
    });
  }
});

//endpoint para consultar a média das grades de determinado subject e type
router.post('/average', async (req, res) => {
  let gradeParams = req.body;
  try {
    let data = await readFile(jsonURL, 'utf8');
    let json = JSON.parse(data);

    let subject = json.grades.filter((grade) => grade.subject === gradeParams.subject);
    let type = subject.filter((subject) => subject.type === gradeParams.type);
    let gradeAverage = type.reduce((acc, curr) => acc + curr.value, 0) / type.length;
    res.send(
      `${gradeParams.subject}'s average grade is: ${gradeAverage.toFixed(2)}`
    );
  } catch (err) {
    res.status(400).send({
      error: err.message
    });
  }
});

//endpoint para retornar as três melhores grades de acordo com determinado subject e type
router.post('/ranking', async (req, res) => {
  let gradeReq = req.body;
  try {
    let data = await readFile(jsonURL, 'utf8');
    let json = JSON.parse(data);

    let subject = json.grades.filter((grade) => grade.subject === gradeReq.subject);
    let type = subject.filter((subject) => subject.type === gradeReq.type);
    type.sort((a, b) => {
      b.value - a.value;
    });
    type = type.slice(0, 3);

    res.send(JSON.stringify(type));

  } catch (err) {
    res.status(400).send({
      Error: err.message
    });
  }
});

export default router;