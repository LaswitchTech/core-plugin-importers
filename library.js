builder.add('layouts','importer', class extends builder.ComponentClass {

    #interval = null;

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            id: null,
            table: 'importers',
            interval: 15000,
            autoStart: true,
            callback: {},
        };
        this._data = {};
        this._widgets = {};
        this._priorities = [
            {name: 'Low', color: 'secondary', icon: 'exclamation-triangle'},
            {name: 'Normal', color: 'primary', icon: 'info-circle'},
            {name: 'High', color: 'warning', icon: 'exclamation-circle'},
            {name: 'Urgent', color: 'orange', icon: 'exclamation-diamond'},
            {name: 'Critical', color: 'danger', icon: 'exclamation-square'},
        ];
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'importer' + this._id,
            'class': 'importer-profile',
        });
        this._component.id = this._component.attr('id');

        // Add Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Fetch Importer Data
        API.endpoint('/'+this._properties.table+'/fetch?id=' + this._properties.id).execute(function(response){

            // Set Data
            self._data = response;

            // Layout
            self._component.details = $(document.createElement('div')).addClass('importer-details').appendTo(self._component);
            self._component.steps = $(document.createElement('div')).addClass('importer-steps').appendTo(self._component);
            self._component.tabs = $(document.createElement('div')).addClass('importer-tabs').appendTo(self._component);

            // Controls
            self._component.details.controls = $(document.createElement('div')).addClass('controls').appendTo(self._component.details);
            self._component.details.controls.group = $(document.createElement('div')).addClass('btn-group').appendTo(self._component.details.controls);

            // Control - Edit
            if(self._data.extensions.includes('vcards')){
                self._component.details.controls.group.edit = $(document.createElement('button')).attr({
                    "type": "button",
                    "data-action": "edit",
                    "data-vcard": self._data.record.vcard.id,
                    "class": "btn btn-sm btn-warning",
                }).text(self._builder.Locale.get('Edit')).appendTo(self._component.details.controls.group);
                self._component.details.controls.group.edit.icon = $(document.createElement('i')).addClass('bi bi-pencil me-1').prependTo(self._component.details.controls.group.edit);
                self._component.details.controls.group.edit.click(function(){
                    self._builder.Widget('vcard',{mode:'edit',data: self._data.record.vcard.id});
                });
            }

            // Control - Archive
            if(self._data.extensions.includes('tasks')){
                self._component.details.controls.group.archive = $(document.createElement('button')).attr({
                    "type": "button",
                    "data-action": "archive",
                    "data-vcard": self._data.record.vcard.id,
                    "class": "btn btn-sm btn-dark",
                }).text(self._builder.Locale.get('Archive')).appendTo(self._component.details.controls.group);
                self._component.details.controls.group.archive.icon = $(document.createElement('i')).addClass('bi bi-archive me-1').prependTo(self._component.details.controls.group.archive);
                self._component.details.controls.group.archive.click(function(){
                    self._builder.Widget('task',{data: self._data.record.task.id}).archive(function(data){
                        // Refresh the page
                        window.reload();
                    });
                });
            }

            // Logo
            self._component.details.logo = $(document.createElement('div')).addClass('logo').appendTo(self._component.details);
            self._component.details.logo.favicon = $(document.createElement('div')).addClass('favicon').appendTo(self._component.details.logo);
            self._component.details.logo.favicon.img = $(document.createElement('img')).attr({
                "src": '/avatar?id=' + self._data.record.vcard.id,
            }).appendTo(self._component.details.logo.favicon);
            self._component.details.logo.favicon.click(function(){
                self._builder.Widget('vcard',{mode:'upload',data: self._data.record.vcard.id});
            });

            // Name and DBA
            self._component.details.name = $(document.createElement('div')).attr({
                "class": "name",
            }).appendTo(self._component.details.logo);
            self._component.details.name.fullname = $(document.createElement('h3')).attr({
            }).text(self._data.record.vcard.name).appendTo(self._component.details.name);
            self._component.details.name.dba = $(document.createElement('h4')).attr({
                "class": "text-muted",
            }).text(self._data.record.vcard.dba).appendTo(self._component.details.name);
            self._component.details.name.click(function(){
                self._builder.Widget('vcard',{data: self._data.record.vcard.id});
            });

            // Body
            self._component.details.body = $(document.createElement('div')).addClass('body row g-3').appendTo(self._component.details);

            // Task
            if(self._data.extensions.includes('tasks')){
                self._component.details.body.task = {}
                for(const [key, value] of Object.entries(self._data.record.task)){
                    switch(key){
                        case 'assignedTo':
                            self._component.details.body.task[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-4 hover task-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.task[key].header = $(document.createElement('p')).text(self._builder.Locale.get('Assigned To')).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].object = $(document.createElement('div')).attr({
                                "data-type": 'assigned',
                                "data-task-id": self._data.record.task.id,
                            }).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].object.username = $(document.createElement('span')).attr({
                            }).text(self._data.record.task.assignedTo.username ?? self._builder.Locale.get('Unassigned')).appendTo(self._component.details.body.task[key].object);
                            self._component.details.body.task[key].object.avatar = $(document.createElement('img')).attr({
                                "alt": "user",
                                "src": "/avatar?username="+self._data.record.task.assignedTo.username ?? 'Unassigned',
                            }).prependTo(self._component.details.body.task[key].object);
                            self._component.details.body.task[key].click(function(){
                                self._builder.Widget('task',{data: self._data.record.task.id}).assign();
                            });
                            break;
                        case 'progress':
                            self._component.details.body.task[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-4 task-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.task[key].header = $(document.createElement('p')).text(self._builder.Locale.get('Status')).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].object = $(document.createElement('h4')).attr({
                                "data-type": key,
                            }).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].badge = $(document.createElement('span')).attr({
                                "class": "badge",
                                "data-type": key,
                                "data-task-id": self._data.record.task.id,
                            }).appendTo(self._component.details.body.task[key].object);
                            if(self._data.record.task.progress > 0){
                                self._component.details.body.task[key].badge.addClass('text-bg-'+self._data.record.task.process[self._data.record.task.progress].color);
                                self._component.details.body.task[key].badge.html('<i class="me-1 bi bi-'+self._data.record.task.process[self._data.record.task.progress].icon+'"></i>'+self._builder.Locale.get(self._data.record.task.process[self._data.record.task.progress].name));
                            } else {
                                self._component.details.body.task[key].badge.addClass('text-bg-success').html('<i class="me-1 bi bi-stars"></i>'+builder.Locale.get('New'));
                            }
                            break;
                        case 'priority':
                            self._component.details.body.task[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-4 hover task-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.task[key].header = $(document.createElement('p')).text(self._builder.Locale.get('Priority')).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].object = $(document.createElement('h4')).attr({
                                "data-type": key,
                            }).appendTo(self._component.details.body.task[key]);
                            self._component.details.body.task[key].badge = $(document.createElement('span')).attr({
                                "class": "badge",
                                "data-type": key,
                                "data-task-id": self._data.record.task.id,
                            }).appendTo(self._component.details.body.task[key].object);
                            self._component.details.body.task[key].badge.addClass('text-bg-'+self._priorities[value].color);
                            self._component.details.body.task[key].badge.html('<i class="me-1 bi bi-'+self._priorities[value].icon+'"></i>'+self._builder.Locale.get(self._priorities[value].name));
                            self._component.details.body.task[key].click(function(){
                                self._builder.Widget('task',{data: self._data.record.task.id}).priority();
                            });
                            break;
                    }
                }
            }

            // vCard
            if(self._data.extensions.includes('vcards')){
                self._component.details.body.vcard = {}
                for(const [key, value] of Object.entries(self._data.record.vcard)){
                    switch(key){
                        case 'address':
                            self._component.details.body.vcard[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-8 vcard-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.vcard[key].header = $(document.createElement('p')).text(self._builder.Locale.get(key)).appendTo(self._component.details.body.vcard[key]);
                            self._component.details.body.vcard[key].object = $(document.createElement('div')).attr({
                                "data-type": key,
                                "data-vcard-id": self._data.record.vcard.id,
                            }).text(self._data.record.vcard.address + (self._data.record.vcard.city ? ', ' + self._data.record.vcard.city : '') + (self._data.record.vcard.state.name ? ', ' + self._data.record.vcard.state.name : '') + (self._data.record.vcard.zipcode ? ', ' + self._data.record.vcard.zipcode : '') + (self._data.record.vcard.country.name ? ', ' + self._data.record.vcard.country.name : '')).appendTo(self._component.details.body.vcard[key]);
                            break;
                        case 'phone':
                            self._component.details.body.vcard[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-4 hover vcard-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.vcard[key].header = $(document.createElement('p')).text(self._builder.Locale.get(key)).appendTo(self._component.details.body.vcard[key]);
                            self._component.details.body.vcard[key].object = $(document.createElement('button')).attr({
                                "class": "btn btn-link text-decoration-none",
                                "type": "button",
                                "data-type": key,
                                "data-vcard-id": self._data.record.vcard.id,
                            }).html('<i class="me-1 bi bi-telephone"></i>'+value).appendTo(self._component.details.body.vcard[key]);
                            self._component.details.body.vcard[key].click(function(){
                                self._builder.Widget('followups',{render:false,type:'Call',targetTable:self._properties.table,targetId:self._properties.id,default:self._data.record.vcard.id}).create();
                            });
                            break;
                        case 'tags':
                        case 'industries':
                            const color = (key === 'tags') ? 'warning' : 'primary';
                            const icon = (key === 'tags') ? 'tag' : 'crosshair';
                            self._component.details.body.vcard[key] = $(document.createElement('div')).attr({
                                'class': 'col-12 col-lg-6 vcard-'+key,
                            }).appendTo(self._component.details.body);
                            self._component.details.body.vcard[key].header = $(document.createElement('p')).text(self._builder.Locale.get(key)).appendTo(self._component.details.body.vcard[key]);
                            self._component.details.body.vcard[key].object = $(document.createElement('div')).attr({
                                "class": "d-flex justify-content-start align-items-start flex-wrap",
                                "data-type": key,
                                "data-vcard-id": self._data.record.vcard.id,
                            }).appendTo(self._component.details.body.vcard[key]);
                            for(const [k, unique] of Object.entries(value ?? [])){
                                $(document.createElement('span')).attr({
                                    'class': 'badge text-start text-wrap m-1 text-bg-'+color,
                                    'style': 'font-size: 0.8rem; max-width: 250px;',
                                }).html('<i class="me-1 bi bi-'+icon+'"></i>'+unique).appendTo(self._component.details.body.vcard[key].object);
                            }
                            break;
                    }
                }
            }

            // Tabs
            self._component.tabs.component = self._builder.Component(
                "tabs",
                self._component.tabs,
                {
                    class: {
                        navbar: 'nav-pills',
                    },
                },
                function(tabs,card){

                    // Set Tabs
                    self._component.tabs.tabs = tabs;
                    self._component.tabs.card = card;

                    // Styling
                    card.tabs = {};
                    card._component.card.addClass('importer-tabs-card');
                    card._component.body.removeClass('card-body').addClass('row m-0');
                    tabs._content.addClass('col-12 col-lg-8 p-0 order-2 order-lg-1');
                    self._component.tasks = $(document.createElement('div')).addClass('col-12 col-lg-4 p-0 tasks order-1 order-lg-2').appendTo(card._component.body);

                    // Notes
                    if(self._data.extensions.includes('notes')){

                        // Add the tab
                        tabs.add(
                            'notes',
                            {
                                icon: "stickies",
                                label: builder.Locale.get("Notes"),
                            },
                            function(tab,nav){
                                card.tabs.notes = tab;
                                self._widgets.notes = self._builder.Widget('notes',tab,{data: self._data.dependencies.notes ?? {},targetTable: self._properties.table,targetId: self._properties.id})
                            },
                        );
                    }

                    // Contacts
                    if(self._data.extensions.includes('contacts')){

                        // Add the Contacts tab
                        tabs.add(
                            'contacts',
                            {
                                icon: "person-vcard",
                                label: builder.Locale.get("Contacts"),
                            },
                            function(tab,nav){
                                card.tabs.contacts = tab;
                                self._widgets.contacts = self._builder.Widget("contacts",tab,{data: self._data.dependencies.contacts ?? {},targetTable: 'vcards',targetId: self._data.record.vcard.id, default: self._data.record.vcard});
                            },
                        );
                    }

                    // Followups
                    if(self._data.extensions.includes('followups')){

                        // Set Followups
                        card.tabs.followups = {};
                        self._widgets.followups = {};

                        // Add the Followups tab - Calls
                        tabs.add(
                            'calls',
                            {
                                icon: "telephone",
                                label: builder.Locale.get("Calls"),
                            },
                            function(tab,nav){
                                card.tabs.followups.calls = tab;
                                self._widgets.followups.calls = self._builder.Widget("followups",tab,{data: self._data.dependencies.followups ?? {},type:'Call',targetTable: self._properties.table,targetId: self._properties.id});
                            },
                        );

                        // Add the Followups tab - Callbacks
                        tabs.add(
                            'callbacks',
                            {
                                icon: "telephone-forward",
                                label: builder.Locale.get("Callbacks"),
                            },
                            function(tab,nav){
                                card.tabs.followups.callbacks = tab;
                                self._widgets.followups.callbacks = self._builder.Widget("followups",tab,{data: self._data.dependencies.followups ?? {},type:'Callback',targetTable: self._properties.table,targetId: self._properties.id});
                            },
                        );

                        // Add the Followups tab - Meetings
                        tabs.add(
                            'meetings',
                            {
                                icon: "calendar2-event",
                                label: builder.Locale.get("Meetings"),
                            },
                            function(tab,nav){
                                card.tabs.followups.meetings = tab;
                                self._widgets.followups.meetings = self._builder.Widget("followups",tab,{data: self._data.dependencies.followups ?? {},type:'Meeting',targetTable: self._properties.table,targetId: self._properties.id});
                            },
                        );
                    }

                    // Event
                    if(self._data.extensions.includes('event')){

                        // Add the Event tab
                        tabs.add(
                            'event',
                            {
                                icon: "activity",
                                label: builder.Locale.get("Activity"),
                            },
                            function(tab,nav){
                                card.tabs.event = tab;
                                self._widgets.event = self._builder.Widget("events",tab,{data: self._data.dependencies.event ?? {},targetTable: self._properties.table,targetId: self._properties.id});
                            },
                        );
                    }

                    // Task
                    if(self._data.extensions.includes('tasks')){
                        self._widgets.tasks = self._builder.Widget(
                            "processTree",
                            self._component.tasks,
                            {
                                class: {
                                    steps: 'border-bottom p-3 py-2',
                                    pagination: 'p-3 py-2 btn-group rounded-0 w-100 border-bottom',
                                },
                                data: self._data.record.task.id,
                            },
                            function(widget,component){
                                widget.controls().appendTo(self._component.steps)
                            }
                        );
                    }

                    // Relationship
                    if(self._data.extensions.includes('relationship')){

                        // Create the Relationship widget
                        self._widgets.relationship = self._builder.Widget("related",self._component.tasks,{data: self._data.dependencies.relationship ?? {},targetTable: self._properties.table,targetId: self._properties.id});
                    }

                    // Check if autoStart is enabled
                    if(self._properties.autoStart){
                        // Start
                        setTimeout(function(){
                            self.start();
                        }, self._properties.interval);
                    }
                },
            );
        });
    }

    data(){
        return this._data;
    }

    start(){

        // Set Self
        const self = this;

        // Check if the interval is already set
        if(this.#interval){
            console.warn('Interval is already set, stopping the previous one.');
            clearInterval(this.#interval);
        }

        // Set the interval to check for changes
        this.#interval = setInterval(function(){
            self.load();
        }, this._properties.interval);
    }

    stop(){
        // Check if the interval is set
        if(this.#interval){
            clearInterval(this.#interval);
            this.#interval = null;
        } else {
            console.warn('No interval is currently set.');
        }
    }

    load(){

        // Set Self
        const self = this;

        // Fetch Importer Data
        API.endpoint('/'+this._properties.table+'/fetch?id=' + this._properties.id).execute(function(response){
            self._data = response;
            self.render();
        });
    }

    render(){

        // Set Self
        const self = this;

        // vCard
        if(self._data.extensions.includes('vcards')){

            // Logo
            self._component.details.logo.favicon.img.attr({
                "src": '/avatar?id=' + self._data.record.vcard.id,
            });

            // Name and DBA
            self._component.details.name.fullname.text(self._data.record.vcard.name);
            self._component.details.name.dba.text(self._data.record.vcard.dba);

            // Address
            self._component.details.body.vcard.address.object.text(self._data.record.vcard.address + (self._data.record.vcard.city ? ', ' + self._data.record.vcard.city : '') + (self._data.record.vcard.state.name ? ', ' + self._data.record.vcard.state.name : '') + (self._data.record.vcard.zipcode ? ', ' + self._data.record.vcard.zipcode : '') + (self._data.record.vcard.country.name ? ', ' + self._data.record.vcard.country.name : ''));

            // Phone
            self._component.details.body.vcard.phone.object.html('<i class="me-1 bi bi-telephone"></i>'+self._data.record.vcard.phone);

            // Tags
            self._component.details.body.vcard.tags.object.empty();
            for(const [k, unique] of Object.entries(self._data.record.vcard.tags ?? [])){
                $(document.createElement('span')).attr({
                    'class': 'badge text-bg-warning text-start text-wrap m-1',
                    'style': 'font-size: 0.8rem; max-width: 250px;',
                }).html('<i class="me-1 bi bi-tag"></i>'+unique).appendTo(self._component.details.body.vcard.tags.object);
            }

            // Industries
            self._component.details.body.vcard.industries.object.empty();
            for(const [k, unique] of Object.entries(self._data.record.vcard.industries ?? [])){
                $(document.createElement('span')).attr({
                    'class': 'badge text-bg-primary text-start text-wrap m-1',
                    'style': 'font-size: 0.8rem; max-width: 250px;',
                }).html('<i class="me-1 bi bi-crosshair"></i>'+unique).appendTo(self._component.details.body.vcard.industries.object);
            }
        }

        // Task
        if(self._data.extensions.includes('tasks')){

            // Assigned To
            self._component.details.body.task.assignedTo.object.username.text(self._data.record.task.assignedTo.username ?? self._builder.Locale.get('Unassigned'));
            self._component.details.body.task.assignedTo.object.avatar.attr({
                "src": "/avatar?username="+(self._data.record.task.assignedTo.username ?? 'Unassigned'),
            });

            // Status
            self._component.details.body.task.progress.badge.removeClass(function (index, className) {
                return (className.match(/(^|\s)text-bg-\S+/g) || []).join(' ');
            })
            if(self._data.record.task.progress > 0){
                self._component.details.body.task.progress.badge.addClass('text-bg-'+self._data.record.task.process[self._data.record.task.progress].color);
                self._component.details.body.task.progress.badge.html('<i class="me-1 bi bi-'+self._data.record.task.process[self._data.record.task.progress].icon+'"></i>'+self._builder.Locale.get(self._data.record.task.process[self._data.record.task.progress].name));
            } else {
                self._component.details.body.task.progress.badge.addClass('text-bg-success');
                self._component.details.body.task.progress.badge.html('<i class="me-1 bi bi-stars"></i>'+builder.Locale.get('New'));
            }

            // Priority
            self._component.details.body.task.priority.badge.removeClass(function (index, className) {
                return (className.match(/(^|\s)text-bg-\S+/g) || []).join(' ');
            }).addClass('text-bg-'+self._priorities[self._data.record.task.priority].color).html('<i class="me-1 bi bi-'+self._priorities[self._data.record.task.priority].icon+'"></i>'+self._builder.Locale.get(self._priorities[self._data.record.task.priority].name));

            // Update the Widget
            // self._widgets.tasks.load(self._data.task ?? {});
        }

        // Notes
        if(self._data.extensions.includes('notes')){
            self._widgets.notes.load(self._data.dependencies.notes ?? {});
        }

        // Contacts
        if(self._data.extensions.includes('contacts')){
            self._widgets.contacts.load(self._data.dependencies.contacts ?? {});
        }

        // Followups
        if(self._data.extensions.includes('followups')){
            self._widgets.followups.calls.load(self._data.dependencies.followups ?? {});
            self._widgets.followups.callbacks.load(self._data.dependencies.followups ?? {});
            self._widgets.followups.meetings.load(self._data.dependencies.followups ?? {});
        }

        // Event
        if(self._data.extensions.includes('event')){
            self._widgets.event.load(self._data.dependencies.event ?? {});
        }

        // Relationship
        if(self._data.extensions.includes('relationship')){
            self._widgets.relationship.load(self._data.dependencies.relationship ?? {});
        }
    }
});

builder.add('widgets','importers', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            data: null,
            table: 'importers',
            callback: {},
        };
        this._color = ['secondary','primary','warning','orange','danger'];
        this._name = ['Low','Normal','High','Urgent','Critical'];
        this._icon = ['exclamation-triangle','info-circle','exclamation-circle','exclamation-diamond','exclamation-square'];
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'importers' + this._id,
            'class': 'importers-widget',
        });
        this._component.id = this._component.attr('id');

        // Check if a component class is set
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }
    }

    create(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                onEnter: false,
                icon: "plus-lg",
                title: this._builder.Locale.get("New Prospect"),
                color: 'success',
                size: "xl",
                callback: {
                    load: function(component, modal){
                        return new Promise((resolve, reject) => {
                            try {
                                // Set the parent
                                const parent = component.dialog;

                                // Retrieve the libraries
                                API.endpoint('/library/fetch').execute(function(library){

                                    // Create the Form
                                    self._builder.Utility(
                                        'form',
                                        component.body,
                                        {
                                            class:{
                                                component: 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3',
                                            },
                                            callback: {
                                                submit: function(form){

                                                    // Show the modal spinner
                                                    modal.spinner(true);

                                                    // AJAX request to create the record
                                                    API.endpoint('/importers/create').data(form.val()).execute(function(response){

                                                        // Check if the callback is defined and execute it
                                                        if(typeof callback === 'function'){
                                                            callback(response);
                                                        }

                                                        // Close the modal
                                                        modal.hide();
                                                    },function(){
                                                        modal.hide();
                                                    });
                                                },
                                            }
                                        },
                                        function(form,component){

                                            // Add event listener on the modal submit button
                                            parent.content.footer.submit.click(function(e){
                                                e.preventDefault();
                                                e.stopPropagation();
                                                form.submit();
                                            });

                                            // name
                                            form.add(
                                                'text',
                                                {
                                                    name: 'name',
                                                    label: self._builder.Locale.get('Name'),
                                                    placeholder: self._builder.Locale.get('Enter name'),
                                                    required: true,
                                                    class: {
                                                        component: 'col-12',
                                                        label: 'text-bg-primary',
                                                    },
                                                }
                                            );
                                            // dba
                                            form.add(
                                                'text',
                                                {
                                                    name: 'dba',
                                                    label: self._builder.Locale.get('DBA'),
                                                    placeholder: self._builder.Locale.get('Enter doing business as'),
                                                    class: {
                                                        component: 'col-12',
                                                    },
                                                }
                                            );
                                            // address
                                            form.add(
                                                'text',
                                                {
                                                    name: 'address',
                                                    label: self._builder.Locale.get('Address'),
                                                    placeholder: self._builder.Locale.get('Enter address'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-7',
                                                    },
                                                }
                                            );
                                            // city
                                            form.add(
                                                'text',
                                                {
                                                    name: 'city',
                                                    label: self._builder.Locale.get('City'),
                                                    placeholder: self._builder.Locale.get('Enter city'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-5',
                                                    },
                                                }
                                            );
                                            // country
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'country',
                                                    label: self._builder.Locale.get('Country'),
                                                    placeholder: self._builder.Locale.get('Select country'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                    options: library.options.countries,
                                                    callback: {
                                                        onChange: function(input, component){

                                                            // Check if the state input exists
                                                            if(!form._inputs.state){
                                                                return;
                                                            }

                                                            // Clear the state select2 options
                                                            form._inputs.state.delete();

                                                            // Add the new options based on the selected country
                                                            for(const [key, option] of Object.entries(library.options.states[input.val()] || [])){
                                                                form._inputs.state.add(option.id, option.text);
                                                            }

                                                            // Reset the state value
                                                            form._inputs.state.reset();
                                                        }
                                                    },
                                                }
                                            );
                                            // state
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'state',
                                                    label: self._builder.Locale.get('State'),
                                                    placeholder: self._builder.Locale.get('Select state'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                    options: [],
                                                }
                                            );
                                            // zipcode
                                            form.add(
                                                'zipcode',
                                                {
                                                    name: 'zipcode',
                                                    label: self._builder.Locale.get('Zipcode'),
                                                    placeholder: self._builder.Locale.get('Enter zipcode'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // email
                                            form.add(
                                                'email',
                                                {
                                                    name: 'email',
                                                    label: self._builder.Locale.get('Email'),
                                                    placeholder: self._builder.Locale.get('Enter email'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-8',
                                                    },
                                                }
                                            );
                                            // fax
                                            form.add(
                                                'phone',
                                                {
                                                    name: 'fax',
                                                    label: self._builder.Locale.get('Fax'),
                                                    placeholder: self._builder.Locale.get('Enter fax'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // phone
                                            form.add(
                                                'phoneExt',
                                                {
                                                    name: 'phone',
                                                    label: self._builder.Locale.get('Phone'),
                                                    placeholder: self._builder.Locale.get('Enter phone'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // mobile
                                            form.add(
                                                'phone',
                                                {
                                                    name: 'mobile',
                                                    label: self._builder.Locale.get('Mobile'),
                                                    placeholder: self._builder.Locale.get('Enter mobile'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // tollfree
                                            form.add(
                                                'phoneInt',
                                                {
                                                    name: 'tollfree',
                                                    label: self._builder.Locale.get('Tollfree'),
                                                    placeholder: self._builder.Locale.get('Enter tollfree'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // businessNumber
                                            form.add(
                                                'businessNumber',
                                                {
                                                    name: 'businessNumber',
                                                    label: self._builder.Locale.get('Business Number'),
                                                    placeholder: self._builder.Locale.get('Enter business number'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // importerExtension
                                            form.add(
                                                'importerExtension',
                                                {
                                                    name: 'importerExtension',
                                                    label: self._builder.Locale.get('Importer Extension'),
                                                    placeholder: self._builder.Locale.get('Enter importer extension (RM000N)'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // taxExtension
                                            form.add(
                                                'taxExtension',
                                                {
                                                    name: 'taxExtension',
                                                    label: self._builder.Locale.get('Tax Extension'),
                                                    placeholder: self._builder.Locale.get('Enter tax extension (RT000N)'),
                                                    class: {
                                                        component: 'col-12 col-md-6 col-lg-4',
                                                    },
                                                }
                                            );
                                            // locale
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'locale',
                                                    label: self._builder.Locale.get('Locale'),
                                                    placeholder: self._builder.Locale.get('Select locale'),
                                                    value: builder.Locale.current(),
                                                    class: {
                                                        component: 'col-12 col-md-6',
                                                    },
                                                    options: library.options.locales,
                                                }
                                            );
                                            // website
                                            form.add(
                                                'text',
                                                {
                                                    name: 'website',
                                                    label: self._builder.Locale.get('Website'),
                                                    placeholder: self._builder.Locale.get('Enter website'),
                                                    class: {
                                                        component: 'col-12 col-md-6',
                                                    },
                                                }
                                            );
                                            // industries
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'industries',
                                                    label: self._builder.Locale.get('Industries'),
                                                    placeholder: self._builder.Locale.get('Select industry(s)'),
                                                    class: {
                                                        component: 'col-12',
                                                    },
                                                    multiple: true,
                                                    options: library.options.industries,
                                                    allowClear: true,
                                                    allowNew: true,
                                                }
                                            );
                                            // tags
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'tags',
                                                    label: self._builder.Locale.get('Tags'),
                                                    placeholder: self._builder.Locale.get('Select tag(s)'),
                                                    class: {
                                                        component: 'col-12',
                                                    },
                                                    multiple: true,
                                                    options: library.options.tags,
                                                    allowClear: true,
                                                    allowNew: true,
                                                }
                                            );

                                            // Resolve the promise
                                            resolve();
                                        },
                                    );
                                },function(xhr, status, error){
                                    reject(error);
                                });
                            } catch(e) { reject(e); }
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }

    import(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "database-up",
                title: this._builder.Locale.get("Import Wizard"),
                color: 'teal',
                size: "xl",
                callback: {
                    submit: function(element,modal){

                        // Set Constants
                        const stepper = element.stepper;
                        const options = element.options;
                        const step = element.steps[element.current];
                        const form = step.form;

                        // Check the current step
                        switch(element.current){
                            case 'upload':
                                form.val().file.then(data => {
                                    // Check if a file was selected
                                    if(data.length > 0){

                                        // Select the file
                                        const file = data[Object.keys(data)[0]];

                                        // Generate a md5 checksum
                                        self._builder.Helper.md5(file.content.split(',')[1],function(checksum){

                                            // Save the checksum
                                            file.checksum = checksum;

                                            // Set additional properties
                                            file.targetTable = "importers";
                                            file.isPublic = 1;

                                            // Check if the file is empty or if the file type is not supported
                                            if(file.json.length === 0){
                                                form.input('file').invalid(self._builder.Locale.get('The selected file is empty. Please select a valid file to proceed.'));
                                            } else {

                                                // Loop through the columns
                                                for(const [key, value] of Object.entries(file.json[Object.keys(file.json)[0]])){
                                                    options.push({id:key,text:key + ' - ' + value});
                                                }

                                                // Save the file in the step
                                                step.file = file;

                                                // Navigate to the next step
                                                stepper.next();
                                            }
                                        });
                                    } else {
                                        form.input('file').invalid(self._builder.Locale.get('Please select a file to proceed.'));
                                    }
                                }).catch(error => {
                                    console.error('Error reading files:', error);
                                    form.input('file').invalid(error)
                                });
                                return;
                            case 'prospects':
                                if(form.val().name && form.val().name !== 'none'){
                                    stepper.next();
                                } else {
                                    form.input('name').invalid(self._builder.Locale.get('Please select a field for Name to proceed.'));
                                }
                                return;
                            case 'contacts':
                                const promises = [];
                                const prospects = [];
                                for(const [key, record] of Object.entries(element.steps.upload.file.json)){
                                    const prospect = {};
                                    for(const [column, map] of Object.entries(element.steps.prospects.form.val())){
                                        prospect[column] = record[map] || null;
                                        if(prospect[column] === null || prospect[column] === ''){
                                            delete prospect[column];
                                        }
                                    }
                                    prospect.contacts = [];
                                    for(const [id, inputs] of Object.entries(form)){
                                        const contact = {};
                                        for(const [column, map] of Object.entries(inputs.val())){
                                            contact[column] = record[map] || null;
                                            if(contact[column] === null || contact[column] === ''){
                                                delete contact[column];
                                            }
                                        }
                                        if(typeof contact.role !== 'undefined' && contact.role){
                                            contact.role = contact.role.split(',').map(value => value.trim());
                                        }
                                        if(typeof contact.name !== 'undefined' && contact.name){
                                            prospect.contacts.push(contact);
                                        }
                                    }
                                    if(typeof prospect.tags !== 'undefined' && prospect.tags){
                                        prospect.tags = prospect.tags.split(',').map(value => value.trim());
                                    }
                                    if(typeof prospect.industries !== 'undefined' && prospect.industries){
                                        prospect.industries = prospect.industries.split(',').map(value => value.trim());
                                    }
                                    if(typeof prospect.name !== 'undefined' && prospect.name){
                                        prospects.push(prospect);
                                    }
                                }
                                for(const [key, prospect] of Object.entries(prospects)){
                                    promises.push(function(bar){
                                        return new Promise((res, rej) => {
                                            API.endpoint('/importers/create').data(prospect).execute(function(response){
                                                bar.removeClass('text-bg-success text-bg-danger').addClass('text-bg-primary');
                                                if(prospect.contacts.length){
                                                    for(const [key, contact] of Object.entries(prospect.contacts)){
                                                        contact.targetTable = 'importers';
                                                        contact.targetId = response.record.id;
                                                        API.endpoint('/contacts/create').data(contact).execute(function(response){
                                                            bar.removeClass('text-bg-success text-bg-danger').addClass('text-bg-primary');
                                                            res();
                                                        },function(xhr, status, error){
                                                            bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                            rej(error);
                                                        });
                                                    }
                                                } else {
                                                    res();
                                                }
                                                if(typeof callback === 'function'){
                                                    callback(response);
                                                }
                                            },function(xhr, status, error){
                                                bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                rej(error);
                                            });
                                        });
                                    });
                                }
                                modal.spinner(true);
                                self._loader('teal', promises, function(){

                                    // Close the modal
                                    modal.hide();
                                });
                                return;
                        }
                    },
                },
            },
            function(modal,component){

                // Set the parent
                const parent = component;

                // Styling
                parent.body.addClass('p-0');
                parent.body.controls = $(document.createElement('div')).addClass('p-3 py-2').appendTo(parent.body);
                parent.current = 'upload';
                parent.options = [];

                // Create the Stepper
                self._builder.Component(
                    'stepper',
                    component.body,
                    {
                        class: {
                            control: 'rounded-pill',
                            content: 'p-3 py-2',
                        },
                    },
                    function(stepper, component){

                        // Set the stepper in the element for later use
                        parent.stepper = stepper;
                        parent.steps = {};

                        // Styling
                        component.controls.appendTo(parent.body.controls);
                        component.pagination.addClass('d-none');

                        stepper.add(
                            {
                                label: self._builder.Locale.get('Upload'),
                                icon: 'upload',
                                class: {
                                    content: 'bg-gray-200 border-top',
                                },
                            },
                            function(step){
                                step.control.attr('data-bs-toggle', null);
                                step.content.on('show.bs.collapse', function () {
                                    parent.current = 'upload';
                                });
                                step.form = self._builder.Utility(
                                    'form',
                                    step.content,
                                    {},
                                    function(form,component){

                                        // Upload
                                        form.add(
                                            'excel',
                                            {
                                                name: 'file',
                                                placeholder: self._builder.Locale.get('Select file'),
                                            }
                                        );
                                    },
                                );
                                parent.steps.upload = step;
                            }
                        );
                        stepper.add(
                            {
                                label: self._builder.Locale.get('Prospects'),
                                icon: 'building',
                                class: {
                                    content: 'bg-gray-200 border-top',
                                },
                            },
                            function(step){
                                step.control.attr('data-bs-toggle', null);
                                step.content.on('show.bs.collapse', function () {
                                    parent.current = 'prospects';
                                    for(const [name, input] of Object.entries(step.form._inputs)){
                                        input.delete();
                                        for(const [key, option] of Object.entries(parent.options)){
                                            input.add(option.id, option.text);
                                        }
                                        input.val(name);
                                    }
                                });
                                step.form = self._builder.Utility(
                                    'form',
                                    step.content,
                                    {
                                        class: {
                                            component: 'row g-3',
                                        },
                                    },
                                    function(form,component){

                                        // Create a form to map the columns
                                        for(const [key, column] of Object.entries(['name', 'dba', 'address', 'city', 'country', 'state', 'zipcode', 'email', 'fax', 'phone', 'mobile', 'tollfree', 'businessNumber', 'importerExtension', 'taxExtension', 'locale', 'website', 'industries', 'tags'])){

                                            // Create the select2
                                            form.add(
                                                'select2',
                                                {
                                                    name: column,
                                                    label: self._builder.Locale.get(self._builder.Helper.ucwords(column)),
                                                    placeholder: self._builder.Locale.get('Select a field'),
                                                    options: parent.options,
                                                    value: column,
                                                    required: (column === 'name'),
                                                    class: {
                                                        component: (column === 'name') ? 'col-12' : 'col-12 col-md-6',
                                                        label: (column === 'name') ? 'text-bg-primary' : '',
                                                    },
                                                }
                                            );
                                        }
                                    },
                                );
                                parent.steps.prospects = step;
                            }
                        );
                        stepper.add(
                            {
                                label: self._builder.Locale.get('Contacts'),
                                icon: 'person-vcard',
                                class: {
                                    content: '',
                                },
                            },
                            function(step){
                                step.control.attr('data-bs-toggle', null);
                                step.content.on('show.bs.collapse', function () {
                                    parent.current = 'contacts';
                                    for(const [id, form] of Object.entries(step.form)){
                                        for(const [name, input] of Object.entries(form._inputs)){
                                            input.delete();
                                            for(const [key, option] of Object.entries(parent.options)){
                                                input.add(option.id, option.text);
                                            }
                                            if(['name','title','role','email','phone','mobile'].includes(name)){
                                                input.val('c'+(parseInt(id) + 1)+'.'+name);
                                            } else {
                                                if(typeof parent.steps.prospects.form.val()[name] !== 'undefined'){
                                                    input.val(parent.steps.prospects.form.val()[name]);
                                                } else {
                                                    input.val(name);
                                                }
                                            }
                                        }
                                    }
                                });
                                step.content.removeClass('p-3 py-2');
                                step.content.bar = $(document.createElement('div')).addClass('bg-gray-200 border-top p-3 py-2').appendTo(step.content);
                                step.content.bar.btn = $(document.createElement('button')).attr({
                                    'type': 'button',
                                    'class': 'btn btn-success',
                                }).html('<i class="bi bi-plus-lg"></i>').appendTo(step.content.bar).click(function(){
                                    step.add();
                                });
                                step.content.forms = $(document.createElement('div')).appendTo(step.content);
                                step.form = [];
                                step.add = function(){
                                    step.form.push(
                                        self._builder.Utility(
                                            'form',
                                            $(document.createElement('div')).addClass('border-top p-3 py-2').appendTo(step.content.forms),
                                            {
                                                class: {
                                                    component: 'row g-3',
                                                },
                                            },
                                            function(form,component){

                                                // Create a form to map the columns
                                                for(const [key, column] of Object.entries(['name', 'title', 'role', 'address', 'city', 'country', 'state', 'zipcode', 'email', 'fax', 'phone', 'mobile', 'tollfree', 'locale', 'website'])){

                                                    // Create the select2
                                                    form.add(
                                                        'select2',
                                                        {
                                                            name: column,
                                                            label: self._builder.Locale.get(self._builder.Helper.ucwords(column)),
                                                            placeholder: self._builder.Locale.get('Select a field'),
                                                            options: parent.options,
                                                            required: (column === 'name'),
                                                            class: {
                                                                component: (column === 'name') ? 'col-12' : 'col-12 col-md-6',
                                                                label: (column === 'name') ? 'text-bg-primary' : '',
                                                            },
                                                        },
                                                        function(input){
                                                            if(['name','title','role','email','phone','mobile'].includes(column)){
                                                                input.val('c'+parseInt(step.form.length)+'.'+column);
                                                            } else {
                                                                if(typeof parent.steps.prospects.form.val()[column] !== 'undefined'){
                                                                    input.val(parent.steps.prospects.form.val()[column]);
                                                                } else {
                                                                    input.val(column);
                                                                }
                                                            }
                                                        }
                                                    );
                                                }
                                            },
                                        )
                                    );
                                };
                                parent.steps.contacts = step;
                            }
                        );
                    }
                );

                // Show the modal
                modal.show();
            },
        );
    }

    link(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No importer data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "link-45deg",
                title: this._builder.Locale.get("Are you sure?"),
                body: this._builder.Locale.get("You are about to link the selected records together. Are you sure you want to continue?"),
                color: 'info',
                callback: {
                    submit: function(element,modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // Create an array to hold promises
                        const promises = [];



                        // Create a promise for each record
                        for(const [key, current] of Object.entries(self._properties.data)){

                            // Loop through the records
                            for(const [k, record] of Object.entries(self._properties.data)){

                                // Skip current record
                                if(current.id != record.id){

                                    // Create the promise
                                    promises.push(function(bar){
                                        return new Promise((res, rej) => {

                                            // AJAX Request
                                            API.endpoint('/relationship/create').data({
                                                "sourceTable": self._properties.table ?? 'importers',
                                                "sourceId": current.id,
                                                "targetTable": self._properties.table ?? 'importers',
                                                "targetId": record.id,
                                            }).execute(function(response){
                                                bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                res();
                                            },function(xhr, status, error){
                                                bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                rej(error);
                                            });
                                        });
                                    });
                                }
                            }
                        }

                        // Execute the promises with loader
                        self._loader('info', promises, function(){

                            // Check if a callback is provided
                            if (typeof callback === 'function') {
                                callback(self._properties.data);
                            }

                            // Close the modal
                            modal.hide();
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }

    assign(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No importer data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-plus",
                title: this._builder.Locale.get("Assign user"),
                color: 'warning',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

                                // Retrieve members
                                API.endpoint('/auth/users').execute(function(response){
                                    const members = response.records;
                                    const options = [];
                                    for(const [id, member] of Object.entries(members)){
                                        options.push({id: id, text: member.username});
                                    }

                                    // Create the Form
                                    self._builder.Utility(
                                        'form',
                                        component.body,
                                        {
                                            callback: {
                                                submit: function(form){

                                                    // Show the modal spinner
                                                    modal.spinner(true);

                                                    // Create an array to hold promises
                                                    const promises = [];

                                                    // Create a promise for each record
                                                    for(const [key, record] of Object.entries(self._properties.data)){
                                                        promises.push(function(bar){
                                                            return new Promise((res, rej) => {

                                                                // AJAX Request
                                                                API.endpoint('/tasks/update?id='+record.task.id).data(form.val()).execute(function(response){
                                                                    bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                                    self._properties.data[key].task = response.record;
                                                                    res();
                                                                },function(xhr, status, error){
                                                                    bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                                    rej(error);
                                                                });
                                                            });
                                                        });
                                                    }

                                                    // Execute the promises with loader
                                                    self._loader('warning', promises, function(){

                                                        // Check if a callback is provided
                                                        if (typeof callback === 'function') {
                                                            callback(self._properties.data);
                                                        }

                                                        // Close the modal
                                                        modal.hide();
                                                    });
                                                },
                                            }
                                        },
                                        function(form,component){

                                            // Add event listener on the modal submit button
                                            parent.dialog.content.footer.submit.click(function(e){
                                                e.preventDefault();
                                                e.stopPropagation();
                                                form.submit();
                                            });

                                            // assignedTo
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'assignedTo',
                                                    label: self._builder.Locale.get('User'),
                                                    placeholder: self._builder.Locale.get('Select a user'),
                                                    class: {
                                                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                    },
                                                    options: options,
                                                }
                                            );

                                            // Resolve the promise
                                            resolve();
                                        },
                                    );
                                },function(xhr, status, error){
                                    modal.hide();
                                    reject(error);
                                });
                            } catch(e) {

                                // Log the error and reject the promise
                                console.error('Error in assign modal:', e);
                                modal.hide();
                                reject(e);
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    priority(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No importer data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "exclamation-triangle",
                title: this._builder.Locale.get("Change priority"),
                color: 'primary',
                callback: {
                    load: function(component, modal){

                        // Set the component
                        const parent = component;

                        // Promise to fetch data
                        return new Promise((resolve, reject) => {
                            try {

                                // Create the Form
                                self._builder.Utility(
                                    'form',
                                    component.body,
                                    {
                                        callback: {
                                            submit: function(form){

                                                // Show the modal spinner
                                                modal.spinner(true);

                                                // Create an array to hold promises
                                                const promises = [];

                                                // Create a promise for each record
                                                for(const [key, record] of Object.entries(self._properties.data)){
                                                    promises.push(function(bar){
                                                        return new Promise((res, rej) => {

                                                            // AJAX Request
                                                            API.endpoint('/tasks/update?id='+record.task.id).data(form.val()).execute(function(response){
                                                                bar.removeClass('text-bg-danger text-bg-success').addClass('text-bg-primary');
                                                                self._properties.data[key].task = response.record;
                                                                res();
                                                            },function(xhr, status, error){
                                                                bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                                                rej(error);
                                                            });
                                                        });
                                                    });
                                                }

                                                // Execute the promises with loader
                                                self._loader('primary', promises, function(){

                                                    // Check if a callback is provided
                                                    if (typeof callback === 'function') {
                                                        callback(self._properties.data);
                                                    }

                                                    // Close the modal
                                                    modal.hide();
                                                });
                                            },
                                        }
                                    },
                                    function(form,component){

                                        // Add event listener on the modal submit button
                                        parent.dialog.content.footer.submit.click(function(e){
                                            e.preventDefault();
                                            e.stopPropagation();
                                            form.submit();
                                        });

                                        // assignedTo
                                        form.add(
                                            'select2',
                                            {
                                                name: 'priority',
                                                label: self._builder.Locale.get('Level'),
                                                placeholder: self._builder.Locale.get('Select a level'),
                                                class: {
                                                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                },
                                                options: [
                                                    {id: 0, text: self._builder.Locale.get(self._name[0])},
                                                    {id: 1, text: self._builder.Locale.get(self._name[1])},
                                                    {id: 2, text: self._builder.Locale.get(self._name[2])},
                                                    {id: 3, text: self._builder.Locale.get(self._name[3])},
                                                    {id: 4, text: self._builder.Locale.get(self._name[4])},
                                                ],
                                            }
                                        );

                                        // Resolve the promise
                                        resolve();
                                    },
                                );
                            } catch(e) {

                                // Log the error and reject the promise
                                console.error('Error in assign modal:', e);
                                modal.hide();
                                reject(e);
                            }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    archive(callback = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No importer data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "archive",
                title: this._builder.Locale.get("Are you sure?"),
                body: this._builder.Locale.get("You are about to archive this task(s). Are you sure you want to continue?"),
                color: 'dark',
                callback: {
                    submit: function(element,modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // Create an array to hold promises
                        const promises = [];

                        // Create a promise for each record
                        for(const [key, record] of Object.entries(self._properties.data)){
                            promises.push(function(bar){
                                return new Promise((res, rej) => {

                                    // AJAX Request
                                    API.endpoint('/tasks/archive?id='+record.task.id).execute(function(response){
                                        bar.removeClass('text-bg-success text-bg-danger').addClass('text-bg-primary');
                                        res();
                                    },function(xhr, status, error){
                                        bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                        rej(error);
                                    });
                                });
                            });
                        }

                        // Execute the promises with loader
                        self._loader('dark', promises, function(){

                            // Check if a callback is provided
                            if (typeof callback === 'function') {
                                callback(self._properties.data);
                            }

                            // Close the modal
                            modal.hide();
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }

    promote(callback = null, progress = null){

        // Set Self
        const self = this;

        // Check if data is available
        if(!this._properties.data || (Array.isArray(this._properties.data) && this._properties.data.length === 0) || (typeof this._properties.data === "object" && Object.keys(this._properties.data).length === 0)){
            console.error('No importer data available to assign.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "chevron-bar-right",
                title: this._builder.Locale.get("Are you sure?"),
                body: this._builder.Locale.get("You are about to promote these tasks. Are you sure you want to continue?"),
                color: 'purple',
                callback: {
                    submit: function(element,modal){

                        // Show the modal spinner
                        modal.spinner(true);

                        // Create an array to hold promises
                        const promises = [];

                        // Create a promise for each record
                        for(const [key, record] of Object.entries(self._properties.data)){
                            promises.push(function(bar){
                                return new Promise((res, rej) => {

                                    // AJAX Request
                                    API.endpoint('/tasks/promote?id='+record.task.id).data({progress: progress ?? (record.task.progress + 1)}).execute(function(response){
                                        bar.removeClass('text-bg-success text-bg-danger').addClass('text-bg-primary');
                                        res();
                                    },function(xhr, status, error){
                                        bar.removeClass('text-bg-primary text-bg-success').addClass('text-bg-danger');
                                        rej(error);
                                    });
                                });
                            });
                        }

                        // Execute the promises with loader
                        self._loader('purple', promises, function(){

                            // Check if a callback is provided
                            if (typeof callback === 'function') {
                                callback(self._properties.data);
                            }

                            // Close the modal
                            modal.hide();
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }

    _loader(color, promises, callback = null){

        // Set Self
        const self = this;

        // Check if promises contains records
        if(!promises || (Array.isArray(promises) && promises.length === 0) || !Array.isArray(promises) ){
            console.error('No records available to process.');
            return;
        }

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "code-slash",
                title: this._builder.Locale.get("Processing..."),
                color: color,
                cancel: false,
                submit: false,
                static: true,
                size: "lg",
            },
            function(modal,component){

                // Set the parent
                const parent = component;

                // Styling
                component.body.addClass('bg-gray-200 p-3 py-2 rounded-bottom');

                // Create a progress bar
                component.progress = builder.Component(
                    'progress',
                    component.body,
                    {
                        size: '32px',
                        color: 'primary',
                        striped: true,
                        animated: true,
                        scale: promises.length,
                        label: "{percent} completed {progress} of {scale} records processed",
                    },
                    async function(progress,component){

                        // Set default value
                        progress.set(0);

                        // Show the modal
                        modal.show();

                        // Loop through the records
                        for(const [key, promise] of Object.entries(promises)){

                            // Execute the promises sequentially
                            await promise(component.bar);

                            // Set the value
                            progress.set((parseInt(key) + 1));
                        }

                        // Update the color of the progress bar
                        component.bar.removeClass('text-bg-primary text-bg-danger').addClass('text-bg-success');

                        // Check if a callback is provided
                        if (typeof callback === 'function') {
                            callback();
                        }

                        // Timeout to close the modal
                        setTimeout(function(){

                            // Close the modal
                            modal.hide();
                        }, 1000);
                    },
                );
            },
        );
    }
});
