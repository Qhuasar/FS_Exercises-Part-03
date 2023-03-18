const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors")

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    skip: (req, res) => req.method === "POST",
  })
);

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
    {
      skip: (req, res) => req.method !== "POST",
    }
  )
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generate_id = () => {
  return Math.round(Math.random() * 100000);
};

app.get("/", (req, res) => {
  res.send("<h1>PhoneBook API</h1>");
});

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
              <p>${new Date()}</p>`);
});

app.get("/api/persons", (req, res) => {
  if (persons) {
    res.json(persons);
  }
  res.statusMessage = "List is currently empty";
  res.status(404).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  morgan.token("body", (req, res) => JSON.stringify(req.body));
  if (!body.name || !body.number) {
    res.status(400).json({ error: "malformed request body" });
  } else if (persons.find((p) => p.name === body.name)) {
    res.status(400).json({ error: "name must be unique" });
  } else {
    const new_person = {
      name: body.name,
      number: body.number,
      id: generate_id(),
    };
    persons = persons.concat(new_person);
    res.status(201).json(new_person);
  }
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);
  if (person !== undefined) {
    res.json(person);
  }
  res.statusMessage = "Person doesn't exist";
  res.status(404).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);
  res.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
