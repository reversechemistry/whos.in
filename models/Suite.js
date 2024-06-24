import mongoose from 'mongoose'

const Schema = mongoose.Schema

//Create schema
const SuiteSchema = new Schema({
  suitename: {
    type: String
  },
  status: {
    type: String
  },
  provider: {
    type: String
  },
  notes: {
    type: String
  }
});

const Suite = mongoose.model('suites', SuiteSchema)

export default Suite