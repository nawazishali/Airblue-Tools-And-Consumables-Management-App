let DB = require('diskdb');
DB = DB.connect('./db', ['tools', 'consumables', 'pols']);


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
};
function highlightNSortDueItems(arr, dueItem) {
    arr.forEach((item)=>{
        let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        let dueDt = Date.parse(item[dueItem]);
        let currentDt = Date.parse(new Date());
        let remainingDays = Math.round((dueDt - currentDt)/oneDay);
        if (remainingDays <= 5) {
            item.color = 'red darken1';
        } else if(remainingDays <= 10){
            item.color = 'orange darken1';
        } else if(remainingDays <= 15){
            item.color = 'yellow darken1';
        }
    });
    arr.sort(function (a, b) {
        a = Date.parse(a[dueItem]);
        b = Date.parse(b[dueItem]);
        return a - b;
    });
    return arr;
};

Vue.component('tool-app', {
    template: '#tool-app',
    data: function () {
        return {
            heading: "LIST OF GENERAL/SPECIFIC TOOLS WITH CALIBRATION DATES",
            tools: highlightNSortDueItems(DB.tools.find(), 'Due Date'),
            DB: "tools",
            columns: ['partnumber', 'description', 'ABQ SNo.', 'location', 'Calibration Date', 'Due Date'],
            mode: "",
            editIndex: null,
            searchQuery: "",
            colorQuery: "",
            dueItem: "Due Date",
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
                'color': '',
                historyArr: [{
                    'Date Updated': formatDate(new Date()),
                    location: toolsForm.location.value,
                    'Calibration Date': toolsForm.calibdt.value,
                    'Due Date': toolsForm.duedt.value
                }]
            };
            DB.tools.save(obj);
            this.tools = highlightNSortDueItems(DB.tools.find(), 'Due Date');
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
            tool.historyArr[(tool.historyArr.length) - 1].location = toolsForm.location.value;
            tool.historyArr[(tool.historyArr.length) - 1]['Calibration Date'] = toolsForm.calibdt.value;
            tool.historyArr[(tool.historyArr.length) - 1]['Due Date'] = toolsForm.duedt.value;
            DB.tools.update({
                _id: this.id
            }, tool, {
                multi: false,
                upsert: false
            });
            this.tools = highlightNSortDueItems(DB.tools.find(), 'Due Date');
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
            this.tools = highlightNSortDueItems(DB.tools.find(), 'Due Date');

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
            this.tools = highlightNSortDueItems(DB.tools.find(), 'Due Date');
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
Vue.component('consumable-app', {
    template: '#consumable-app',
    data: function () {
        return {
            heading: "SHELF LIFE CONTROL LIST",
            consumables: highlightNSortDueItems(DB.consumables.find(), 'S.L.E Date'),
            DB: "consumables",
            columns: ['description', 'partnumber', 'Batch#', 'P.O', 'location', 'S.L.E Date'],
            mode: "",
            editIndex: null,
            searchQuery: "",
            colorQuery: "",
            dueItem: "S.L.E Date",
            id: ""
        }
    },
    methods: {
        addConsumable: function () {
            let consumablesForm = document.getElementById('consumables-form');
            let obj = {
                partnumber: consumablesForm.partnumber.value,
                description: consumablesForm.description.value,
                'Batch#': consumablesForm.batch.value,
                location: consumablesForm.location.value,
                'P.O': consumablesForm.po.value,
                'S.L.E Date': consumablesForm.sle.value,
                'color': '',
                historyArr: [{
                    'Date Updated': formatDate(new Date()),
                    location: consumablesForm.location.value,
                    'P.O': consumablesForm.po.value,
                    'S.L.E Date': consumablesForm.sle.value
                }]
            };
            DB.consumables.save(obj);
            this.consumables = highlightNSortDueItems(DB.consumables.find(), 'S.L.E Date');
            //consumablesForm.reset();
            //nextTick waits for the DOM to update after data object has been modified & then excutes given code.
            this.$nextTick(function () {
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        editConsumable: function () {
            let consumablesForm = document.getElementById('consumables-form');
            let consumable = DB.consumables.findOne({
                _id: this.id
            });
            consumable.partnumber = consumablesForm.partnumber.value;
            consumable.description = consumablesForm.description.value;
            consumable['Batch#'] = consumablesForm.batch.value;
            consumable.location = consumablesForm.location.value;
            consumable['P.O'] = consumablesForm.po.value;
            consumable['S.L.E Date'] = consumablesForm.sle.value;
            consumable.historyArr[(consumable.historyArr.length) - 1].location = consumablesForm.location.value;
            consumable.historyArr[(consumable.historyArr.length) - 1]['P.O'] = consumablesForm.po.value;
            consumable.historyArr[(consumable.historyArr.length) - 1]['S.L.E Date'] = consumablesForm.sle.value;
            DB.consumables.update({
                _id: this.id
            }, consumable, {
                multi: false,
                upsert: false
            });
            this.consumables = highlightNSortDueItems(DB.consumables.find(), 'S.L.E Date');
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
        updateConsumable: function () {
            let consumablesForm = document.getElementById('consumables-form');
            let consumable = DB.consumables.findOne({
                _id: this.id
            });
            consumable.location = consumablesForm.location.value;
            consumable['P.O'] = consumablesForm.po.value;
            consumable['S.L.E Date'] = consumablesForm.sle.value;
            let history = {
                'Date Updated': formatDate(new Date()),
                location: consumable.location,
                'P.O': consumable['P.O'],
                'S.L.E Date': consumable['S.L.E Date']
            };
            consumable.historyArr.push(history);
            DB.consumables.update({
                _id: this.id
            }, consumable, {
                multi: false,
                upsert: false
            });
            this.consumables = highlightNSortDueItems(DB.consumables.find(), 'S.L.E Date');

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
        deleteConsumable: function () {
            let consumable = DB.consumables.findOne({
                _id: this.id
            });
            let confirmDelete = confirm("Are you sure you want to delete " + consumable.description + " with Batch/SN: " + consumable['Batch#']);
            if (confirmDelete === true) {
                DB.consumables.remove({
                    _id: this.id
                });
                $('.tooltipped').tooltip('remove');
            };
            this.consumables = highlightNSortDueItems(DB.consumables.find(), 'S.L.E Date');
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
            this.consumables = data.updateDB;
            this.mode = data.updateMode;
            this.editIndex = data.updateIndex;
            this.id = data.updateId;
            if(this.mode === "delete"){
                this.deleteConsumable();
            }
        }

    }
});
Vue.component('pol-app', {
    template: '#pol-app',
    data: function () {
        return {
            heading: "LIST OF P.O.L PARTS",
            pols: highlightNSortDueItems(DB.pols.find(), 'S.L.E Date'),
            DB: "pols",
            columns: ['description', 'partnumber', 'location', 'GRN#', 'S.L.E Date'],
            mode: "",
            editIndex: null,
            searchQuery: "",
            colorQuery: "",
            dueItem: "S.L.E Date",
            id: ""
        }
    },
    methods: {
        addPol: function () {
            let polsForm = document.getElementById('pols-form');
            let obj = {
                partnumber: polsForm.partnumber.value,
                description: polsForm.description.value,
                'GRN#': polsForm.grn.value,
                location: polsForm.location.value,
                'S.L.E Date': polsForm.sle.value,
                'color': '',
                historyArr: [{
                    'Date Updated': formatDate(new Date()),
                    location: polsForm.location.value,
                    'GRN#': polsForm.grn.value,
                    'S.L.E Date': polsForm.sle.value
                }]
            };
            DB.pols.save(obj);
            this.pols = highlightNSortDueItems(DB.pols.find(), 'S.L.E Date');
            //polsForm.reset();
            //nextTick waits for the DOM to update after data object has been modified & then excutes given code.
            this.$nextTick(function () {
                $('.tooltipped').tooltip({
                    delay: 50
                });
            })
        },
        editPol: function () {
            let polsForm = document.getElementById('pols-form');
            let pol = DB.pols.findOne({
                _id: this.id
            });
            pol.partnumber = polsForm.partnumber.value;
            pol.description = polsForm.description.value;
            pol['GRN#'] = polsForm.grn.value;
            pol.location = polsForm.location.value;
            pol['S.L.E Date'] = polsForm.sle.value;
            pol.historyArr[(pol.historyArr.length) - 1].location = polsForm.location.value;
            pol.historyArr[(pol.historyArr.length) - 1]['GRN#'] = polsForm.grn.value;
            pol.historyArr[(pol.historyArr.length) - 1]['S.L.E Date'] = polsForm.sle.value;
            DB.pols.update({
                _id: this.id
            }, pol, {
                multi: false,
                upsert: false
            });
            this.pols = highlightNSortDueItems(DB.pols.find(), 'S.L.E Date');
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
        updatePol: function () {
            let polsForm = document.getElementById('pols-form');
            let pol = DB.pols.findOne({
                _id: this.id
            });
            pol.location = polsForm.location.value;
            pol['GRN#'] = polsForm.grn.value;
            pol['S.L.E Date'] = polsForm.sle.value;
            let history = {
                'Date Updated': formatDate(new Date()),
                location: pol.location,
                'GRN#': pol['GRN#'],
                'S.L.E Date': pol['S.L.E Date']
            };
            pol.historyArr.push(history);
            DB.pols.update({
                _id: this.id
            }, pol, {
                multi: false,
                upsert: false
            });
            this.pols = highlightNSortDueItems(DB.pols.find(), 'S.L.E Date');

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
        deletePol: function () {
            let pol = DB.pols.findOne({
                _id: this.id
            });
            let confirmDelete = confirm("Are you sure you want to delete " + pol.description + " with GRN: " + pol['GRN#']);
            if (confirmDelete === true) {
                DB.pols.remove({
                    _id: this.id
                });
                $('.tooltipped').tooltip('remove');
            };
            this.pols = highlightNSortDueItems(DB.pols.find(), 'S.L.E Date');
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
            this.pols = data.updateDB;
            this.mode = data.updateMode;
            this.editIndex = data.updateIndex;
            this.id = data.updateId;
            if(this.mode === "delete"){
                this.deletepol();
            }
        }

    }
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
        colorKey: String,
        dueItem: String,
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
            var colorKey = this.colorKey
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
                if(sortKey === 'Calibration Date' || sortKey === 'Due Date' || sortKey === 'S.L.E Date') {
                    data = data.sort(function (a, b) {
                        a = Date.parse(a[sortKey]);
                        b = Date.parse(b[sortKey]);
                        return (a - b) * order;
                    })
                } else {
                    data = data.sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
                }

            }
            if (colorKey) {
                console.log(colorKey);
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(colorKey) > -1
                    })
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
                updateDB: highlightNSortDueItems(DB[this.db].find(), this.dueItem),
                updateMode: "delete",
                updateId: this.data[index]._id,
                updateIndex: null
            });
        },
        initiateEditForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.$emit('updateparent', {
                updateDB: highlightNSortDueItems(DB[this.db].find(), this.dueItem),
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
                updateDB: highlightNSortDueItems(DB[this.db].find(), this.dueItem),
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
                updateDB: highlightNSortDueItems(DB[this.db].find(), this.dueItem),
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
        app: 'tool-app',
        filterQuery: ''
    },
    methods: {
        changeApp: function (targetApp) {
            this.app = targetApp;
            console.log(targetApp);
            console.log(this.app);
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
                    /*$('select').material_select();
                    $('select').on('change', event => {
                        choice = event.currentTarget.value;
                        this.filterQuery = choice;
                    });*/
                }, 850);

            })
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
    $('.modal').modal
});
