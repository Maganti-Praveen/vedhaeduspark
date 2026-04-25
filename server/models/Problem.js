const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: { type: String, default: '' },
  sampleTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' },
  }],
  hiddenTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
  }],
  starterCode: {
    cpp: { type: String, default: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
    java: { type: String, default: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}' },
    python: { type: String, default: '# Your code here\n' },
    c: { type: String, default: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  },
  solvedBy: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
