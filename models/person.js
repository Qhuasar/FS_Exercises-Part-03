const mongoose = require("mongoose");

const uri = process.env.DB_URI;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then((resp) => console.log("Connect to MongoDB"))
  .catch((err) => console.log("Failed to connecto Mongo due to:", err.message));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
