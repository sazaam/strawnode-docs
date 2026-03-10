

function addHeaders(res) {
    res.setRequestHeader("Access-Control-Allow-Origin", "*");
    res.setRequestHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-Myapp');
    res.setRequestHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setRequestHeader('Access-Control-Expose-Headers', 'X-Myapp, X-Requested-With');
};


var getData = function getData(url, success) {
    var request = new XMLHttpRequest();
    // addHeaders(request) ;
    request.open("GET", url, true);
    request.setRequestHeader("X-Myapp","super");
    request.setRequestHeader("X-Myapp","awesome");
    request.onload = function() {
        if (request.status === 200) {
            success(request.response);
        }
    };
    request.send(null);
  }

trace('HEY YOOOO')

getData(
    'http://localhost:6446/js/test_app/package.json',
    function(response){
        console.log('finished getting data');
        trace(response)
        var data = JSON.parse(response);
        document.getElementById('testzone').innerHTML = data.name;
    });