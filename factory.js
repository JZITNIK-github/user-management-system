const fs = require("fs").promises;

(async () => {
  try {
    await fs.writeFile("./users.json", JSON.stringify([
      {
        username: "admin",
        password: "",
        admin: true,
      },
    ]));
    await fs.writeFile("./tokens.json", JSON.stringify({}));
    await fs.writeFile("./config.json", JSON.stringify({ port: 1111 }));
    console.log("Resetováno do továrního nastavení");
  } catch (error) {
    console.error("Nastala chyba při resetování do továrního nastavení:", error);
  }
})();