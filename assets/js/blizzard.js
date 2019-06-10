/* global $
   global localStorage
*/
const client_id = "9f6b9ba0b39245708f42e5f93cd1114f";
const client_secret = "gR6CowcHZDJa5LU348yBI0uhDkGSzTbn";

var token = localStorage.getItem("access_token") || null;
var expires_at = localStorage.getItem("expires_at") || null;

function getToken() {
    if (token === null || expires_at < new Date()) {
        return $.ajax({
                method: "POST",
                url: "https://eu.battle.net/oauth/token",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + window.btoa(client_id + ":" + client_secret));
                },
                data: {
                    grant_type: "client_credentials"
                }
            })
            .done(function(data) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("expires_at", new Date() + parseInt(data.expires_in, 10));
                return data.access_token;
            });
    }
    else {
        return token;
    }
}

function getClasses() {
    return $.when(getToken())
        .then(function(token) {
            return $.getJSON("https://eu.api.blizzard.com/wow/data/character/classes", { access_token: token })
                .then(function(data) {
                    return $(data.classes).map(function() {
                        return { id: this.id, name: this.name };
                    });
                });
        });
}

$.when(getClasses()).then(function(data) {
    console.log(data);
});
