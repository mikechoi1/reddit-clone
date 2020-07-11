const express = require('express');
require('./services/passport');

const app = express();
require('./routes/authRoutes')(app);

const pool = require('./db');

//middleware
app.use(express.json()); //let's us use req.body

//Routes


//test route for heroku postgres
app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

//create
app.post('/add', async(req, res) => {
    try {
        const { name } = req.body;
        const { age } = req.body;
        const { description } = req.body;
        const newUser = await pool.query("INSERT INTO account (name, age, description) VALUES($1, $2, $3) RETURNING *", [name, age, description]);
        res.json(newUser.rows);
    } catch (err) {
        console.log(err.message);
    }
});
//get all
app.get('/users', async (req, res) => {
    try {
       const allUsers = await pool.query('SELECT * FROM account');
       res.json(allUsers.rows);
    } catch (err) {
        console.log(err);
    }
})
//get one
app.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const getUser = await pool.query('SELECT * FROM account WHERE id = $1', [id]);
        res.json(getUser.rows);
    } catch (err) {
        console.log(err.message);
    }
})
//update one
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { age } = req.body;
        const { description } = req.body;
        const updateUser = await pool.query('UPDATE account SET name=$1, age=$2, description=$3 WHERE id=$4', [name, age, description, id]);
        res.json('User ' + id + ' was updated');
    } catch (err) {
        console.log(err.message);
    }
})
//delete one
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await pool.query('DELETE FROM account where id=$1', [id]);
        res.json('User ' + id + ' was deleted');
    } catch (err) {
        console.log(err.message);
    }
})

//if production environments are given, otherwise use 5000 (for development)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server has started on port 5000');
});