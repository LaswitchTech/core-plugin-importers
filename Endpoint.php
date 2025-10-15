<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseEndpoint;

class ImportersEndpoint extends BaseEndpoint {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Endpoint
        $this->init('importers');

        // Set Properties
        $this->required = ['client','lead','vcard'];
    }

    /**
     * Retrieve a record
     */
    public function fetchAction(): array
    {
        // Call the parent constructor
        $message = parent::fetchAction();

        // Check if the records is accessible
        if($message['status'] == 200){

            // Check if the vCards Plugin is accessible
            if($this->Helper->Core->isInstalled('vcards')){
                $message['data']['record']['vcard'] = $this->Model->Vcards->fetch(intval($message['data']['record']['vcard']['id']));
            }

            // Check if the Tasks Plugin is accessible
            if($this->Helper->Core->isInstalled('tasks')){
                $message['data']['record']['task'] = $this->Model->Tasks->fetch(intval($message['data']['record']['task']['id']));
            }

            // Check if the Relationship Plugin is accessible
            if($this->Helper->Core->isInstalled('relationship')){
                $message['data']['dependencies']['relationship'] = $this->Model->Relationship->get($this->basename, $message['data']['record']['id']);
                if($this->Helper->Core->isInstalled('vcards') && array_key_exists('vcard', $message['data']['record'])){
                    $message['data']['dependencies']['relationship'] = array_merge(
                        $message['data']['dependencies']['relationship'],
                        $this->Model->Relationship->get('vcards', $message['data']['record']['vcard']['id'])
                    );
                }
            }

            // Check if the Contacts is accessible
            if($this->Helper->Core->isInstalled('contacts')){
                $message['data']['dependencies']['contacts'] = $this->Model->Contacts->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
                if($this->Helper->Core->isInstalled('clients') && !is_null($message['data']['record']['client']['id'])){
                    $message['data']['dependencies']['contacts'] = array_merge($message['data']['dependencies']['contacts'], $this->Model->Contacts->fetchAll([
                        ["key" => "targetTable", "operator" => "=", "value" => "clients"],
                        ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['client']['id']],
                        ["key" => "isArchived", "operator" => "<>", "value" => 1],
                    ]));
                }
            }

            // Check if the Documents is accessible
            if($this->Helper->Core->isInstalled('documents')){
                $message['data']['dependencies']['documents'] = $this->Model->Documents->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
                if($this->Helper->Core->isInstalled('clients') && !is_null($message['data']['record']['client']['id'])){
                    $message['data']['dependencies']['documents'] = array_merge($message['data']['dependencies']['documents'], $this->Model->Documents->fetchAll([
                        ["key" => "targetTable", "operator" => "=", "value" => "clients"],
                        ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['client']['id']],
                        ["key" => "isArchived", "operator" => "<>", "value" => 1],
                    ]));
                }
            }

            // Check if the Events is accessible
            if($this->Helper->Core->isInstalled('event')){
                $message['data']['dependencies']['event'] = $this->Model->Event->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
            }

            // Check if the Files is accessible
            if($this->Helper->Core->isInstalled('files')){
                $message['data']['dependencies']['files'] = $this->Model->Files->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
            }

            // Check if the Followups is accessible
            if($this->Helper->Core->isInstalled('followups')){
                $message['data']['dependencies']['followups'] = $this->Model->Followups->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "task.isArchived", "operator" => "<>", "value" => 1],
                ]);
            }

            // Check if the Notes is accessible
            if($this->Helper->Core->isInstalled('notes')){
                $message['data']['dependencies']['notes'] = $this->Model->Notes->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
            }

            // Check if the Services is accessible
            if($this->Helper->Core->isInstalled('services')){
                $message['data']['dependencies']['services'] = $this->Model->Services->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
                if($this->Helper->Core->isInstalled('clients') && !is_null($message['data']['record']['client']['id'])){
                    $message['data']['dependencies']['services'] = array_merge($message['data']['dependencies']['services'], $this->Model->Services->fetchAll([
                        ["key" => "targetTable", "operator" => "=", "value" => "clients"],
                        ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['client']['id']],
                        ["key" => "isArchived", "operator" => "<>", "value" => 1],
                    ]));
                }
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Create a record
     */
    public function createAction(): array
    {
        // Call the parent constructor
        $message = parent::createAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Retrieve the parameters
            $parameters = $message['data']['parameters'];

            // Initialize the fields array
            $fields = [];

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Importer',
                    'message' => 'New Importer Created for <vcard>'.$message['data']['record']['vcard']['name'].'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                    'targetTable' => 'importers',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if the Clients Plugin is accessible
            if($this->Helper->Core->isInstalled('clients')){

                // Add the importer to the client
                $this->Model->Clients->update($message['data']['record']['client']['id'],['importer' => $message['data']['record']['id']]);
            }

            // Check if the Tasks Plugin is accessible
            if($this->Helper->Core->isInstalled('tasks')){

                // Initialize the record
                $record = [];

                // Retrieve the importer process
                $process = $this->Model->Process->fetchByTable('importers');
                $record['process'] = $process['process'];

                // Complete the task record
                $record['label'] = 'Progress on <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard>';
                $record['category'] = 'Importer';
                $record['progress'] = 0;
                $record['scale'] = count($record['process']);
                $record['color'] = 'primary';
                $record['link'] = '/importer/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']);
                $record['isActive'] = 0;
                $record['due'] = date('Y-m-d H:i:s');
                $record['targetTable'] = 'importers';
                $record['targetId'] = $message['data']['record']['id'];

                // Create the task
                $fields['task'] = $this->Model->Tasks->create($record);

                // Check if the Event Plugin is accessible
                if($this->Helper->Core->isInstalled('event')){

                    // Setup a new event
                    $event = [
                        'category' => 'Task',
                        'message' => 'New Task Created for <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard>',
                        'icon' => 'circle',
                        'color' => 'secondary',
                        'link' => '/importer/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                        'targetTable' => 'importers',
                        'targetId' => $message['data']['record']['id'],
                    ];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);

                    // Setup a new event for the task
                    $event['link'] = '/tasks/index?id='.$fields['task'];
                    $event['targetTable'] = 'tasks';
                    $event['targetId'] = $fields['task'];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);
                }
            }

            // Check if the Relationship Plugin is accessible
            if($this->Helper->Core->isInstalled('relationship')){

                // Create the relationship with the lead
                $this->Model->Relationship->create(
                    'leads',
                    $message['data']['record']['lead']['id'],
                    $this->basename,
                    $message['data']['record']['id'],
                );
                $this->Model->Relationship->create(
                    $this->basename,
                    $message['data']['record']['id'],
                    'leads',
                    $message['data']['record']['lead']['id'],
                );

                // Create the relationship with the client
                $this->Model->Relationship->create(
                    'clients',
                    $message['data']['record']['client']['id'],
                    $this->basename,
                    $message['data']['record']['id'],
                );
                $this->Model->Relationship->create(
                    $this->basename,
                    $message['data']['record']['id'],
                    'clients',
                    $message['data']['record']['client']['id'],
                );
            }

            // Check if $fields is empty
            if(!empty($fields)){
                $affectedRows = $this->Model->{$this->name}->update($message['data']['record']['id'], $fields);

                // Check if we send out the notification
                if($affectedRows){

                    // Retrieve the updated record
                    $message['data']['record'] = $this->Model->{$this->name}->fetch($message['data']['record']['id']);
                }
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Update a record
     */
    public function updateAction(): array
    {
        // Call the parent constructor
        $message = parent::updateAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Retrieve the parameters
            $parameters = $message['data']['parameters'];

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Importer',
                    'message' => 'Importer Updated for <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                    'targetTable' => 'importers',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if tags is set
            if($this->Helper->Core->isInstalled('tags') && array_key_exists('tags', $parameters) && is_array($parameters['tags']) && !empty($parameters['tags'])){

                // Loop through the tags
                foreach($parameters['tags'] ?? [] as $key => $tag){

                    // Check if the tag is not empty
                    if(!empty($tag)){

                        // Create the tag
                        $this->Model->Tags->create(['name' => $tag]);
                    }
                }
            }

            // Check if industries is set
            if($this->Helper->Core->isInstalled('industries') && array_key_exists('industries', $parameters) && is_array($parameters['industries']) && !empty($parameters['industries'])){

                // Loop through the industries
                foreach($parameters['industries'] ?? [] as $key => $industry){

                    // Check if the industry is not empty
                    if(!empty($industry)){

                        // Create the industry
                        $this->Model->Industries->create(['name' => $industry]);
                    }
                }
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Delete a record
     */
    public function deleteAction(): array
    {
        // Call the parent constructor
        $message = parent::deleteAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Importer',
                    'message' => 'Importer Deleted for <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                    'targetTable' => 'importers',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if the Clients Plugin is accessible
            if($this->Helper->Core->isInstalled('clients')){

                // Delete the client
                $affectedRows = $this->Model->Clients->delete($message['data']['record']['client']['id']);

                // Check if the Event Plugin is accessible
                if($affectedRows && $this->Helper->Core->isInstalled('event')){

                    // Setup a new event
                    $event = [
                        'category' => 'Client',
                        'message' => 'Client Deleted for <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                        'icon' => 'circle',
                        'color' => 'secondary',
                        'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                        'targetTable' => 'importers',
                        'targetId' => $message['data']['record']['id'],
                    ];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);

                    // Setup a new event for the client
                    $event['link'] = '/crm/clients/index?id='.$message['data']['record']['client']['id'];
                    $event['targetTable'] = 'clients';
                    $event['targetId'] = $message['data']['record']['client']['id'];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);
                }

                // Check if the Tasks Plugin is accessible
                if($this->Helper->Core->isInstalled('tasks')){

                    // Delete the task
                    $affectedRows = $this->Model->Tasks->delete($message['data']['record']['client']['task']);

                    // Check if the Event Plugin is accessible
                    if($affectedRows && $this->Helper->Core->isInstalled('event')){

                        // Setup a new event
                        $event = [
                            'category' => 'Task',
                            'message' => 'Task Deleted for <vcard>'.$fields['vcard'].':'.$parameters['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                            'icon' => 'circle',
                            'color' => 'secondary',
                            'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($parameters['name']),
                            'targetTable' => 'importers',
                            'targetId' => $message['data']['record']['id'],
                        ];

                        // Create the event
                        $message['data']['event'][] = $this->Model->Event->create($event);

                        // Setup a new event for the task
                        $event['link'] = '/tasks/index?id='.$message['data']['record']['client']['task'];
                        $event['targetTable'] = 'tasks';
                        $event['targetId'] = $message['data']['record']['client']['task'];

                        // Create the event
                        $message['data']['event'][] = $this->Model->Event->create($event);
                    }
                }
            }

            // Check if the vCards Plugin is accessible
            if($this->Helper->Core->isInstalled('vcards')){

                // Delete the vCard
                $affectedRows = $this->Model->Vcards->delete($message['data']['record']['vcard']['id']);

                // Check if the Event Plugin is accessible
                if($affectedRows && $this->Helper->Core->isInstalled('event')){

                    // Setup a new event
                    $event = [
                        'category' => 'vCard',
                        'message' => 'vCard Deleted for <vcard>'.$fields['vcard'].':'.$parameters['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                        'icon' => 'circle',
                        'color' => 'secondary',
                        'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($parameters['name']),
                        'targetTable' => 'importers',
                        'targetId' => $message['data']['record']['id'],
                    ];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);
                }
            }

            // Check if the Tasks Plugin is accessible
            if($this->Helper->Core->isInstalled('tasks')){

                // Delete the task
                $affectedRows = $this->Model->Tasks->delete($message['data']['record']['task']['id']);

                // Check if the Event Plugin is accessible
                if($affectedRows && $this->Helper->Core->isInstalled('event')){

                    // Setup a new event
                    $event = [
                        'category' => 'Task',
                        'message' => 'Task Deleted for <vcard>'.$fields['vcard'].':'.$parameters['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                        'icon' => 'circle',
                        'color' => 'secondary',
                        'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($parameters['name']),
                        'targetTable' => 'importers',
                        'targetId' => $message['data']['record']['id'],
                    ];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);

                    // Setup a new event for the task
                    $event['link'] = '/tasks/index?id='.$message['data']['record']['task']['id'];
                    $event['targetTable'] = 'tasks';
                    $event['targetId'] = $message['data']['record']['task']['id'];

                    // Create the event
                    $message['data']['event'][] = $this->Model->Event->create($event);
                }
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Archive a record
     */
    public function archiveAction(): array
    {
        // Retrieve the record
        $record = $this->Model->{$this->name}->fetch(intval($this->Request->getParams('REQUEST','id')));

        // Check if the record is already archived
        if($record['isArchived']){
            return ['status' => 200, 'message' => 'The '.$record.' is already archived.', 'data' => ['record' => $record]];
        }

        // Call the parent constructor
        $message = parent::archiveAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Importer',
                    'message' => 'Importer Archived for <vcard>'.$record['vcard']['id'].':'.$record['vcard']['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/crm/details?id='.$record['id'].'&name='.urlencode($record['vcard']['name']),
                    'targetTable' => 'importers',
                    'targetId' => $record['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Recover a record
     */
    public function recoverAction(): array
    {
        // Call the parent constructor
        $message = parent::recoverAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Importer',
                    'message' => 'Importer Recovered for <vcard>'.$message['data']['record']['vcard']['id'].':'.$message['data']['record']['vcard']['name'].'</vcard> by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/crm/details?id='.$message['data']['record']['id'].'&name='.urlencode($message['data']['record']['vcard']['name']),
                    'targetTable' => 'importers',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }
}
