// Routes for Word game word list
import express from "express";

// Create router
const router = express.Router();

// Sample word list with categories and descriptions
const sampleWords = [
  {
    word: "HELLO",
    category: "Communication",
    description:
      "A friendly greeting used to acknowledge someone's presence or start a conversation",
  },
  {
    word: "WORLD",
    category: "Geography",
    description:
      "The planet Earth, our home in the solar system, inhabited by over 8 billion people",
  },
  {
    word: "JAVASCRIPT",
    category: "Programming",
    description:
      "A high-level programming language that enables interactive web pages and is an essential part of web applications",
  },
  {
    word: "REACT",
    category: "Programming",
    description:
      "A popular JavaScript library for building user interfaces, particularly single-page applications",
  },
  {
    word: "PROGRAMMING",
    category: "Computer Science",
    description:
      "The process of creating instructions for computers to follow, using languages like Python, Java, or C++",
  },
  {
    word: "GEEKSFORGEEKS",
    category: "Education",
    description:
      "A comprehensive computer science portal offering tutorials, articles, and coding challenges for programmers",
  },
  {
    word: "COMPUTER",
    category: "Technology",
    description:
      "An electronic device that processes data according to instructions, consisting of hardware and software components",
  },
  {
    word: "ALGORITHM",
    category: "Computer Science",
    description:
      "A step-by-step procedure or formula for solving a problem, fundamental to computer science and mathematics",
  },
  {
    word: "DATABASE",
    category: "Technology",
    description:
      "An organized collection of structured information stored electronically, designed for efficient retrieval and management",
  },
  {
    word: "NETWORK",
    category: "Technology",
    description:
      "A group of interconnected computers and devices that communicate with each other to share resources and information",
  },
  {
    word: "SECURITY",
    category: "Technology",
    description:
      "The practice of protecting systems, networks, and data from unauthorized access, damage, or theft",
  },
  {
    word: "FRONTEND",
    category: "Web Development",
    description:
      "The user-facing part of a website or application that users interact with directly in their web browsers",
  },
  {
    word: "BACKEND",
    category: "Web Development",
    description:
      "The server-side of an application that handles business logic, database operations, and API communications",
  },
  {
    word: "FRAMEWORK",
    category: "Programming",
    description:
      "A pre-written code structure that provides a foundation for developing software applications more efficiently",
  },
  {
    word: "LIBRARY",
    category: "Programming",
    description:
      "A collection of pre-written code that developers can use to perform common tasks without writing from scratch",
  },
  {
    word: "VARIABLE",
    category: "Programming",
    description:
      "A named storage location in programming that holds data values that can be changed during program execution",
  },
  {
    word: "FUNCTION",
    category: "Programming",
    description:
      "A reusable block of code that performs a specific task and can be called multiple times within a program",
  },
  {
    word: "ARRAY",
    category: "Programming",
    description:
      "A data structure that stores multiple values of the same type in contiguous memory locations, accessible by index",
  },
  {
    word: "OBJECT",
    category: "Programming",
    description:
      "A programming construct that encapsulates data and behavior, representing real-world entities with properties and methods",
  },
  {
    word: "STRING",
    category: "Programming",
    description:
      "A sequence of characters used to represent text in programming, enclosed in quotes",
  },
  {
    word: "NUMBER",
    category: "Programming",
    description:
      "A data type that represents numerical values, including integers and floating-point numbers",
  },
  {
    word: "BOOLEAN",
    category: "Programming",
    description:
      "A data type that can only have two values: true or false, used for logical operations and conditions",
  },
  {
    word: "CONDITION",
    category: "Programming",
    description:
      "A statement that evaluates to true or false, controlling the flow of program execution",
  },
  {
    word: "LOOP",
    category: "Programming",
    description:
      "A programming construct that repeats a block of code multiple times until a condition is met",
  },
  {
    word: "CLASS",
    category: "Programming",
    description:
      "A blueprint for creating objects in object-oriented programming, defining properties and methods",
  },
  {
    word: "METHOD",
    category: "Programming",
    description:
      "A function that belongs to a class or object, performing operations on the object's data",
  },
  {
    word: "INHERITANCE",
    category: "Programming",
    description:
      "A mechanism where one class acquires the properties and methods of another class, promoting code reuse",
  },
  {
    word: "POLYMORPHISM",
    category: "Programming",
    description:
      "The ability of different objects to respond to the same method call in different ways",
  },
  {
    word: "ENCRYPTION",
    category: "Security",
    description:
      "The process of converting data into a coded format to prevent unauthorized access during transmission or storage",
  },
  {
    word: "DECRYPTION",
    category: "Security",
    description:
      "The process of converting encrypted data back to its original readable format",
  },
  {
    word: "AUTHENTICATION",
    category: "Security",
    description:
      "The process of verifying the identity of a user or system before granting access to resources",
  },
  {
    word: "AUTHORIZATION",
    category: "Security",
    description:
      "The process of granting or denying access rights and permissions to authenticated users or systems",
  },
  {
    word: "PHOTOSYNTHESIS",
    category: "Biology",
    description:
      "The process by which plants convert light energy into chemical energy, producing oxygen and glucose from carbon dioxide and water",
  },
  {
    word: "ELECTRICITY",
    category: "Physics",
    description:
      "A form of energy resulting from charged particles, used to power devices and is fundamental to modern technology",
  },
  {
    word: "EVOLUTION",
    category: "Biology",
    description:
      "The gradual change in species over time through natural selection, adaptation, and genetic variation",
  },
  {
    word: "DEMOCRACY",
    category: "Politics",
    description:
      "A system of government where the power is vested in the people, who rule either directly or through elected representatives",
  },
  {
    word: "ECOSYSTEM",
    category: "Environment",
    description:
      "A biological community of interacting organisms and their physical environment, functioning as a unit",
  },
  {
    word: "QUANTUM",
    category: "Physics",
    description:
      "A branch of physics dealing with matter and energy at the smallest scales, where particles exhibit wave-particle duality",
  },
  {
    word: "BLOCKCHAIN",
    category: "Technology",
    description:
      "A decentralized digital ledger that records transactions across multiple computers securely and transparently",
  },
  {
    word: "ARTIFICIAL",
    category: "Technology",
    description:
      "Something made or produced by human beings rather than occurring naturally, often referring to intelligence or systems",
  },
  {
    word: "SUSTAINABLE",
    category: "Environment",
    description:
      "Able to be maintained at a certain rate or level without depleting resources, environmentally responsible",
  },
  {
    word: "MICROPROCESSOR",
    category: "Technology",
    description:
      "An integrated circuit that contains all the functions of a central processing unit of a computer",
  },
  {
    word: "CRYPTOGRAPHY",
    category: "Security",
    description:
      "The practice and study of techniques for secure communication in the presence of adversarial behavior",
  },
];

// Get all words
router.get("/words", (req, res) => {
  // Return all words for now, frontend can randomize
  res.json(sampleWords);
});

export default router;
