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
