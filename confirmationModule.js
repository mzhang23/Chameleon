// Create a modular function for showing a confirmation dialog
export function showConfirmation(message, callback) {
    // Display a confirmation dialog
    var isConfirmed = confirm(message);

    // Execute the callback with the user's response
    callback(isConfirmed);
}