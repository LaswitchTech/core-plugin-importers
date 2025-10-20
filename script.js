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
