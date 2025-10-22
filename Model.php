<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseModel;

class ImportersModel extends BaseModel {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Model
        $this->init('importers');
    }

    /**
     * Initialize the Model
     *
     * @param string $table
     * @param string|null $primary
     * @return void
     */
    protected function init(string $table, ?string $primary = 'id'): void
    {
        // Call the parent init method
        parent::init($table, $primary);

        // Loop through the additional tables to join
        foreach($this->definition as $field => $col){

            // Check if the field contains a dot
            if(strpos($field, '.') === false) continue;

            // Set the table
            $table = in_array(explode('.',$field)[1],['owner', 'assignedTo']) ? 'users' : explode('.',$field)[1] . 's';
            $table = in_array(explode('.',$field)[1],['category']) ? 'categories' : $table;

            // Check if the field is linked to a table
            if(in_array($table, $this->tables)){

                // Initialize the Schema
                $schema = $this->Database->schema()->define($table);

                // Describe the table
                foreach($schema->describe() as $col){

                    // Add the col to the definition
                    $this->definition[$field.'.'.$col['Field']] = $col;
                }
            };
        }
    }

    /**
     * Process a record
     *
     * @param array $record
     * @return array
     */
    protected function process(array $record): array
    {
        // Call the parent constructor
        $record = parent::process($record);

        // Check if the record has a task
        if(array_key_exists('task', $record) && !empty($record['task'])){

            // Process the task
            if(!is_array($record['task']['process'])){
                $record['task']['process'] = json_decode($record['task']['process'] ?? "[]", true);
            }
        }

        // Check if the record has a vcard
        if(array_key_exists('vcard', $record) && !empty($record['vcard'])){

            // Process the vcard
            if(!is_array($record['vcard']['role'])){
                $record['vcard']['role'] = json_decode($record['vcard']['role'] ?? "[]", true);
            }
            if(!is_array($record['vcard']['tags'])){
                $record['vcard']['tags'] = json_decode($record['vcard']['tags'] ?? "[]", true);
            }
            if(!is_array($record['vcard']['industries'])){
                $record['vcard']['industries'] = json_decode($record['vcard']['industries'] ?? "[]", true);
            }
        }

        // Return the processed record
        return $record;
    }

    /**
     * Apply Joins to the Query
     *
     * @param Query $Query
     * @return Query
     */
    protected function joins(object $Query): object
    {
        // Apply Joins
        $Query->join('vcard', 'vcards', 'id')
            ->join('task', 'tasks', 'id')
            ->join('task.assignedTo', 'users', 'id')
            ->join('client', 'clients', 'id')
            ->join('client.task', 'tasks', 'id')
            ->join('lead', 'leads', 'id')
            ->join('lead.task', 'tasks', 'id');

        return $Query;
    }
}
