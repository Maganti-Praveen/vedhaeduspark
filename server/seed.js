const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Subject = require('./models/Subject');
const Problem = require('./models/Problem');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Problem.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@vedhaeduspark.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@vedhaeduspark.com',
      password: 'user123',
      role: 'user',
    });

    console.log('✅ Users created');

    // Create courses
    const courses = await Course.insertMany([
      {
        title: 'Data Structures & Algorithms',
        description: 'Master DSA from basics to advanced. Learn arrays, linked lists, trees, graphs, dynamic programming, and more. Prepare for top tech company interviews.',
        instructor: 'Dr. Rajesh Kumar',
        duration: '12 weeks',
        level: 'Intermediate',
        topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Sorting'],
        price: 0,
        rating: 4.8,
      },
      {
        title: 'Database Management Systems',
        description: 'Comprehensive DBMS course covering relational model, SQL, normalization, transactions, indexing, and NoSQL databases.',
        instructor: 'Prof. Meena Sharma',
        duration: '8 weeks',
        level: 'Beginner',
        topics: ['SQL', 'Normalization', 'ER Model', 'Transactions', 'Indexing'],
        price: 0,
        rating: 4.6,
      },
      {
        title: 'Operating Systems',
        description: 'Deep dive into OS concepts: process management, memory management, file systems, deadlocks, and synchronization.',
        instructor: 'Dr. Anil Verma',
        duration: '10 weeks',
        level: 'Intermediate',
        topics: ['Processes', 'Threads', 'Memory', 'Deadlocks', 'File Systems'],
        price: 0,
        rating: 4.7,
      },
      {
        title: 'Computer Networks',
        description: 'Learn networking fundamentals: OSI model, TCP/IP, routing, switching, network security, and protocols.',
        instructor: 'Prof. Sunita Reddy',
        duration: '8 weeks',
        level: 'Beginner',
        topics: ['OSI Model', 'TCP/IP', 'Routing', 'DNS', 'HTTP', 'Security'],
        price: 0,
        rating: 4.5,
      },
      {
        title: 'Web Development (MERN Stack)',
        description: 'Full-stack web development with MongoDB, Express.js, React, and Node.js. Build real-world projects from scratch.',
        instructor: 'VedhaEduSpark Team',
        duration: '16 weeks',
        level: 'Beginner',
        topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        price: 0,
        rating: 4.9,
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to ML: supervised learning, unsupervised learning, neural networks, and practical implementations with Python.',
        instructor: 'Dr. Priya Nair',
        duration: '10 weeks',
        level: 'Advanced',
        topics: ['Regression', 'Classification', 'Clustering', 'Neural Networks', 'Python'],
        price: 0,
        rating: 4.7,
      },
    ]);

    console.log('✅ Courses created');

    // Create subjects
    const subjects = await Subject.insertMany([
      {
        name: 'Data Structures & Algorithms',
        description: 'Core DSA concepts and problem solving techniques',
        icon: '🧮',
        courseId: courses[0]._id,
        order: 1,
        notes: [
          { title: 'Introduction to DSA', content: '# Introduction to Data Structures & Algorithms\n\n## What are Data Structures?\nData structures are ways of organizing and storing data so that they can be accessed and modified efficiently.\n\n## Why Learn DSA?\n- **Problem Solving**: DSA teaches you how to break down complex problems\n- **Interviews**: Top tech companies focus heavily on DSA\n- **Performance**: Understanding DSA helps write efficient code\n\n## Types of Data Structures\n\n### Linear Data Structures\n1. **Arrays** - Collection of elements stored at contiguous memory locations\n2. **Linked Lists** - Elements connected through pointers\n3. **Stacks** - LIFO (Last In, First Out)\n4. **Queues** - FIFO (First In, First Out)\n\n### Non-Linear Data Structures\n1. **Trees** - Hierarchical structure\n2. **Graphs** - Network of nodes and edges\n3. **Hash Tables** - Key-value pair storage\n\n## Time Complexity\n- O(1) - Constant\n- O(log n) - Logarithmic\n- O(n) - Linear\n- O(n log n) - Linearithmic\n- O(n²) - Quadratic', order: 1 },
          { title: 'Arrays & Strings', content: '# Arrays & Strings\n\n## Arrays\nAn array is a collection of items stored at contiguous memory locations.\n\n### Operations\n- **Access**: O(1)\n- **Search**: O(n)\n- **Insert**: O(n)\n- **Delete**: O(n)\n\n### Common Techniques\n1. **Two Pointer Technique**\n2. **Sliding Window**\n3. **Prefix Sum**\n4. **Kadane\'s Algorithm**\n\n## Strings\nStrings are sequences of characters.\n\n### Common Problems\n- Palindrome check\n- Anagram detection\n- String reversal\n- Pattern matching (KMP, Rabin-Karp)', order: 2 },
        ],
        videos: [
          { title: 'DSA Introduction - Complete Roadmap', youtubeUrl: 'https://www.youtube.com/embed/rZ41y93P2Qo', duration: '15:30', order: 1 },
          { title: 'Arrays - From Zero to Hero', youtubeUrl: 'https://www.youtube.com/embed/QJR2pV8Gr2E', duration: '45:00', order: 2 },
        ],
        roadmap: [
          { step: 1, title: 'Learn Basics', description: 'Time/Space complexity, Big O notation' },
          { step: 2, title: 'Arrays & Strings', description: 'Basic operations, two pointers, sliding window' },
          { step: 3, title: 'Linked Lists', description: 'Singly, doubly, circular linked lists' },
          { step: 4, title: 'Stacks & Queues', description: 'Implementation, applications, problems' },
          { step: 5, title: 'Trees', description: 'Binary trees, BST, AVL, traversals' },
          { step: 6, title: 'Graphs', description: 'BFS, DFS, shortest path, MST' },
          { step: 7, title: 'Dynamic Programming', description: 'Memoization, tabulation, classic problems' },
        ],
      },
      {
        name: 'Database Management Systems',
        description: 'Relational databases, SQL, and modern database concepts',
        icon: '🗄️',
        courseId: courses[1]._id,
        order: 2,
        notes: [
          { title: 'Introduction to DBMS', content: '# Introduction to DBMS\n\n## What is a Database?\nA database is an organized collection of structured information stored electronically.\n\n## DBMS vs File System\n| Feature | DBMS | File System |\n|---------|------|-------------|\n| Data Redundancy | Minimal | High |\n| Data Consistency | Yes | No |\n| Data Security | High | Low |\n| Concurrent Access | Yes | No |\n\n## Types of DBMS\n1. **Relational (RDBMS)** - MySQL, PostgreSQL, Oracle\n2. **NoSQL** - MongoDB, Cassandra\n3. **Object-Oriented** - db4o\n4. **Hierarchical** - IBM IMS', order: 1 },
        ],
        videos: [
          { title: 'DBMS Complete Course', youtubeUrl: 'https://www.youtube.com/embed/kBdlM6hNDAE', duration: '60:00', order: 1 },
        ],
        roadmap: [
          { step: 1, title: 'Database Basics', description: 'What is DBMS, types, advantages' },
          { step: 2, title: 'ER Model', description: 'Entities, relationships, ER diagrams' },
          { step: 3, title: 'Relational Model', description: 'Relations, keys, constraints' },
          { step: 4, title: 'SQL', description: 'DDL, DML, DCL, joins, subqueries' },
          { step: 5, title: 'Normalization', description: '1NF, 2NF, 3NF, BCNF' },
        ],
      },
      {
        name: 'Operating Systems',
        description: 'Core OS concepts and system programming',
        icon: '⚙️',
        courseId: courses[2]._id,
        order: 3,
        notes: [
          { title: 'Introduction to OS', content: '# Introduction to Operating Systems\n\n## What is an OS?\nAn operating system is system software that manages computer hardware and provides services for applications.\n\n## Functions of OS\n1. Process Management\n2. Memory Management\n3. File System Management\n4. I/O Management\n5. Security\n\n## Types of OS\n- Batch OS\n- Time-Sharing OS\n- Distributed OS\n- Real-Time OS\n- Mobile OS', order: 1 },
        ],
        videos: [
          { title: 'Operating Systems - Full Course', youtubeUrl: 'https://www.youtube.com/embed/bkSWJJZNgf8', duration: '55:00', order: 1 },
        ],
        roadmap: [
          { step: 1, title: 'OS Basics', description: 'Types, functions, system calls' },
          { step: 2, title: 'Process Management', description: 'Processes, threads, scheduling' },
          { step: 3, title: 'Synchronization', description: 'Mutex, semaphores, monitors' },
          { step: 4, title: 'Deadlocks', description: 'Detection, prevention, avoidance' },
          { step: 5, title: 'Memory Management', description: 'Paging, segmentation, virtual memory' },
        ],
      },
      {
        name: 'Computer Networks',
        description: 'Networking protocols, architecture, and security',
        icon: '🌐',
        courseId: courses[3]._id,
        order: 4,
        notes: [
          { title: 'Introduction to CN', content: '# Introduction to Computer Networks\n\n## What is a Computer Network?\nA computer network is a set of computers connected together to share resources.\n\n## Types of Networks\n- **LAN** - Local Area Network\n- **MAN** - Metropolitan Area Network\n- **WAN** - Wide Area Network\n\n## OSI Model (7 Layers)\n1. Physical\n2. Data Link\n3. Network\n4. Transport\n5. Session\n6. Presentation\n7. Application\n\n## TCP/IP Model (4 Layers)\n1. Network Access\n2. Internet\n3. Transport\n4. Application', order: 1 },
        ],
        videos: [
          { title: 'Computer Networks - Complete Course', youtubeUrl: 'https://www.youtube.com/embed/VwN91x5i25g', duration: '50:00', order: 1 },
        ],
        roadmap: [
          { step: 1, title: 'Network Basics', description: 'Types, topologies, transmission media' },
          { step: 2, title: 'OSI & TCP/IP', description: 'Layer architecture, protocols' },
          { step: 3, title: 'Data Link Layer', description: 'Framing, error detection, MAC' },
          { step: 4, title: 'Network Layer', description: 'IP addressing, routing algorithms' },
          { step: 5, title: 'Transport Layer', description: 'TCP, UDP, flow control' },
        ],
      },
    ]);

    console.log('✅ Subjects created');

    // Create problems
    await Problem.insertMany([
      {
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
        difficulty: 'Easy',
        topic: 'Arrays',
        inputFormat: 'First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target value',
        outputFormat: 'Two space-separated indices',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
        sampleTestCases: [
          { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
          { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
        ],
        hiddenTestCases: [
          { input: '2\n3 3\n6', output: '0 1' },
          { input: '5\n1 5 3 7 2\n8', output: '1 2' },
        ],
      },
      {
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as a single line.',
        difficulty: 'Easy',
        topic: 'Strings',
        inputFormat: 'A single string',
        outputFormat: 'The reversed string',
        constraints: '1 <= s.length <= 10^5',
        sampleTestCases: [
          { input: 'hello', output: 'olleh', explanation: 'Reverse of hello is olleh' },
          { input: 'VedhaEduSpark', output: 'krapSudEahdeV', explanation: '' },
        ],
        hiddenTestCases: [
          { input: 'abcdef', output: 'fedcba' },
          { input: 'a', output: 'a' },
        ],
      },
      {
        title: 'Fibonacci Number',
        description: 'Given a number `n`, find the nth Fibonacci number.\n\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\nF(0) = 0, F(1) = 1\nF(n) = F(n-1) + F(n-2) for n > 1',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        inputFormat: 'A single integer n',
        outputFormat: 'The nth Fibonacci number',
        constraints: '0 <= n <= 30',
        sampleTestCases: [
          { input: '5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5' },
          { input: '10', output: '55', explanation: '' },
        ],
        hiddenTestCases: [
          { input: '0', output: '0' },
          { input: '1', output: '1' },
          { input: '20', output: '6765' },
        ],
      },
      {
        title: 'Palindrome Check',
        description: 'Given a string, determine if it is a palindrome. Consider only alphanumeric characters and ignore cases.',
        difficulty: 'Easy',
        topic: 'Strings',
        inputFormat: 'A single string',
        outputFormat: 'true or false',
        constraints: '1 <= s.length <= 2 * 10^5',
        sampleTestCases: [
          { input: 'racecar', output: 'true', explanation: 'racecar reads same forwards and backwards' },
          { input: 'hello', output: 'false', explanation: '' },
        ],
        hiddenTestCases: [
          { input: 'madam', output: 'true' },
          { input: 'ab', output: 'false' },
        ],
      },
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
        difficulty: 'Medium',
        topic: 'Arrays',
        inputFormat: 'First line: n (size of array)\nSecond line: n space-separated integers',
        outputFormat: 'Maximum subarray sum',
        constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
        sampleTestCases: [
          { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6' },
          { input: '1\n1', output: '1', explanation: '' },
        ],
        hiddenTestCases: [
          { input: '5\n5 4 -1 7 8', output: '23' },
          { input: '3\n-1 -2 -3', output: '-1' },
        ],
      },
      {
        title: 'Merge Two Sorted Arrays',
        description: 'Given two sorted arrays `arr1` and `arr2`, merge them into a single sorted array.',
        difficulty: 'Easy',
        topic: 'Arrays',
        inputFormat: 'First line: n (size of arr1)\nSecond line: n sorted integers\nThird line: m (size of arr2)\nFourth line: m sorted integers',
        outputFormat: 'Merged sorted array (space-separated)',
        constraints: '0 <= n, m <= 10^4',
        sampleTestCases: [
          { input: '3\n1 3 5\n3\n2 4 6', output: '1 2 3 4 5 6', explanation: '' },
        ],
        hiddenTestCases: [
          { input: '2\n1 2\n2\n3 4', output: '1 2 3 4' },
          { input: '4\n1 2 3 4\n1\n0', output: '0 1 2 3 4' },
        ],
      },
      {
        title: 'Longest Common Subsequence',
        description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        inputFormat: 'First line: text1\nSecond line: text2',
        outputFormat: 'Length of longest common subsequence',
        constraints: '1 <= text1.length, text2.length <= 1000',
        sampleTestCases: [
          { input: 'abcde\nace', output: '3', explanation: 'The longest common subsequence is "ace" of length 3' },
          { input: 'abc\nabc', output: '3', explanation: '' },
        ],
        hiddenTestCases: [
          { input: 'abc\ndef', output: '0' },
          { input: 'abcdef\nacf', output: '3' },
        ],
      },
      {
        title: 'Binary Search',
        description: 'Given a sorted array of integers and a target value, return the index of target if found, else return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
        difficulty: 'Easy',
        topic: 'Searching',
        inputFormat: 'First line: n (size of array)\nSecond line: n sorted integers\nThird line: target value',
        outputFormat: 'Index of target or -1',
        constraints: '1 <= n <= 10^4\n-10^4 <= nums[i] <= 10^4',
        sampleTestCases: [
          { input: '6\n-1 0 3 5 9 12\n9', output: '4', explanation: '9 exists at index 4' },
          { input: '6\n-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist in array' },
        ],
        hiddenTestCases: [
          { input: '1\n5\n5', output: '0' },
          { input: '3\n1 2 3\n4', output: '-1' },
        ],
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        difficulty: 'Easy',
        topic: 'Stacks',
        inputFormat: 'A single string of brackets',
        outputFormat: 'true or false',
        constraints: '1 <= s.length <= 10^4',
        sampleTestCases: [
          { input: '()', output: 'true', explanation: '' },
          { input: '()[]{}', output: 'true', explanation: '' },
          { input: '(]', output: 'false', explanation: '' },
        ],
        hiddenTestCases: [
          { input: '([)]', output: 'false' },
          { input: '{[]}', output: 'true' },
        ],
      },
      {
        title: 'Graph BFS Traversal',
        description: 'Given a graph represented as an adjacency list with `n` nodes (0-indexed), perform BFS traversal starting from node 0 and print the order of visited nodes.',
        difficulty: 'Medium',
        topic: 'Graphs',
        inputFormat: 'First line: n (number of nodes) and e (number of edges)\nNext e lines: u v (edge from u to v)',
        outputFormat: 'BFS traversal order (space-separated)',
        constraints: '1 <= n <= 1000\n0 <= e <= n*(n-1)/2',
        sampleTestCases: [
          { input: '4 4\n0 1\n0 2\n1 3\n2 3', output: '0 1 2 3', explanation: 'BFS from node 0' },
        ],
        hiddenTestCases: [
          { input: '3 2\n0 1\n1 2', output: '0 1 2' },
        ],
      },
      {
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        inputFormat: 'A single integer n',
        outputFormat: 'Number of distinct ways',
        constraints: '1 <= n <= 45',
        sampleTestCases: [
          { input: '2', output: '2', explanation: '1+1 or 2' },
          { input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
        ],
        hiddenTestCases: [
          { input: '4', output: '5' },
          { input: '5', output: '8' },
        ],
      },
      {
        title: 'Matrix Chain Multiplication',
        description: 'Given a sequence of matrices, find the most efficient way to multiply these matrices together. The problem is not actually to perform the multiplications, but merely to decide in which order to perform them.\n\nGiven an array `p[]` which represents dimensions of matrices, find minimum number of multiplications needed.',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        inputFormat: 'First line: n (number of elements in p[])\nSecond line: n space-separated integers',
        outputFormat: 'Minimum number of multiplications',
        constraints: '2 <= n <= 100\n1 <= p[i] <= 500',
        sampleTestCases: [
          { input: '4\n1 2 3 4', output: '18', explanation: '((A1*A2)*A3) = 1*2*3 + 1*3*4 = 6 + 12 = 18' },
        ],
        hiddenTestCases: [
          { input: '5\n10 20 30 40 30', output: '30000' },
        ],
      },
    ]);

    console.log('✅ Problems created');
    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@vedhaeduspark.com / admin123');
    console.log('   User:  user@vedhaeduspark.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
