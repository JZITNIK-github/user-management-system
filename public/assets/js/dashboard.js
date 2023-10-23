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
        if (rs["response"] == true) {
            window.location.replace("../admin")
        }
    })
}
function change(x, el) {
    document.querySelector("iframe").src = x
    el.parentElement.querySelectorAll("div").forEach(element => {
        element.style.color = "white"
    });
    el.style.color = "#07b9ff"
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
fetch("/api/getPages/",
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
    if (res["data"] == "error") {
        localStorage.removeItem("token")
        window.location.replace("..")
    }
    else {
        const pages = res["data"]
        for (const page of pages) {
            var div = document.createElement("div")
            div.textContent = page["name"]
            div.setAttribute("onclick", "change('"+page.url+"', this)")
            document.querySelector("header").appendChild(div)
        }
    }
})
.catch(function(res){ console.log(res) })