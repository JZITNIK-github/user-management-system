const fs = require("fs");


(async ()=>{
  await fs.writeFileSync("./users.json", JSON.stringify([
    {
      username: "admin",
      password: "",
      admin: true,
    },
  ]))
  await fs.writeFileSync("./tokens.json", JSON.stringify({}))
  await fs.writeFileSync("./config.json", JSON.stringify({port: 1111}))
  console.log("Resetováno do továrního nastavení")
})()