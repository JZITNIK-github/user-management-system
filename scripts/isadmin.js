module.exports = (token, callback) => {
    fs.readFile(paths.token, "utf-8", (err, data) => {
        if (err) {
            callback("error")
            return;
        }
        const dat = JSON.parse(data)
        if (Object.keys(dat).includes(token)) {
            const username = dat[token]
            fs.readFile(paths.users, "utf-8", (err, data) => {
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