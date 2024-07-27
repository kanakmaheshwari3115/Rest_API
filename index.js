const express = require("express");
const users = require ("./MOCK_DATA.json")
const fs = require("fs");
const { error } = require("console");
const app = express();
const PORT = 8000;

//middleware
app.use(express.urlencoded({extended : false}));

//another middleware function
app.use((req, res, next)=>{
    fs.appendFile('log.text', `${Date.now()} : ${req.ip} ${req.method} : ${req.path} \n` , (err,data)=>{
        next();
    })
})

// app.use((req, res, next)=>{
//     console.log("Hello from middleware 2");
//     return res.end("Hey, we're done :)")
// })

app.get('/users', (req, res) =>{
    const html = `
    <ul>
        ${users.map((user)=> `<li>${user.first_name}</li>`).join(" ")}
    </ul>
    ` ;
    return res.send(html);
})
//html in put

app.get('/api/users', (req, res) =>{
    // res.setHeader('X-myHead' , 'Kanak');       //custom headers -- add X-<name>
    console.log(req.headers);
    return res.json(users);
})
//json input

app.route('/api/users/:id')
.get((req, res)=>{
    const id = Number(req.params.id);
    const user = users.find((user)=> user.id === id);
    if (!user) return res.status(404).json({error : 'User not found!'})
    return res.json(user);
})
.patch((req, res)=>{
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (!user) return res.status(404).json({error: 'User not found!'});
    
    const { first_name, last_name, email, gender, job_title } = req.body;
    
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (gender) user.gender = gender;
    if (job_title) user.job_title = job_title;

    fs.writeFile('MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) return res.status(500).json({error: 'Failed to update user...'});
        return res.json({'status': 'success', 'user': user});
    });
    return res.json({'status' : 'pending'});
})
.delete((req, res)=>{
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return res.status(404).json({error: 'User not found...'});

    users.splice(userIndex, 1);

    fs.writeFile('MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) return res.status(500).json({error: 'Failed to delete user...'});
        return res.json({'status': 'success'});
    });
    return res.json({'status' : 'pending'});
})
//route with id

app.post('/api/users', (req, res)=>{
    const body = req.body;
    if (!body || !body.first_name ||  !body.last_name ||  !body.email ||  !body.gender ||  !body.job_title){
        return res.status(400).json({msg : "All fields are required..."})
    }
    users.push({id : users.length + 1, ...body});
    fs.writeFile('MOCK_DATA.json', JSON.stringify(users), (err, data)=>{
        return res.status(201).json({'status' : 'success', 'id': users.length});
    });
});
//post

app.listen(PORT, ()=> {
    console.log(`Server started at port: ${PORT}`);
});