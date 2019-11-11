const express = require('express');

const server = express();
server.use(express.json());

var projects = [];
var reqCount = 0;

function getRealIndex(id) {
    for (let obj of projects.entries()) {
        if (obj[1].id == id) {
            return obj[0];
        }
    }
}

server.use((req,res,next) => {
    reqCount++;
    return next();
});

function checkProjectId(req,res,next) {
    const { id } = req.params;
    for (let obj of projects.entries()) {
        if (obj[1].id == id) {
            return next();
        }
    }
    return res.status(403).json({failure : 'could not find a project with the specified id'});
}

function checkIfIdIsFilled(req,res,next) {
    const { id } = req.body;
    if (projects.length > 0) {
        for (let obj of projects.entries()) {
            if (obj[1].id == id) {
                return res.status(400).json({error : 'project id is already is use'});        
            }
        }
    }
    return next();
}

function checkBodyId(req,res,next){
    if(!req.body.id) {
        return res.status(400).json({error : 'id is required'});
    }
    return next();
}

function checkBodyProjectTitle(req,res,next) {
    if(!req.body.projectTitle) {
        return res.status(400).json({error : 'projectTitle is required'});
    }
    return next();
}

function checkBodyTaskTitle(req,res,next) {
    if(!req.body.taskTitle) {
        return res.status(400).json({error : 'taskTitle is required'});
    }
    return next();
}

server.get('/projects', (req,res) => {
    return res.send(projects);
});

server.post('/projects', checkBodyId, checkIfIdIsFilled, (req,res) => {
    projects.push(req.body);
    return res.json(projects);
});

server.post('/projects/:id/tasks', checkProjectId, checkBodyTaskTitle, (req,res) => {
    const { id } = req.params;
    const { taskTitle } = req.body;
    let realIndex = getRealIndex(id);
    if (!projects[realIndex].tasks) {
        projects[realIndex].tasks = [];
    }
    projects[realIndex].tasks.push(taskTitle);
    return res.json(projects);
});

server.put('/projects/:id', checkProjectId, checkBodyProjectTitle, (req,res) => {
    const { id } = req.params;
    const { projectTitle } = req.body;
    let realIndex = getRealIndex(id);
    projects[realIndex].projectTitle = projectTitle;
    return res.json(projects);
});

server.delete('/projects/:id', checkProjectId, (req, res) => {
    const { id } = req.params;
    let realIndex = getRealIndex(id);
    projects.splice(realIndex,1);
    return res.send();
});

server.listen(3000);