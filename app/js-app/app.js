let DB = require('diskdb');
DB = DB.connect('./db', ['tools']);


function formatDate(date) {
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    let hours = function () {
        var hrs = date.getHours();
        if (hrs > 12) {
            if (hrs - 12 < 10) {
                return '0' + (hrs - 12);
            } else {
                return (hrs - 12);
            }
            return date.getHours() - 12;
        } else if (hrs === 0) {
            return 12;
        } else {
            return date.getHours();
        }
    };
    let minutes = function () {
        if (date.getMinutes() < 10) {
            return '0' + date.getMinutes();
        } else {
            return date.getMinutes();
        }
    };
    let amPM = function () {
        if (date.getHours() > 12) {
            return "PM";
        } else {
            return "AM";
        }
    };
    let time = hours() + ':' + minutes() + ' ' + amPM();

    return day + ' ' + monthNames[monthIndex] + ', ' + year + ' ' + time;
}

Vue.component('tool-app', {
    template: '#tool-app',
    data: function () {
        return {
            heading: "Tools Management",
            tools: DB.tools.find(),
            DB: "tools",
            columns: ['partnumber', 'description', 'ABQ SNo.', 'location', 'Calibration Date', 'Due Date'],
            mode: "",
            editIndex: null,
            id: ""
        }
    },
    methods: {
        addTool: function () {
            let toolsForm = document.getElementById('tools-form');
            let obj = {
                partnumber: toolsForm.partnumber.value,
                description: toolsForm.description.value,
                'ABQ SNo.': toolsForm.abqsno.value,
                location: toolsForm.location.value,
                'Calibration Date': toolsForm.calibdt.value,
                'Due Date': toolsForm.duedt.value,
                historyArr: [{
                    'Date Updated': formatDate(new Date()),
                    location: toolsForm.location.value,
                    'Calibration Date': toolsForm.calibdt.value,
                    'Due Date': toolsForm.duedt.value
                }]
            };
            DB.tools.save(obj);
            this.tools = DB.tools.find();
            //toolsForm.reset();
            //nextTick waits for the DOM to update after data object has been modified & then excutes given code.
            this.$nextTick(function () {
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        editTool: function () {
            let toolsForm = document.getElementById('tools-form');
            let tool = DB.tools.findOne({
                _id: this.id
            });
            tool.partnumber = toolsForm.partnumber.value;
            tool.description = toolsForm.description.value;
            tool['ABQ SNo.'] = toolsForm.abqsno.value;
            tool.location = toolsForm.location.value;
            tool['Calibration Date'] = toolsForm.calibdt.value;
            tool['Due Date'] = toolsForm.duedt.value;
            tool.historyArr[(this.tools[index].historyArr.length) - 1].location = toolsForm.location.value;
            tool.historyArr[(this.tools[index].historyArr.length) - 1]['Calibration Date'] = toolsForm.calibdt.value;
            tool.historyArr[(this.tools[index].historyArr.length) - 1]['Due Date'] = toolsForm.duedt.value;
            DB.tools.update({
                _id: this.id
            }, tool, {
                multi: false,
                upsert: false
            });
            this.tools = DB.tools.find();
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.id = "";
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        updateTool: function () {
            let toolsForm = document.getElementById('tools-form');
            let tool = DB.tools.findOne({
                _id: this.id
            });
            tool.location = toolsForm.location.value;
            tool['Calibration Date'] = toolsForm.calibdt.value;
            tool['Due Date'] = toolsForm.duedt.value;
            let history = {
                'Date Updated': formatDate(new Date()),
                location: tool.location,
                'Calibration Date': tool['Calibration Date'],
                'Due Date': tool['Due Date']
            };
            tool.historyArr.push(history);
            DB.tools.update({
                _id: this.id
            }, tool, {
                multi: false,
                upsert: false
            });
            this.tools = DB.tools.find();

            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.id = "";
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        deleteTool: function () {
            let tool = DB.tools.findOne({
                _id: this.id
            });
            let confirmDelete = confirm("Are you sure you want to delete " + tool.description + " with SN: " + tool['ABQ SNo.']);
            if (confirmDelete === true) {
                DB.tools.remove({
                    _id: this.id
                });
                $('.tooltipped').tooltip('remove');
            };
            this.tools = DB.tools.find();
            this.mode = "";
            this.id = "";
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            });
        },
        cancel: function () {
            this.mode = "";
            this.editIndex = null;
            this.id = "";
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                //restoring tooltip functionality
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            })
        },
        updateParent: function (data) {
            this.tools = data.updateDB;
            this.mode = data.updateMode;
            this.editIndex = data.updateIndex;
            this.id = data.updateId;
            if(this.mode === "delete"){
                this.deleteTool();
            }
        }

    }
});
Vue.component('hello-world', {
    template: '<h1>Hello World </h1>'
});
// register the grid component
Vue.component('tool-table', {
    template: '#table-template',
    props: {
        data: Array,
        db: String,
        id: String,
        columns: Array,
        filterKey: String,
        mode: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    computed: {
        filteredData: function () {
            var sortKey = this.sortKey
            var filterKey = this.filterKey && this.filterKey.toLowerCase()
            var order = this.sortOrders[sortKey] || 1
            var data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                    })
                })
            }
            if (sortKey) {
                data = data.sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
            }
            return data;
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        },
        initiateDelete: function (index) {
            this.$emit('updateparent', {
                updateDB: DB[this.db].find(),
                updateMode: "delete",
                updateId: this.data[index]._id,
                updateIndex: null
            });
        },
        initiateEditForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$emit('updateparent', {
                updateDB: DB[this.db].find(),
                updateMode: "edit",
                updateId: this.data[index]._id,
                updateIndex: index
            });
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            });
        },
        initiateUpdateForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$emit('updateparent', {
                updateDB: DB[this.db].find(),
                updateMode: "update",
                updateId: this.data[index]._id,
                updateIndex: index
            });
            this.$nextTick(function () {
                $('.datepicker').pickadate({
                    closeOnSelect: true,
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15 // Creates a dropdown of 15 years to control year
                });
                $('.tooltipped').tooltip({
                    delay: 50
                });
                Materialize.updateTextFields();
            })
        },
        initiateView: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$emit('updateparent', {
                updateDB: DB[this.db].find(),
                updateMode: "",
                updateId: this.data[index]._id,
                updateIndex: index
            });
            this.$nextTick(function () {
                $('.tooltipped').tooltip({
                    delay: 50
                });
                $('.modal').modal();
                $('#modal1').modal('open');
            });
        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
        app: 'hello-world'
    },
    methods: {
        changeApp: function () {
            if (this.app === 'hello-world') {
                this.app = 'tool-app';
            } else {
                this.app = 'hello-world';
            }
            this.$nextTick(function () {
                setTimeout(function () {
                    $('.datepicker').pickadate({
                        closeOnSelect: true,
                        selectMonths: true, // Creates a dropdown to control month
                        selectYears: 15 // Creates a dropdown of 15 years to control year
                    });
                    $('.tooltipped').tooltip({
                        delay: 50
                    });
                    Materialize.updateTextFields();
                }, 750);

            })
        }
    }
});

var dropdown1 = new Vue({
    el: '#dropdown1',
    data: {
        items: ['Tools', 'P.O.L', 'Consumables']
    },
    methods: {
        changeHeading: function () {
            app.heading = 'Hello & Welcome';
        }
    }
});



$(document).ready(function () {
    $('.datepicker').pickadate({
        closeOnSelect: true,
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $('.tooltipped').tooltip({
        delay: 50
    });
    $('.modal').modal();
});
