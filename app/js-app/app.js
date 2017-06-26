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
            columns: ['partnumber', 'description', 'location', 'abqsno', 'calibdt', 'duedt'],
            mode: "",
            editIndex: null,
        }
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
                    updateDt: formatDate(new Date()),
                    location: toolsForm.location.value,
                    calibdt: toolsForm.calibdt.value,
                    duedt: toolsForm.duedt.value
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
        deleteTool: function (index) {
            console.log(index);
            let confirmDelete = confirm("Are you sure you want to delete " + this.tools[index].description + " with SN: " + this.tools[index].abqsno);
            if (confirmDelete === true) {
                DB.tools.remove({
                    _id: this.tools[index]._id
                });
                this.tools = DB.tools.find();
                $('.tooltipped').tooltip('remove');
            }
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
        initiateEditForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "edit";
            this.editIndex = index;
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
        editTool: function (index) {
            let toolsForm = document.getElementById('tools-form')
            this.tools[index].partnumber = toolsForm.partnumber.value;
            this.tools[index].description = toolsForm.description.value;
            this.tools[index].abqsno = toolsForm.abqsno.value;
            this.tools[index].location = toolsForm.location.value;
            this.tools[index].calibdt = toolsForm.calibdt.value;
            this.tools[index].duedt = toolsForm.duedt.value;
            this.tools[index].historyArr[(this.tools[index].historyArr.length) - 1].location = toolsForm.location.value;
            this.tools[index].historyArr[(this.tools[index].historyArr.length) - 1].calibdt = toolsForm.calibdt.value;
            this.tools[index].historyArr[(this.tools[index].historyArr.length) - 1].duedt = toolsForm.duedt.value;
            DB.tools.update({
                _id: this.tools[index]._id
            }, this.tools[index], {
                multi: false,
                upsert: false
            });
            this.tools = DB.tools.find();
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.editIndex = null;
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
        initiateUpdateForm: function (index) {
            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "update";
            this.editIndex = index;
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
        updateTool: function (index) {
            let toolsForm = document.getElementById('tools-form');
            this.tools[index].location = toolsForm.location.value;
            this.tools[index].calibdt = toolsForm.calibdt.value;
            this.tools[index].duedt = toolsForm.duedt.value;
            let history = {
                updateDt: formatDate(new Date()),
                location: this.tools[index].location,
                calibdt: this.tools[index].calibdt,
                duedt: this.tools[index].duedt
            };
            this.tools[index].historyArr.push(history);
            DB.tools.update({
                _id: this.tools[index]._id
            }, this.tools[index], {
                multi: false,
                upsert: false
            });
            this.tools = DB.tools.find();

            $('.tooltipped').tooltip('remove'); //Tooltip kept showing constatly after the form was replaced, so removed it.
            this.mode = "";
            this.editIndex = null;
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
        initiateView: function (index) {
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
        }

    }
});
Vue.component('hello-world', {
    template: '<h1>Hello World </h1>'
});
// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  props: {
    data: Array,
    columns: Array,
    filterKey: String
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
        data = data.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * order
        })
      }
      return data
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
