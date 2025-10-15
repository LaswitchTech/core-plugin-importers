// Register dashboard widgets only if dashboard is defined
if(typeof dashboard !== "undefined"){

    // Register - New Importer Counter Widget
    // A simple counter widget for the dashboard to count new importers based on conditions
    // by default it counts all new importers, but can be filtered by owner or other conditions
    dashboard.add('counter-importers-new', class extends dashboard.Widget {
        _init(){
            this._properties = {
                name: "counter-importers-new",
                label: "New Importer Counter",
                description: "A simple counter widget to count new importers based on conditions.",
                minSize: 1,
                maxSize: 12,
                interval: 10000,
                autoStart: true,
            };
            this._options = {
                title: this._options.title || this._properties.label,
                timeframe: this._options.timeframe || 'day', // day, week, month, year, total
                owner: this._options.owner || 'all', // All, or specific username
                icon: this._options.icon || 'building',
                color: this._options.color || 'success',
                type: this._options.type || 'prospects', // prospects, clients
            };
            this._badge = null;
        }

        conditions(){
            const conditions = [
                {key: 'isArchived', operator: '<>', value: 1},
                {key: 'task.isArchived', operator: '<>', value: 1},
            ];
            const key = this._options.type === 'importers' ? 'created' : 'client.created';
            switch(this._options.timeframe){
                case 'day':
                    conditions.push({key: key, operator: '>', value: moment().subtract(1, 'days').format('YYYY-MM-DD')});
                    break;
                case 'week':
                    conditions.push({key: key, operator: '>', value: moment().subtract(7, 'days').format('YYYY-MM-DD')});
                    break;
                case 'month':
                    conditions.push({key: key, operator: '>', value: moment().subtract(30, 'days').format('YYYY-MM-DD')});
                    break;
                case 'year':
                    conditions.push({key: key, operator: '>', value: moment().subtract(365, 'days').format('YYYY-MM-DD')});
                    break;
            }
            if(this._options.owner && this._options.owner !== 'all'){
                conditions.push({key: 'assignedTo', operator: '=', value: this._options.owner});
            }
            return conditions;
        }

        title(){
            switch(this._options.timeframe){
                case 'day':
                    this._options.title = 'Prospects today';
                    break;
                case 'week':
                    this._options.title = 'Prospects this week';
                    break;
                case 'month':
                    this._options.title = 'Prospects this month';
                    break;
                case 'year':
                    this._options.title = 'Prospects this year';
                    break;
                case 'total':
                    this._options.title = 'Total Prospects';
                    break;
            }
            switch(this._options.type){
                case 'importers':
                    break;
                case 'clients':
                    this._options.title = this._options.title.replace('Prospects', 'Clients');
                    break;
            }
            switch(this._options.owner){
                case 'all':
                    break;
                default:
                    this._options.title = 'My ' + this._options.title.toLowerCase();
                    break;
            }
            return this._options.title;
        }

        _create(){
            const self = this;

            // Create the Badge
            this._builder.Component(
                "badge",
                this._component.gadget,
                {
                    icon: this._options.icon,
                    color: this._options.color,
                },
                function(badge,component){

                    // Set the badge
                    self._badge = badge;

                    // Set Content
                    component.label = $(document.createElement("h5")).addClass("m-0").text(self._builder.Locale.get(self.title())).appendTo(component.content);
                    component.count = $(document.createElement("p")).addClass("m-0").text(0).appendTo(component.content);
                },
            );
        }

        _load(){
            const self = this;
            API.endpoint('/importers/count').data({conditions: this.conditions()}).execute(function(response){
                self.load(response.count);
            });
        }

        _render(){
            if(this._badge){
                this._badge._component.label.text(this._builder.Locale.get(this.title()));
                this._badge._component.count.text(this._data !== null ? this._data : '0');
                this._badge._component.iconFrame.attr('class','d-flex justify-content-center align-items-center rounded text-bg-'+this._options.color);
                this._badge._component.icon.attr('class','fs-3 bi bi-'+this._options.icon);
            }
        }

        _config(form){

            // type
            form.add(
                'select',
                {
                    name: 'type',
                    label: this._builder.Locale.get('Type'),
                    placeholder: this._builder.Locale.get('Select a type'),
                    options: [
                        {id: 'prospects', text: this._builder.Locale.get('Prospects')},
                        {id: 'clients', text: this._builder.Locale.get('Clients')},
                    ],
                    value: this._options.type,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // timeframe
            form.add(
                'select',
                {
                    name: 'timeframe',
                    label: this._builder.Locale.get('Timeframe'),
                    placeholder: this._builder.Locale.get('Select a timeframe'),
                    options: [
                        {id: 'day', text: this._builder.Locale.get('Today')},
                        {id: 'week', text: this._builder.Locale.get('This week')},
                        {id: 'month', text: this._builder.Locale.get('This month')},
                        {id: 'year', text: this._builder.Locale.get('This year')},
                        {id: 'total', text: this._builder.Locale.get('Total')},
                    ],
                    value: this._options.timeframe,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // owner
            form.add(
                'select',
                {
                    name: 'owner',
                    label: this._builder.Locale.get('Owner'),
                    placeholder: this._builder.Locale.get('Select an owner'),
                    options: [
                        {id: 'all', text: this._builder.Locale.get('All of them')},
                        {id: USER_ID, text: this._builder.Locale.get('Mine only')},
                    ],
                    value: this._options.owner,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                }
            );

            // color
            form.add(
                'select2',
                {
                    name: 'color',
                    label: this._builder.Locale.get('Color'),
                    placeholder: this._builder.Locale.get('Select a color'),
                    options: this.colors(),
                    value: this._options.color,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                    callback:{
                        format: function(option, component){
                            if (!option.id) { return option.text; }
                            return $('<div class="px-3 py-2 animate-flicker-hover text-bg-' +  option.element.value.toLowerCase() + '" style="margin: -.375rem -.75rem!important;">' + option.text + '</div>');;
                        },
                    },
                }
            );

            // icon
            form.add(
                'select2',
                {
                    name: 'icon',
                    label: this._builder.Locale.get('Icon'),
                    placeholder: this._builder.Locale.get('Select an icon'),
                    options: this.icons(),
                    value: this._options.icon,
                    class: {
                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                    },
                    callback:{
                        format: function(option, component){
                            if (!option.id) { return option.text; }
                            return $('<span class=""><i class="me-2 text-bg-light p-1 fs-4 rounded bi bi-' +  option.element.value.toLowerCase() + '"></i>' + option.text + '</span>');
                        },
                    },
                }
            );
        }
    });
}

// Create a Importer
function process_function_ImporterCreate(task, value, callback = null){

    // Check if the target is loaded
    if(task.target === 'undefined'){
        return;
    }

    // Initialize variables
    var clientID = null;
    var leadID = null;
    var vcardID = null;

    // Handle different target tables
    switch(task.targetTable){
        case 'clients':
            clientID = task.targetId;
            leadID = task.target.lead.id;
            vcardID = task.target.vcard.id;
            break;
        case 'leads':
            clientID = task.target.client.id;
            leadID = task.targetId;
            vcardID = task.target.vcard.id;
            break;
        default:
            return;
    }

    // Check if the task is already linked to an Importer
    console.log(task);
    if(typeof task.target.importer !== 'undefined' && task.target.importer.id !== null){

        // Execute Callback
        if(typeof callback === "function"){
            callback(task);
        }

        return;
    }

    // AJAX Request
    API.endpoint('/importers/create').data({client: clientID, lead: leadID, vcard: vcardID}).execute(function(response){
        // Execute Callback
        if(typeof callback === "function"){
            callback(task, response);
        }
    });
}
function process_meta_ImporterCreate(key = null){
    const metadata = {
        label: "Create an Importer Profile",
        description: "Create an Importer Profile from a Client",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}

// Verify if the client is Delegated
function process_function_ClientIsDelegated(task, value, callback = null){

    // Check if the target is loaded
    if(task.target === 'undefined'){
        return;
    }

    // Initialize clientID
    var clientID = null;

    // Handle different target tables
    switch(task.targetTable){
        case 'clients':
            clientID = task.targetId;
            break;
        case 'importers':
        case 'leads':
            clientID = task.target.client.id;
            break;
        default:
            return;
    }

    // AJAX Request
    API.endpoint('/clients/fetch?id='+clientID).execute(function(response, endpoint){

        // Check if the Client is Delegated
        if(response.record.isDelegated){

            // Execute Callback
            if(typeof callback === "function"){
                callback(task, response);
            }
        }
    });
}
function process_meta_ClientIsDelegated(key = null){
    const metadata = {
        label: "Is Client Delegated?",
        description: "Check if the Client is Delegated",
        type: "none",
    };
    return metadata[key] ? metadata[key] : metadata;
}
