const dotenv = require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("build"));
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

app.get("/", (req, res) => {
  res.send("<h1>PhoneBook API</h1>");
});

app.get("/info", (req, res) => {
  Person.find({}).then((people) =>
    res.send(`<p>Phonebook has info for ${people.length} people</p>
              <p>${new Date()}</p>`)
  );
});

app.get("/api/persons", (req, res, next) => {
  Person.find({}).then((db_data) => {
    if (db_data.length) {
      res.json(db_data);
    } else {
      res.statusMessage = "List is currently empty";
      res.status(404).end();
    }
  });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  morgan.token("body", (req, res) => JSON.stringify(req.body));
  if (!body.name || !body.number) {
    res.status(400).json({ error: "malformed request body" });
  } else {
    Person.find({ name: body.name })
      .then((persons_same_name) => {
        if (!persons_same_name) {
          res.status(400).json({ error: "name must be unique" });
        } else {
          const new_person = new Person({
            name: body.name,
            number: body.number,
          });
          new_person
            .save()
            .then((saved_person) => res.json(saved_person))
            .catch((error) => next(error));
        }
      })
      .catch((error) => next(error));
  }
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  if (mongoose.isValidObjectId(id)) {
    Person.findByIdAndUpdate(
      id,
      { number: req.body.number },
      { new: true, runValidators: true }
    )
      .exec()
      .then((data) => {
        console.log(data);
        res.status(200).json(data);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.statusMessage = "Id not valid";
    res.status(400).exit();
  }
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  if (mongoose.isValidObjectId(id)) {
    Person.findById(id)
      .exec()
      .then((person) => {
        if (person) {
          res.json(person);
        }
        res.status(404).end();
      })
      .catch((err) => {
        console.log("Failed to find item ", err.message);
        res.status(500).end();
      });
  } else {
    res.statusMessage = "Invalid Id";
    res.status(400).end();
  }
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  if (mongoose.isValidObjectId(id)) {
    Person.findByIdAndDelete(id)
      .exec()
      .then((delt_status) => {
        if (!delt_status) {
          res.statusMessage = "Id no londer exists in database";
          res.status(404).end();
        }
        res.status(204).end();
      })
      .catch((err) => {
        res.statusMessage = err.message;
        res.status(500).end();
      });
  } else {
    res.statusMessage = "Invalid Id";
    res.status(400).end();
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.name);
  switch (error.name) {
    case "ValidationError":
      res.status(400).json({
        error: error.message,
      });
  }
  next(error);
};

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
