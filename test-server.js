const express = require('express');
   const app = express();
   const port = 3000; // of 3001 als je dat gebruikt

   app.get('/', (req, res) => {
     res.send('Hello World from Express!');
   });

   app.listen(port, () => {
     console.log(`Test server running on http://localhost:${port}`);
   });
