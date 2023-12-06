if (localStorage.getItem("token")) {
    window.location.replace("/dashboard")
}
document.querySelector(".submit").addEventListener("click", () => {
    const username = document.querySelector(".username").value
    const password = document.querySelector(".password").value
    fetch("/api/login/",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({username: username, password: password})
    })
    .then(res=>res.json())
    .then(res=> {
        if (res["token"] == "none") {
            $( "#wrongpass" ).dialog({buttons: {"OK": function() {$(this).dialog("close")}}});
            document.querySelector(".password").value = ""
        }
        else {
            localStorage.setItem("token", res.token)
            if (res["changePass"]) {
                $("#passprompt").dialog({
                    autoOpen: true,
                    modal: true,
                    buttons: {
                        "Odeslat": function() {
                        var password = $("#password").val();
                            if (password != "") {
                                $(this).dialog("close");
                                fetch("/api/setPassword/",
                                {
                                    headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                    },
                                    method: "POST",
                                    body: JSON.stringify({token: res.token, password: password})
                                })
                                .then(rs=>rs.json())
                                .then(rs=> {
                                    if (!rs["response"] == "success") {
                                        alert("Heslo se nepovedlo nastavit! Budete požádání o nastavení nového hesla při příštím přihlášení.")
                                    }

                                    if (res.admin) {
                                        window.location.replace("/admin")
                                    }
                                    else {
                                        window.location.replace("/dashboard")
                                    }
                                })
                            } else {
                                $( "#alert" ).dialog({buttons: {"OK": function() {$(this).dialog("close")}}});
                            }
                        }
                    }
                });
            }
            else {
                localStorage.setItem("token", res.token)
                if (res.admin) {
                    window.location.replace("/admin")
                }
                else {
                    window.location.replace("/dashboard")
                }
            }
        }
    })
    .catch(function(res){ console.log(res) })
})
