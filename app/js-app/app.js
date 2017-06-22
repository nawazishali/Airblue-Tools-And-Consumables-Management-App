/*let DB = require('nedb');
let tools = new DB({
    filename: './db/tools',
    autoload: true
});*/



/*tools.insert([{
    a: 5
}, {
    a: 42
}]);*/


var toolsApp = new Vue({
    el: '#tools-app',
    data: {
        heading: "Tools Management",
        tools: [],
        mode: "",
        editIndex: null,
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
                historyArr: [{
                    location: toolsForm.location.value,
                    calibdt: toolsForm.calibdt.value,
                    duedt: toolsForm.duedt.value
                }]
            };
            //toolsForm.reset();
            this.tools.push(obj);
            //nextTick waits for the DOM to update after data object has been modified & then excutes given code.
            this.$nextTick(function () {
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        deleteTool: function (index) {
            let confirmDelete = confirm("Are you sure you want to delete " + this.tools[index].description + " with SN: " + this.tools[index].abqsno);
            if (confirmDelete === true) {
                this.tools.splice(index, 1);
            }
        },
        initiateEditForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "edit";
            this.editIndex = index;
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            })
        },
        editTool: function (index) {
            let toolsForm = document.getElementById('tools-form')
            this.tools[index].partnumber = toolsForm.partnumber.value;
            this.tools[index].description = toolsForm.description.value;
            this.tools[index].abqsno = toolsForm.abqsno.value;
            this.tools[index].location = toolsForm.location.value;
            this.tools[index].calibdt = toolsForm.calibdt.value;
            this.tools[index].duedt = toolsForm.duedt.value;
            console.log(this.tools[index].historyArr);
            this.tools[index].historyArr[(this.tools[index].historyArr.length)-1] = {
                location: toolsForm.location.value,
                calibdt: toolsForm.calibdt.value,
                duedt: toolsForm.duedt.value
            };
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.editIndex = null;
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        initiateUpdateForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "update";
            this.editIndex = index;
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            })
        },
        updateTool: function (index) {
            let toolsForm = document.getElementById('tools-form');
            this.tools[index].location = toolsForm.location.value;
            this.tools[index].calibdt = toolsForm.calibdt.value;
            this.tools[index].duedt = toolsForm.duedt.value;
            let history = {
                location: this.tools[index].location,
                calibdt: this.tools[index].calibdt,
                duedt: this.tools[index].duedt
            };
            this.tools[index].historyArr.push(history);
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.editIndex = null;
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        initiateView: function(index){
            this.editIndex = index;
            this.$nextTick(function () {
                $('.modal').modal();
                $('#modal1').modal('open');
            });
        },
        cancel: function () {
            this.mode = "";
            this.editIndex = null;
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            })
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
    $('.modal').modal();
});
