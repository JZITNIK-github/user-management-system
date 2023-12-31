if (!localStorage.getItem("token")) {
    window.location.replace("..")
}
else {
    fetch("/api/admin/isAdmin/",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token")})
    })
    .then(rs=>rs.json())
    .then(rs=> {
        if (rs["response"] == "wrong") {
            localStorage.removeItem("token")
        }
        if (!rs["response"] == true) {
            window.location.replace("..")
        }
    })
}
fetch("/api/admin/getAllUsers/",
{
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({token: localStorage.getItem("token")})
})
.then(rs=>rs.json())
.then(rs=> {
    if (rs["response"] == "wrong") {
        localStorage.removeItem("token")
        window.location.replace("..")
    }
    else if (rs["response"] == "success") {
        const allusers = JSON.parse(rs["data"])
        for (const user of allusers) {
            var div = document.createElement("div")
            div.className = "user"
            div.setAttribute("username", user.username)
            if (user.admin) {
                div.setAttribute("admin", true)
                var removeButton = ""
            }
            else {
                var removeButton = `<button onclick="removeAccount(this.parentElement)">Smazat uživatele</button>`
            }

            var contentWebsites = '<h3>Stránky</h3><div class="websites"><button onclick="addWebsite(this.parentElement.parentElement)">Přidat stránku</button>'
            if (user.pages) {
                for (const website of user.pages) {
                    contentWebsites += `<div class="website">
                        <p>Jméno: <span>${website.name}</span></p>
                        <p>Url: <span><a href="${website.url}">${website.url}</a></span></p>
                        <button onclick="removeWebsite(this.parentElement.parentElement.parentElement, '${website.url}')">Odstranit stránku</button>
                    </div>`
                }
            }
            if (user.admin) {
                contentWebsites = ""
            }
            else {
                contentWebsites += "</div>"
            }

            div.innerHTML = `<h3>Informace</h3>
            <p>Uživatelské jméno: <strong><span>${user.username}</span></strong></p>
            <p>Admin: <strong><span>${user["admin"] == true ? "ANO" : "NE"}</span></strong></p>
            <h3>Ovládání</h3>
            <button onclick="resetPassword(this.parentElement)">Resetovat heslo</button>
            <button onclick="logoutAll(this.parentElement)">Odhlásit ze všech zařízení</button>
            ${removeButton}
            ${contentWebsites}`
            document.querySelector(".usersList").appendChild(div)
        }
    }
    else {
        window.location.replace("..")
    }
})
function logoutAll(el) {
    const username = el.getAttribute("username")
    fetch("/api/admin/logoutUser/",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token"), username: username})
    })
    .then(rs=>rs.json())
    .then(rs=> {
        if (rs["response"] == "success") {
            alert("Uživatel byl odhlášen ze všech zařízení!")
        }
        else {
            alert("Nepodařilo se mi odhlásit uživatele!")
        }
    })
}
function resetPassword(el) {
    const username = el.getAttribute("username")
    fetch("/api/admin/resetPassword/",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token"), username: username})
    })
    .then(rs=>rs.json())
    .then(rs=> {
        if (rs["response"] == "success") {
            alert("Heslo bylo resetováno! Při příštím přihlášení bude uživatel vyzván pro nastavení nového hesla.")
        }
        else {
            alert("Heslo se nepovedlo změnit!")
        }
    })
}
function removeAccount(el) {
    const username = el.getAttribute("username")
    const admin = el.getAttribute("admin")
    if (admin) {
        var res = confirm("Pozor! Snažíte se smazat administrátorský účet! Ujistěte se že máte alespoň 2 administrátorské účty. Chcete opravdu smazat účet?")
        if (!res) return
    }
    fetch("/api/admin/removeAccount/",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token"), username: username})
    })
    .then(rs=>rs.json())
    .then(rs=> {
        if (rs["response"] == "success") {
            alert("Uživatel byl smazán")
        }
        else {
            alert("Nepovedlo se smazat uživatele!")
        }
        window.location.reload()
    })
}
function logout() {
    fetch("/api/logout/",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token")})
    })
    .then(res=>res.json())
    .then(res=> {
        localStorage.removeItem("token")
        window.location.replace("..")
    })
    .catch(function(res){ console.log(res) })
}
function addWebsite(el) {
    const username = el.getAttribute("username")
    const name = prompt("Zadejte jméno stránky: ")
    const url = prompt("Zadejte url stránky. Uživatel nesmí mít více stránek se stejnou url!")
    if (name && url) {
        fetch("/api/admin/addWebsite/",
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({token: localStorage.getItem("token"), username: username, website: {name: name, url: url}})
        })
        .then(res=>res.json())
        .then(res=> {
            if (res["response"] == "success") {
                alert("Stránka byla přidána!")
            }
            else {
                alert("Stránka se nepovedla přidat!")
            }
            window.location.reload()
        })
        .catch(function(res){ console.log(res) })
    }
}
function removeWebsite(el, url) {
    const username = el.getAttribute("username")
    fetch("/api/admin/removeWebsite/",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({token: localStorage.getItem("token"), username: username, url: url})
    })
    .then(res=>res.json())
    .then(res=> {
        if (res["response"] == "success") {
            alert("Stránka byla odstraněna!")
        }
        else {
            alert("Nepovedlo se odstranit stránku!")
        }
        window.location.reload()
    })
    .catch(function(res){ console.log(res) })
}

function addUser() {
    const username = prompt("Zadejte uživatelské jméno:")
    if (username) {
        fetch("/api/admin/addUser/",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({token: localStorage.getItem("token"), username: username})
        })
        .then(res=>res.json())
        .then(res=> {
            if (res["response"] == "success") {
                alert("Uživatel byl přidán! Při provním přihlášení bude vyzván k nastavení hesla. Prozatím se přihlašuje bez hesla.")
            }
            else if (res["response"] == "duplicate") {
                alert("Uživatel se stejným uživatelským jménem již existuje!")
            }
            else {
                alert("Nepovedlo se přidat uživatele!")
            }
            window.location.reload()
        })
        .catch(function(res){ console.log(res) })
    }
}
