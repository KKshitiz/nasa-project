import mongoose from "mongoose";

const planetsSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

const planetsModel = mongoose.model("Planets", planetsSchema);

export default planetsModel;
