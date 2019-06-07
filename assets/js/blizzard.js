const client_id = "9f6b9ba0b39245708f42e5f93cd1114f";
const client_secret = "gR6CowcHZDJa5LU348yBI0uhDkGSzTbn";

var request = new XMLHttpRequest();
var formData = new FormData();

formData.append("grant_type", "client_credentials");

request.open("POST", "https://eu.battle.net/oauth/token", true);
request.setRequestHeader("Authorization", "Basic " + window.btoa(client_id + ":" + client_secret));

request.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        var data = JSON.parse(this.response);
        const access_token = data.access_token;
        console.log(access_token);
    }
};

request.send(formData);