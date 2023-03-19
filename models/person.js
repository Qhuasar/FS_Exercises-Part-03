const mongoose = require("mongoose");

const uri = process.env.DB_URI;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => console.log("Connect to MongoDB"))
  .catch((err) => console.log("Failed to connecto Mongo due to:", err.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: (value) => /[0-9]{3}-[0-9]{5}/.test(value),
      message: () => `must be 8 digits and of the from 333-55555 `,
    },
    required: [true, "Phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
