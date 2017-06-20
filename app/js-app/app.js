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
        addTool: function () {
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
            //nextTick waits for the DOM to update after data object has been modified & then excutes given code.
            this.$nextTick(function () {
                $('.tooltipped').tooltip({delay: 50});
            })
        },
        deleteTool: function (index) {
            let confirmDelete = confirm("Are you sure you want to delete " + this.tools[index].description + " with SN: " + this.tools[index].abqsno);
            if (confirmDelete === true) {
                this.tools.splice(index, 1);
            }
        }
    }
})

var dropdown1 = new Vue({
    el: '#dropdown1',
    data: {
        items: ['Tools', 'P.O.L', 'Consumables']
    },
    methods: {
        changeHeading: function () {
            toolsApp.heading = 'Hello & Welcome';
        }
    }
})


$(document).ready(function () {
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $('.tooltipped').tooltip({
        delay: 50
    });
});
