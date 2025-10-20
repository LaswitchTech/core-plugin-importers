<article id="layout"></article>
<script>
    (function () {
        $(document).ready(function(){
            builder.Layout('index',"#layout",{
                endpoint: '/importers/fetchAll',
                conditions: [
                    {key: 'isArchived', operator: '<>', value: 1},
                    {key: 'task.isArchived', operator: '<>', value: 1},
                ],
                dblclick: function(event, table, dt, node, data){
                    window.location.href = "/importers/details?id=" + data.id + "&name=" + encodeURIComponent(data.vcard.name);
                },
                actions: {
                    details:{
                        label:'Details',
                        icon:'eye',
                        action:function(event, table, dt, node, row, data){
                            window.location.href = "/importers/details?id=" + data.id + "&name=" + encodeURIComponent(data.vcard.name);
                        }
                    },
                    archive:{
                        label:'Archive',
                        icon:'archive',
                        action:function(event, table, dt, node, row, data){
                            builder.Widget('task',{data: data.task.id}).archive(function(){

                                // Remove the record from the table
                                dt.row(row).remove().draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        }
                    },
                },
                buttons: [
                    {
                        extend : 'selected',
                        className : 'btn-warning requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-person-plus"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Assign')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('importers',{data: dt.rows({ selected: true }).data().toArray()}).assign(function(records){

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-primary requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-exclamation-triangle"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Priority')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('importers',{data: dt.rows({ selected: true }).data().toArray()}).priority(function(records){

                                // Refresh the records in the table
                                dt.rows({ selected: true }).data(records).draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-dark requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-archive"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Archive')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('importers',{data: dt.rows({ selected: true }).data().toArray()}).archive(function(records){

                                // Remove the records from the table
                                dt.rows({ selected: true }).remove().draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-info requires-selection-multiple d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-link-45deg"></i><span class="ms-2 d-xl-inline d-none">'+builder.Locale.get('Link')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('importers',{data: dt.rows({ selected: true }).data().toArray()}).link(function(records){

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                ],
                columns: [
                    {
                        targets: 0,
                        visible: false,
                        title: builder.Locale.get('ID'),
                        name: 'id',
                        data: 'id',
                        defaultContent: '',
                    },
                    {
                        targets: 1,
                        visible: true,
                        className: 'all',
                        responsivePriority: 1,
                        title: builder.Locale.get('Name'),
                        name: 'name',
                        data: 'vcard.name',
                        defaultContent: '',
                    },
                    {
                        targets: 2,
                        visible: true,
                        className: 'min-md',
                        responsivePriority: 100,
                        title: builder.Locale.get('DBA'),
                        name: 'dba',
                        data: 'vcard.dba',
                        defaultContent: '',
                    },
                    {
                        targets: 3,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1100,
                        title: builder.Locale.get('Business Number'),
                        name: 'businessNumber',
                        data: 'vcard.businessNumber',
                        defaultContent: '',
                    },
                    {
                        targets: 4,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1200,
                        title: builder.Locale.get('Status'),
                        name: 'status',
                        data: 'task.progress',
                        defaultContent: '',
                    },
                    {
                        targets: 5,
                        visible: true,
                        className: 'min-md',
                        responsivePriority: 150,
                        title: builder.Locale.get('Task'),
                        name: 'task',
                        data: 'task.process',
                        defaultContent: '',
                    },
                    {
                        targets: 6,
                        visible: true,
                        className: 'min-md',
                        responsivePriority: 200,
                        title: builder.Locale.get('Priority'),
                        name: 'priority',
                        data: 'task.priority',
                        defaultContent: '',
                    },
                    {
                        targets: 7,
                        visible: true,
                        className: 'min-md',
                        responsivePriority: 300,
                        title: builder.Locale.get('Assigned To'),
                        name: 'assignedTo',
                        data: 'task.assignedTo.username',
                        defaultContent: '',
                    },
                    {
                        targets: 8,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1300,
                        title: builder.Locale.get('Address'),
                        name: 'address',
                        data: 'vcard.address',
                        defaultContent: '',
                    },
                    {
                        targets: 9,
                        visible: true,
                        className: 'min-md',
                        responsivePriority: 400,
                        title: builder.Locale.get('City'),
                        name: 'city',
                        data: 'vcard.city',
                        defaultContent: '',
                    },
                    {
                        targets: 10,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1400,
                        title: builder.Locale.get('Website'),
                        name: 'website',
                        data: 'vcard.website',
                        defaultContent: '',
                    },
                    {
                        targets: 11,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1500,
                        title: builder.Locale.get('Tags'),
                        name: 'tags',
                        data: 'vcard.tags',
                        defaultContent: '',
                    },
                    {
                        targets: 12,
                        visible: false,
                        className: 'min-md',
                        responsivePriority: 1600,
                        title: builder.Locale.get('Industries'),
                        name: 'industries',
                        data: 'vcard.industries',
                        defaultContent: '',
                    },
                ],
            });
        });
    })();
</script>
