import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Test
app.get('/api/test', (req, res) => {
  res.json({message: "TESTING 123//asdas"});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});