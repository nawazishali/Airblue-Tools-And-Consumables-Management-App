let DB = require('nedb');
let tools = new DB({
    filename: './db/tools',
    autoload: true
});



/*tools.insert([{
    a: 5
}, {
    a: 42
}]);*/


var toolsApp = new Vue({
    el: '#tools-app',
    data: {
        heading: "Tools Management",
        tools: []
    },
    methods: {
        addTool: function(){
            let toolsForm = document.getElementById('tools-form');
            let obj = {
                partnumber: toolsForm.partnumber.value,
                description: toolsForm.description.value,
                location: toolsForm.location.value,
                abqsno: toolsForm.abqsno.value,
                calibdt: toolsForm.calibdt.value,
                duedt: toolsForm.duedt.value,
                historyArr: []
            }
            this.tools.push(obj);
        }
    }
})

var dropdown1 = new Vue({
    el: '#dropdown1',
    data: {
        items: ['Tools', 'P.O.L', 'Consumables']
    },
    methods: {
        changeHeading: function() {
            toolsApp.heading = 'Hello & Welcome';
        }
    }
})

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
  });
