import express from 'express';
import { promises } from 'fs';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

const timestamp = new Date();

const router = express.Router();

global.jsonURL = '../assets/grades.json';

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

export default router;
