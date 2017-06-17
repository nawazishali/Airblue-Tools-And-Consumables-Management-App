let DB = require('nedb');
let tools = new DB({
    filename: './db/tools',
    autoload: true
});
tools.insert([{
    a: 5
}, {
    a: 42
}]);
var app = new Vue({
    el: '#app',
    data: {
        message: "Hello World"
    }
})
