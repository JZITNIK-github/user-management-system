const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const fs = require("fs");
const { port } = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf-8" }));

function isAdmin(token, callback) {
    fs.readFile("./tokens.json", "utf-8", (err, data) => {
        if (err) {
            callback("error")
            return;
        }
        const dat = JSON.parse(data)
        if (Object.keys(dat).includes(token)) {
            const username = dat[token]
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    callback("error")
                    return;
                }
                const user = JSON.parse(data)
                for (const usr of user) {
                    if (usr.username == username) {
                        if (usr.admin) {
                            callback(true)
                        }
                        else {
                            callback(false)
                        }
                        return
                    }
                }
                callback("wrong")
            })
        }
        else {
            callback("wrong")
        }
    })
}


const generateRandomToken = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

app.use(bodyParser.json());
app.use(express.static('public'));

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    fs.readFile('./users.json', 'utf8', async function (err, data) {
        if (err) {
            console.error(err);
            res.sendStatus(500); 
            return;
        }
        const final = JSON.parse(data);
        for (const user of final) {
            if (user.username === username) {
                if (user.password == "") {
                    fs.readFile("./tokens.json", "utf-8", (err, data) => {
                        if (err) {
                            console.error(err);
                            res.sendStatus(500); 
                            return;
                        }
                        const dat = JSON.parse(data)
                        function getToken(data) {
                            const token = generateRandomToken(16)
                            if (Object.keys(dat).includes(token)) {
                                return getToken(data)
                            }
                            return token
                        }
                        const token = getToken(dat)
    
                        dat[token] = username
    
                        fs.writeFile("./tokens.json", JSON.stringify(dat), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            res.status(200).json({token: token, changePass: true, admin: user?.admin})
                        })
                    })
                }
                else {
                    const verifyHashedPassword = async (password, hashedPassword) => {
                        return await bcrypt.compare(password, hashedPassword);
                    };
                    const test = await verifyHashedPassword(password, user.password)
                    if (test) {
                        fs.readFile("./tokens.json", "utf-8", (err, data) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            const dat = JSON.parse(data)
                            function getToken(data) {
                                const token = generateRandomToken(16)
                                if (Object.keys(dat).includes(token)) {
                                    return getToken(data)
                                }
                                return token
                            }
                            const token = getToken(dat)
        
                            dat[token] = username
        
                            fs.writeFile("./tokens.json", JSON.stringify(dat), (err) => {
                                if (err) {
                                    console.error(err);
                                    res.sendStatus(500); 
                                    return;
                                }
                                res.status(200).json({token: token, admin: user?.admin})
                            })
                        })
                    }
                    else {
                        res.status(400).json({token: "none"})
                    }
                }
                return
            }
        }
        res.status(400).json({token: "none"})
    });
});

app.post("/api/setPassword", (req, res) => {
    const {token, password} = req.body
    fs.readFile("./tokens.json", "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            res.sendStatus(500); 
            return;
        }
        const dat = JSON.parse(data)
        if (Object.keys(dat).includes(token)) {
            const username = dat[token]
            fs.readFile("./users.json", "utf-8", async (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                const generateHashedPassword = async (password) => {
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    return hashedPassword;
                };
                const user = JSON.parse(data)

                for (var i = 0; i < user.length; i++) {
                    if (user[i].username == username) {
                        const hashedPassword = await generateHashedPassword(password);
                        user[i].password = hashedPassword
                        fs.writeFile("./users.json", JSON.stringify(user), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            res.status(200).json({"reponse": "success"})
                        })
                        return
                    }
                }
                res.status(400).json({"reponse": "wrongToken"})
            })
        }
        else {
            res.status(400).json({"reponse": "wrongToken"})
        }
    })
})

app.post("/api/getPages", (req, res) => {
    const {token} = req.body
    fs.readFile("./tokens.json", "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            res.sendStatus(500); 
            return;
        }
        const dat = JSON.parse(data)
        if (Object.keys(dat).includes(token)) {
            const username = dat[token]
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }

                const user = JSON.parse(data)

                for (const usr of user) {
                    if (usr.username == username) {
                        res.status(200).json({data: usr.pages})
                        return
                    }
                }
                res.status(400).json({data: "error"})
            })
        }
        else {
            res.status(400).json({data: "error"})
        }
    })
})

app.post("/api/logout", (req, res) => {
    const {token} = req.body
    fs.readFile("./tokens.json", "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            res.sendStatus(500); 
            return;
        }
        const dat = JSON.parse(data)
        if (Object.keys(dat).includes(token)) {
            delete dat[token]
            fs.writeFile("./tokens.json", JSON.stringify(dat), (err) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                res.status(200).json({token: token})
            })
        }
        else {
            res.status(400).json({data: "error"})
        }
    })
})

app.post("/api/admin/isAdmin", (req, res) => {
    const {token} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            res.status(200).json({response: (response === true) ? true : false})
        }
    })
})

app.post("/api/admin/getAllUsers", (req, res) => {
    const {token} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                res.status(200).json({response: "success", data: data})
            })
        }
    })
})

app.post("/api/admin/resetPassword", (req, res) => {
    const {token, username} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                var users = JSON.parse(data)
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username === username) {
                        users[i].password = ""
                        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            res.status(200).json({"reponse": "success"})
                        })
                        return;
                    }
                }
            })
        }
    })
})


app.post("/api/admin/removeAccount", (req, res) => {
    const {token, username} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                var users = JSON.parse(data)
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username === username) {
                        users.splice(i, 1)
                        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }

                            fs.readFile("./tokens.json", "utf-8", (err, tokens) => {
                                if (err) {
                                    console.error(err);
                                    res.sendStatus(500); 
                                    return;
                                }
                                var dat = JSON.parse(tokens)

                                for (const token of Object.keys(dat)) {
                                    if (dat[token] == username) {
                                        delete dat[token]
                                        break;
                                    }
                                }

                                fs.writeFile("./tokens.json", JSON.stringify(dat), (err) => {
                                    if (err) {
                                        console.error(err);
                                        res.sendStatus(500); 
                                        return;
                                    }
                                    res.status(200).json({"reponse": "success"})
                                })
                            })
                        })
                    }
                }
            })
        }
    })
})

app.post("/api/admin/addWebsite", (req, res) => {
    const {token, username, website} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                var users = JSON.parse(data)
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username === username) {
                        users[i].pages.push(website)
                        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            res.status(200).json({"response": "success"})
                        })
                        return;
                    }
                }
            })
        }
    })
})

app.post("/api/admin/removeWebsite", (req, res) => {
    const {token, username, url} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                var users = JSON.parse(data)
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username === username) {

                        for (var j = 0; j < users[i].pages.length; j++){
                            if (users[i].pages[j].url == url) {
                                users[i].pages.splice(j, 1)
                                break
                            }
                        }

                        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500); 
                                return;
                            }
                            res.status(200).json({"response": "success"})
                        })
                        return;
                    }
                }
            })
        }
    })
})

app.post("/api/admin/addUser", (req, res) => {
    const {token, username} = req.body
    isAdmin(token, (response) => {
        if (response == "error") {
            console.error(err);
            res.sendStatus(500); 
        }
        else if (response == "wrong") {
            res.status(400).json({response: "wrong"})
        }
        else {
            fs.readFile("./users.json", "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500); 
                    return;
                }
                var users = JSON.parse(data)
                for (const user of users) {
                    if (user.username == username) {
                        res.status(400).json({response: "duplicate"})
                        return
                    }
                }


                users.push({username: username, password: "", pages: []})

                fs.writeFile("./users.json", JSON.stringify(users), (err) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500); 
                        return;
                    }
                    res.status(200).json({"response": "success"})
                })
            })
        }
    })
})



app.listen(port, () => console.log(`Server běží na portu ${port}!`));
